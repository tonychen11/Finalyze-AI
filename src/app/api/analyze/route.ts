import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/utils/csvParser';
import { writeFileSync, readFileSync } from 'fs';
import * as XLSX from 'xlsx';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Received file upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Read file into a buffer once; convert Excel to CSV if needed
    console.log('📄 Reading uploaded file into buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = file.name || '';
    const fileType = file.type || '';

    const isExcel = /\.xls(x)?$/i.test(fileName) || fileType.includes('spreadsheet') || fileType.includes('excel');

    let csvContent = '';
    if (isExcel) {
      try {
        console.log('📥 Detected Excel file, converting to CSV...');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheet = workbook.SheetNames[0];
        csvContent = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
        console.log('✅ Excel -> CSV conversion complete, csv length:', csvContent.length);
      } catch (ex) {
        console.error('❌ Failed to convert Excel to CSV:', ex);
        return NextResponse.json({ error: 'Failed to parse Excel file' }, { status: 400 });
      }
    } else {
      console.log('📄 Treating upload as CSV/text...');
      csvContent = buffer.toString('utf-8');
    }

    // Parse CSV locally to extract monthly spending and transaction data
    console.log('📄 Parsing CSV content...');
    const csvAnalysis = parseCSV(csvContent);
    console.log('✅ CSV parsed:', {
      transactions: csvAnalysis.transactionCount,
      months: csvAnalysis.monthlySpending.length,
      total: csvAnalysis.totalSpending,
    });

    
    const API_KEY = process.env.GENERATIVE_API_KEY;
    console.log('🔍 DEBUG: API_KEY status:', API_KEY ? '✅ LOADED' : '❌ MISSING');

    // If there's no API key configured, return a mocked response for development
    if (!API_KEY) {
      console.log('⚠️  No API key configured, returning mocked response');
      return NextResponse.json({
        mocked: true,
        monthlySpending: csvAnalysis.monthlySpending,
        transactionCount: csvAnalysis.transactionCount,
        totalSpending: csvAnalysis.totalSpending,
        summary: `Mocked analysis for ${file.name} (size: ${Math.round(file.size / 1024)} KB). Configure GENERATIVE_API_KEY to enable real AI calls.`,
        insights: [
          'Mock insight: Top category is Groceries at $620.50.',
          'Mock insight: You had the highest spending in May at $2,200.'
        ],
        recommendations: [
          'Mock recommendation: Review your dining expenses, which totaled $450.75.',
          'Mock recommendation: Consider setting up budget alerts for discretionary spending.'
        ],
        categorySpending: [
          { name: 'Groceries', value: 620.50 },
          { name: 'Dining', value: 450.75 },
          { name: 'Shopping', value: 380.25 }
        ]
      });
    }

    // Convert CSV content to base64 for inline AI upload
    console.log('📄 Converting CSV content to base64 for AI request...');
    const fileBase64 = Buffer.from(csvContent).toString('base64');
    console.log('✅ CSV converted, base64 length:', fileBase64.length);
    
    // Always use CSV MIME type since we converted Excel to CSV internally
    const mimeType = 'text/csv';
    console.log('📋 MIME type:', mimeType);

    // Use Google's Generative AI REST API with proper format
    // Switch models easily via GEMINI_MODEL env var (gemini-2.5-flash or gemini-3-pro-preview)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    console.log('🌐 Gemini endpoint:', GEMINI_ENDPOINT);

    // Load the prompt based on PROMPT_SOURCE configuration
    let promptTemplate = '';
    const promptSource = process.env.PROMPT_SOURCE || 'file';
    
    if (promptSource === 'env') {
      // Load from environment variable
      promptTemplate = (process.env.GEMINI_PROMPT || '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
      if (!promptTemplate) {
        console.error('❌ PROMPT_SOURCE=env but GEMINI_PROMPT not configured');
        return NextResponse.json(
          { 
            error: 'Configuration error: GEMINI_PROMPT environment variable not set',
            mocked: false,
          },
          { status: 500 }
        );
      }
      console.log('📝 Loaded prompt from environment variable');
    } else {
      // Load from file (default)
      try {
        const promptPath = join(process.cwd(), 'src/prompts/gemini-analysis.txt');
        promptTemplate = readFileSync(promptPath, 'utf-8');
        console.log('📝 Loaded prompt from file');
      } catch (promptErr) {
        console.error('❌ Failed to load prompt file:', promptErr);
        return NextResponse.json(
          { 
            error: 'Configuration error: prompt file not found',
            mocked: false,
          },
          { status: 500 }
        );
      }
    }

    // Build the final prompt with CSV total injected
    const finalPrompt = promptTemplate.replace(
      /{CONTROL_TOTAL}/g,
      `$${csvAnalysis.totalSpending.toFixed(2)}`
    );

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: finalPrompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64,
              },
            },
          ],
        },
      ],
    };

    try {
      console.log('🚀 Calling Gemini API...');
      const fullUrl = `${GEMINI_ENDPOINT}?key=${API_KEY}`;
      console.log('📤 Request body size:', JSON.stringify(requestBody).length, 'bytes');
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Gemini response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Gemini API error:', response.status, error);
        return NextResponse.json(
          { 
            error: 'AI service error', 
            details: error,
            mocked: false, // Explicitly NOT mocked so frontend knows real API failed
          },
          { status: 502 }
        );
      }

      const aiResponse = await response.json();
      console.log('✅ Gemini API response received:');

      // Extract text from Gemini's response structure
      let parsedContent = null;
      try {
        const textContent = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          // Try to extract JSON from the response
          const jsonMatch = textContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('📊 Found JSON in response');
            let jsonStr = jsonMatch[0];
            
            // Try to clean up common JSON issues
            try {
              parsedContent = JSON.parse(jsonStr);
            } catch (firstAttempt: any) {
              console.warn('⚠️  First JSON parse failed, attempting cleanup...');
              
              // Try to fix single quotes to double quotes (only for property names, not in strings)
              jsonStr = jsonStr.replace(/'([^']*)':/g, '"$1":');
              // Fix escaped newlines in strings
              jsonStr = jsonStr.replace(/\\n/g, '\\n').replace(/\n/g, '\\n');
              
              try {
                parsedContent = JSON.parse(jsonStr);
                console.log('✅ Successfully parsed JSON after cleanup');
              } catch (secondAttempt) {
                console.warn('❌ Cleanup failed, original error:', (firstAttempt as Error).message);
                // Log the problematic JSON for debugging
                console.log('📄 Raw JSON string (first 500 chars):');
                console.log(jsonStr.substring(0, 500));
                throw firstAttempt;
              }
            }
            
            console.log('✅ Successfully parsed JSON');
          } else {
            console.warn('⚠️  No JSON found in text content');
          }
        } else {
          console.warn('⚠️  No text content in Gemini response');
        }
      } catch (parseErr) {
        console.warn('❌ Could not parse AI response as JSON:', parseErr);
      }

      console.log('🎉 Returning parsed content:', parsedContent ? 'YES' : 'NO');
      if (parsedContent) {
        console.log('📊 categorizedTransactions:');
        const amounts = parsedContent.debug?.parsedTransactions?.map((t: any) => t.amount) || [];
        //amounts.forEach((amount: number) => console.log(amount));
        
        // Write full response to file for debugging (no truncation)
        try {
          const debugFile = join(process.cwd(), 'debug-response.json');
          const transactionsWithDescriptions = (parsedContent.debug?.parsedTransactions || []).map((t: any) => ({
            amount: t.amount,
            name: t.name
          }));
          const debugContent = {
            ...parsedContent,
            transactionAmountsOnly: amounts
          };
          writeFileSync(debugFile, JSON.stringify(debugContent, null, 2), 'utf-8');
          console.log(`📁 Full response saved to: ${debugFile}`);
        } catch (fileErr) {
          console.warn('⚠️  Could not write debug file:', fileErr);
        }
      }
      return NextResponse.json({
        mocked: false,
        monthlySpending: csvAnalysis.monthlySpending,
        dailySpending: csvAnalysis.dailySpending,
        weeklySpending: csvAnalysis.weeklySpending,
        transactionCount: csvAnalysis.transactionCount,
        totalSpending: csvAnalysis.totalSpending,
        raw: aiResponse,
        parsed: parsedContent,
      });
    } catch (fetchErr) {
      console.error('Fetch error calling Gemini API:', fetchErr);
      return NextResponse.json(
        { 
          error: 'Network error calling AI service',
          details: String(fetchErr),
          mocked: false,
        },
        { status: 500 }
      );
    }
    
  } catch (err) {
    console.error('Server error in /api/analyze:', err);
    return NextResponse.json(
      { error: 'Server error', details: String(err) },
      { status: 500 }
    );
  }
}

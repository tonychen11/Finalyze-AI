'use client';

import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types';
import UploadScreen from '@/components/UploadScreen';
import Dashboard from '@/components/Dashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MOCK_CATEGORY_SPENDING, MOCK_MONTHLY_SPENDING, MOCK_TRANSACTION_COUNT, MOCK_TOTAL_SPENDING } from '@/utils/mockData';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Send the uploaded file to the backend API route for AI analysis.
      const BACKEND = '/api/analyze';
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        backend: BACKEND
      });

      const form = new FormData();
      form.append('file', file);

      const resp = await fetch(BACKEND, {
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server error: ${resp.status} ${txt}`);
      }

      const json = await resp.json();

      // Helper function to extract top category
      const getTopCategory = (categorySpending: any[]) => {
        if (!Array.isArray(categorySpending) || categorySpending.length === 0) {
          return null;
        }
        return categorySpending.reduce((max, cat) => 
          (cat.value > max.value) ? cat : max
        );
      };

      // If the server returned a mocked response (no API key) show it in a simple way.
      if (json.mocked === true) {
        console.log('Using mocked response (no API key configured)');
        const categorySpending = json.categorySpending || MOCK_CATEGORY_SPENDING;
        const monthlySpending = json.monthlySpending || MOCK_MONTHLY_SPENDING;
        const dailySpending = json.dailySpending || [];
        const weeklySpending = json.weeklySpending || [];
        const topCategory = getTopCategory(categorySpending);
        const transactionCount = json.transactionCount || MOCK_TRANSACTION_COUNT;
        const totalSpending = json.totalSpending || MOCK_TOTAL_SPENDING; // Use CSV total if available

        setAnalysisResult({
          categorySpending,
          monthlySpending,
          dailySpending,
          weeklySpending,
          topCategory,
          aiSummary: {
            summary: json.summary || 'Mocked summary',
            insights: json.insights || [],
            recommendations: json.recommendations || [],
          },
          totalSpending,
          transactionCount,
        });
      } else if (json.mocked === false) {
        // Real API was called (mocked explicitly false)
        const parsed = json.parsed;
        
        if (!parsed) {
          // Real API call but no valid response
          setError('API returned no valid data. Check server logs for details.');
          console.error('Gemini API returned invalid response:', json);
          return;
        }

        const aiSummary = {
          summary: parsed.summary || 'No summary available.',
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || [],
        };

        const categorySpending = parsed.categorySpending || MOCK_CATEGORY_SPENDING;
        const monthlySpending = json.monthlySpending || MOCK_MONTHLY_SPENDING; // From CSV parsing
        const dailySpending = json.dailySpending || [];
        const weeklySpending = json.weeklySpending || [];
        const topCategory = getTopCategory(categorySpending);
        const transactionCount = json.transactionCount || MOCK_TRANSACTION_COUNT;
        const totalSpending = json.totalSpending || 0; // Use exact CSV total, not calculated from categories

        setAnalysisResult({
          categorySpending,
          monthlySpending,
          dailySpending,
          weeklySpending,
          topCategory,
          aiSummary,
          totalSpending,
          transactionCount,
        });
        console.log('Successfully received real AI analysis:', parsed);
      } else {
        // Backward compatibility: if mocked flag not set, try to use parsed data
        const parsed = json.parsed || json.raw || {};

        const aiSummary = {
          summary: parsed.summary || parsed.summary_text || 'AI returned no summary.',
          insights: parsed.insights || parsed.recommendations || [],
          recommendations: parsed.recommendations || [],
        } as any;

        const categorySpending = parsed.categorySpending || MOCK_CATEGORY_SPENDING;
        const monthlySpending = json.monthlySpending || MOCK_MONTHLY_SPENDING;
        const dailySpending = json.dailySpending || [];
        const weeklySpending = json.weeklySpending || [];
        const topCategory = getTopCategory(categorySpending);
        const transactionCount = json.transactionCount || MOCK_TRANSACTION_COUNT;
        const totalSpending = json.totalSpending || MOCK_TOTAL_SPENDING; // Use CSV total if available

        setAnalysisResult({
          categorySpending,
          monthlySpending,
          dailySpending,
          weeklySpending,
          topCategory,
          aiSummary,
          totalSpending,
          transactionCount,
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMessage}`);
      console.error('File analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors">
      <header className="w-full max-w-7xl mx-auto mb-8 text-center flex flex-col items-center gap-4">
        <div className="flex justify-center w-full">
          <ThemeToggle />
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white">
          Finalyze <span className="text-blue-600 dark:text-blue-400">AI</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-xl">
          Upload your bank statement to get AI-powered insights.
        </p>
      </header>
      <main className="w-full max-w-7xl mx-auto flex-grow">
        {analysisResult ? (
          <Dashboard result={analysisResult} onReset={handleReset} />
        ) : (
          <UploadScreen onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
        )}
      </main>
      <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Finalyze-AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

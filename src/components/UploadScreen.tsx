'use client';

import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import AnalysisProgress from './AnalysisProgress';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onFileUpload, isLoading, error }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = () => {
    if (selectedFile && !isLoading) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      backgroundColor: 'var(--upload-bg)',
      borderRadius: '20px',
      padding: '40px 32px',
      border: '1px solid var(--upload-border)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    }}
    className="dark:bg-slate-900 dark:border-slate-700">
      {isLoading ? (
        <AnalysisProgress isLoading={isLoading} />
      ) : (
        <>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.5px' }} className="text-slate-900 dark:text-white">Upload Your Statement</h2>
          <p style={{ marginBottom: '32px', maxWidth: '500px', textAlign: 'center', fontSize: '16px', lineHeight: '1.6' }} className="text-slate-600 dark:text-slate-400">
            Drop your CSV or Excel file here to begin. Your data is processed securely.
          </p>

          <div 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '40px 32px',
              border: '2px dashed',
              borderColor: isDragging ? '#2563eb' : 'var(--upload-border-dashed)',
              borderRadius: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              backgroundColor: isDragging ? '#eff6ff' : 'var(--upload-drop-bg)',
              cursor: 'pointer',
              transform: isDragging ? 'scale(1.02)' : 'scale(1)'
            }}
            className="dark:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500"
          >
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <UploadIcon style={{ width: '48px', height: '48px', color: '#2563eb', marginBottom: '16px' }} />
              {selectedFile ? (
                <span style={{ fontWeight: '500', fontSize: '16px' }} className="text-slate-900 dark:text-white">{selectedFile.name}</span>
              ) : (
                <>
                  <span style={{ fontWeight: '600', color: '#2563eb', fontSize: '16px' }}>Click to upload</span>
                  <span style={{ fontSize: '14px' }} className="text-slate-500 dark:text-slate-400"> or drag and drop</span>
                </>
              )}
              <p style={{ fontSize: '12px', marginTop: '12px', margin: '12px 0 0 0' }} className="text-slate-500 dark:text-slate-400">CSV or XLSX (MAX. 10MB)</p>
            </label>
          </div>

          {selectedFile && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                marginTop: '32px',
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingTop: '12px',
                paddingBottom: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '600',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Analyze Now
            </button>
          )}

          {error && <p style={{ marginTop: '16px', fontSize: '14px' }} className="text-red-500 dark:text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
};

export default UploadScreen;

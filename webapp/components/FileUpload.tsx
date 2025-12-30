'use client';

import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const cbrFile = files.find(f => f.name.toLowerCase().endsWith('.cbr'));
    
    if (cbrFile) {
      onFileSelect(cbrFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.cbr')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center transition-all
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        accept=".cbr"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer ${disabled ? 'pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isDragging ? 'Drop your CBR file here' : 'Drag & drop your CBR file'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supports .cbr files (Comic Book RAR)
          </p>
        </div>
      </label>
    </div>
  );
}


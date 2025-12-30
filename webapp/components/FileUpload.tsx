'use client';

import React, { useCallback, useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const cbrFile = files.find(file => file.name.toLowerCase().endsWith('.cbr'));
    
    if (cbrFile) {
      onFileSelect(cbrFile);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
        ${isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".cbr"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        
        <div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop your CBR file here' : 'Drag and drop your CBR file here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            or click to browse
          </p>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Supports ZIP-based CBR files • No file size limits • 100% client-side
        </p>
      </div>
    </div>
  );
}


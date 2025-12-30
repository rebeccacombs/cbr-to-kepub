'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ConversionStatus from '@/components/ConversionStatus';

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.cbr')) {
      setError('Please upload a .cbr file');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setError('');
    setDownloadUrl(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          
          // Check if response is JSON (blob storage mode) or file (direct mode)
          const contentType = xhr.getResponseHeader('content-type') || '';
          
          if (contentType.includes('application/json')) {
            // Blob storage mode - response is JSON with download URL
            try {
              const text = await blob.text();
              const json = JSON.parse(text);
              
              if (json.downloadUrl) {
                // Use the blob URL directly (it's already a public URL)
                setDownloadUrl(json.downloadUrl);
                setStatus('ready');
                setProgress(100);
              } else {
                setError(json.error || 'Invalid response from server');
                setStatus('error');
              }
            } catch (e) {
              setError('Failed to parse server response');
              setStatus('error');
            }
          } else {
            // Direct mode - response is the file
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setStatus('ready');
            setProgress(100);
          }
        } else {
          // When responseType is 'blob', we need to read the blob as text to get error message
          try {
            const blob = xhr.response;
            const text = await blob.text();
            let errorMessage = 'Conversion failed';
            
            // Try to parse as JSON error response
            try {
              const json = JSON.parse(text);
              errorMessage = json.error || errorMessage;
            } catch {
              // If not JSON, use the text as-is
              errorMessage = text || errorMessage;
            }
            
            setError(errorMessage);
          } catch {
            setError(`Conversion failed (Status: ${xhr.status})`);
          }
          setStatus('error');
        }
      });

      xhr.addEventListener('error', () => {
        setError('Network error occurred');
        setStatus('error');
      });

      xhr.open('POST', '/api/convert');
      // Use 'blob' for file responses, but we'll handle JSON too
      xhr.responseType = 'blob';
      setStatus('processing');
      xhr.send(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName.replace(/\.cbr$/i, '.kepub.epub');
      link.target = '_blank'; // Open in new tab for blob URLs
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadUrl, fileName]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              CBR to KEPUB Converter
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Convert your Comic Book RAR files to Kobo EPUB format
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Preserves original image quality • Ready for your Kobo device
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <FileUpload onFileSelect={handleFileSelect} disabled={status === 'uploading' || status === 'processing'} />
            
            <ConversionStatus
              status={status}
              progress={progress}
              error={error}
              downloadUrl={downloadUrl}
              fileName={fileName}
              onDownload={handleDownload}
            />
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Tip: Large files may take a few minutes to process
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Note: True RAR files require the Python script. Most CBR files are ZIP-based and work here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


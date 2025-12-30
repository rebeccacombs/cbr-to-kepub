'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ConversionStatus from '@/components/ConversionStatus';
import { createKEPUB, extractImagesFromFiles } from '@/lib/kepub-generator';

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
      // Read file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);
      
      const fileData = new Uint8Array(arrayBuffer);

      // Detect archive type
      const isZip = fileData.length >= 2 && fileData[0] === 0x50 && fileData[1] === 0x4B;
      const isRar = fileData.length >= 4 && (
        (fileData[0] === 0x52 && fileData[1] === 0x61 && fileData[2] === 0x72 && fileData[3] === 0x21) ||
        (fileData[0] === 0x52 && fileData[1] === 0x41 && fileData[2] === 0x52 && fileData[3] === 0x20)
      );

      if (isRar) {
        setError('True RAR files require the Python script. Most CBR files are ZIP-based and work here. Please visit /download-script to get the Python script for RAR files.');
        setStatus('error');
        return;
      }

      if (!isZip) {
        setError('Unsupported file format. Please ensure your CBR file is a ZIP-based archive.');
        setStatus('error');
        return;
      }

      setProgress(30);
      setStatus('processing');

      // Extract ZIP file
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(fileData);
      setProgress(40);

      const files: { name: string; data: Uint8Array }[] = [];
      const sortedEntries = Object.entries(zip.files).sort(([a], [b]) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });

      for (const [filename, file] of sortedEntries) {
        if (!file.dir) {
          const data = await file.async('uint8array');
          files.push({ name: filename, data });
        }
      }

      setProgress(60);

      if (files.length === 0) {
        setError('No files found in archive');
        setStatus('error');
        return;
      }

      // Extract and sort images
      const imageFiles = extractImagesFromFiles(files);
      setProgress(70);

      if (imageFiles.length === 0) {
        setError('No image files found in archive');
        setStatus('error');
        return;
      }

      // Generate book title
      const bookTitle = file.name.replace(/\.cbr$/i, '').replace(/\.rar$/i, '');
      setProgress(80);

      // Create KEPUB
      const kepubData = await createKEPUB(bookTitle, imageFiles);
      setProgress(90);

      // Create download URL
      const blob = new Blob([kepubData], { type: 'application/epub+zip' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('ready');
      setProgress(100);

    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(err.message || 'Conversion failed. Make sure your file is a valid CBR archive.');
      setStatus('error');
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName.replace(/\.cbr$/i, '.kepub.epub');
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
              ✨ 100% client-side • No file size limits • Your files never leave your computer
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
              💡 All processing happens in your browser - no server needed!
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Note: Works with ZIP-based CBR files. For true RAR files, <a href="/download-script" className="text-blue-600 hover:underline">download the Python script</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

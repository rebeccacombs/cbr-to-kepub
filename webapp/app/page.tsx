'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ConversionStatus from '@/components/ConversionStatus';
import JSZip from 'jszip';
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
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      setProgress(20);

      // Try ZIP extraction
      let extractedFiles: { name: string; data: Uint8Array }[] = [];
      try {
        const zip = await JSZip.loadAsync(fileData);
        const sortedEntries = Object.entries(zip.files).sort(([a], [b]) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );

        for (const [filename, zipEntry] of sortedEntries) {
          if (!zipEntry.dir) {
            const data = await zipEntry.async('uint8array');
            extractedFiles.push({ name: filename, data });
          }
        }
        setProgress(50);
      } catch (zipError) {
        setError('Failed to extract ZIP archive. This file may be a true RAR file, corrupted, or password-protected. Please use the Python script for true RAR files.');
        setStatus('error');
        return;
      }

      if (extractedFiles.length === 0) {
        setError('No files found in archive');
        setStatus('error');
        return;
      }

      const imageFiles = extractImagesFromFiles(extractedFiles);

      if (imageFiles.length === 0) {
        setError('No image files found in archive');
        setStatus('error');
        return;
      }

      setProgress(70);
      const bookTitle = file.name.replace(/\.cbr$/i, '').replace(/\.rar$/i, '');
      const kepubData = await createKEPUB(bookTitle, imageFiles);
      setProgress(90);

      // Convert Uint8Array to ArrayBuffer for Blob
      const kepubBuffer = kepubData.buffer.slice(kepubData.byteOffset, kepubData.byteOffset + kepubData.byteLength) as ArrayBuffer;
      const blob = new Blob([kepubBuffer], { type: 'application/epub+zip' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileName(`${bookTitle}.kepub.epub`);
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
      // Clean up the object URL after download
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }
  }, [downloadUrl]);

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
              Preserves original image quality • Ready for your Kobo device • 100% client-side
            </p>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg inline-block">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✨ <strong>No file size limits!</strong> Everything runs in your browser - no server uploads
              </p>
            </div>
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

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>💡 Tip: Works with ZIP-based CBR files. For true RAR files, use the <a href="/download-script" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">Python script</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}

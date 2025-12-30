'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import ConversionStatus from '@/components/ConversionStatus';
import JSZip from 'jszip';
import { createKEPUB, extractImagesFromFiles } from '@/lib/kepub-generator';

// Detect RAR file by magic bytes (RAR signature: Rar! or RAR\x1a\x07)
function detectRARFile(data: Uint8Array): boolean {
  if (data.length < 8) return false;
  
  // RAR v1.50+: "Rar!\x1a\x07\x00" or "Rar!\x1a\x07\x01"
  const rarV15 = data[0] === 0x52 && data[1] === 0x61 && data[2] === 0x72 && 
                 data[3] === 0x21 && data[4] === 0x1a && data[5] === 0x07;
  
  // RAR v5.0+: "RAR\x1a\x07\x01\x00"
  const rarV5 = data[0] === 0x52 && data[1] === 0x41 && data[2] === 0x52 && 
                data[3] === 0x1a && data[4] === 0x07 && data[5] === 0x01;
  
  return rarV15 || rarV5;
}

// Detect ZIP file by magic bytes (ZIP signature: PK\x03\x04 or PK\x05\x06 or PK\x07\x08)
function detectZIPFile(data: Uint8Array): boolean {
  if (data.length < 4) return false;
  
  // ZIP file signature: "PK" (0x50 0x4B) followed by 0x03 0x04, 0x05 0x06, or 0x07 0x08
  const isPK = data[0] === 0x50 && data[1] === 0x4B;
  const validZIP = isPK && (
    (data[2] === 0x03 && data[3] === 0x04) || // Local file header
    (data[2] === 0x05 && data[3] === 0x06) || // Empty archive
    (data[2] === 0x07 && data[3] === 0x08)    // Spanned archive
  );
  
  return validZIP;
}

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
      setProgress(10);

      // Detect file type by magic bytes
      const isRAR = detectRARFile(fileData);
      if (isRAR) {
        setError('This is a true RAR archive. RAR extraction requires system tools that aren\'t available in the browser. Please use the Python script (download link below) or convert the RAR to ZIP format first.');
        setStatus('error');
        return;
      }

      // Check if it's a ZIP file
      const isZIP = detectZIPFile(fileData);
      if (!isZIP) {
        setError('This file doesn\'t appear to be a valid ZIP or RAR archive. Please ensure your CBR file is a ZIP-based archive (many CBR files are ZIP files renamed).');
        setStatus('error');
        return;
      }

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
      } catch (zipError: any) {
        console.error('ZIP extraction error:', zipError);
        const errorMsg = zipError.message || 'Unknown error';
        if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
          setError('This archive is password-protected. Please remove the password and try again, or use the Python script.');
        } else if (errorMsg.includes('corrupted') || errorMsg.includes('invalid')) {
          setError('This archive appears to be corrupted or invalid. Please verify the file is not damaged.');
        } else {
          setError('Failed to extract ZIP archive. This file may be corrupted, password-protected, or in an unsupported format. Please use the Python script for true RAR files.');
        }
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

          {status === 'error' && error.includes('RAR archive') && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                <strong>Need to convert a true RAR file?</strong>
              </p>
              <a
                href="/download-script"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Download Python Script
              </a>
            </div>
          )}
          
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>💡 Tip: Works with ZIP-based CBR files. For true RAR files, use the <a href="/download-script" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">Python script</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}

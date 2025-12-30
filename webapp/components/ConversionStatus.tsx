'use client';

interface ConversionStatusProps {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
  downloadUrl?: string | null;
  fileName?: string;
  onDownload?: () => void;
}

export default function ConversionStatus({
  status,
  progress,
  error,
  downloadUrl,
  fileName,
  onDownload,
}: ConversionStatusProps) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'error') {
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">Conversion Failed</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'ready' && downloadUrl) {
    return (
      <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="text-center">
          <svg className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Conversion Complete!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            Your KEPUB file is ready to download
          </p>
          <a
            href={downloadUrl}
            download={fileName || 'converted.kepub.epub'}
            onClick={onDownload}
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download KEPUB
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {status === 'uploading' ? 'Reading file...' : 'Converting to KEPUB...'}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}


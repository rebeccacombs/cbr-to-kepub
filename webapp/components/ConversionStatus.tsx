'use client';

interface ConversionStatusProps {
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
  downloadUrl: string | null;
  fileName: string;
  onDownload: () => void;
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

  return (
    <div className="mt-8">
      {status === 'uploading' || status === 'processing' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {status === 'uploading' ? 'Uploading...' : 'Processing...'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {status === 'uploading' 
              ? 'Uploading your file...' 
              : 'Converting to KEPUB format...'}
          </p>
        </div>
      ) : status === 'ready' && downloadUrl ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Conversion Complete!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your KEPUB file is ready to download
            </p>
            <button
              onClick={onDownload}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download KEPUB
            </button>
          </div>
        </div>
      ) : status === 'error' ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Conversion Failed
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              {error || 'An unknown error occurred'}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}


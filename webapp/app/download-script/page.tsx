'use client';

import { useState } from 'react';

export default function DownloadScriptPage() {
  const [copied, setCopied] = useState(false);

  const downloadScript = () => {
    // Create a download link for the Python script
    const link = document.createElement('a');
    link.href = '/cbr_to_kepub.py';
    link.download = 'cbr_to_kepub.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyCommand = () => {
    const command = 'python3 cbr_to_kepub.py "your-file.cbr"';
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Download Python Script
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              For large files or true RAR archives, download and run the Python script locally on your computer.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Step 1: Download the Script
                </h2>
                <button
                  onClick={downloadScript}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download cbr_to_kepub.py
                </button>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Step 2: Install Requirements
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-2">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    pip install rarfile Pillow
                  </code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Also install <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">unrar</code>:
                  <br />
                  <strong>macOS:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">brew install unrar</code>
                  <br />
                  <strong>Linux:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">sudo apt-get install unrar</code>
                  <br />
                  <strong>Windows:</strong> Download from <a href="https://www.rarlab.com/" className="text-blue-600 hover:underline">RARLab</a>
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Step 3: Run the Script
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-2 flex items-center justify-between">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    python3 cbr_to_kepub.py {'"'}your-file.cbr{'"'}
                  </code>
                  <button
                    onClick={copyCommand}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-sm"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Replace <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'"'}your-file.cbr{'"'}</code> with the path to your CBR file.
                </p>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> The script works with files of any size and handles true RAR archives. 
                  The output KEPUB file will be created in the same directory as your CBR file.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


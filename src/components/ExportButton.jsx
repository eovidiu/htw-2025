import React, { useState } from 'react';
import { exportToPDF, copyAllTextToClipboard } from '../utils/exportHelpers';

const ExportButton = ({ captures }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setProgress(0);
      setShowMenu(false);

      await exportToPDF(captures, setProgress);

      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleCopyText = async () => {
    try {
      setShowMenu(false);
      await copyAllTextToClipboard(captures);
      alert('All text copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy text. Please try again.');
    }
  };

  if (captures.length === 0) {
    return null;
  }

  return (
    <div className="relative max-w-2xl mx-auto mb-4">
      {!showMenu ? (
        <button
          onClick={() => setShowMenu(true)}
          disabled={isExporting}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isExporting
              ? 'border-2 border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
          }`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generating PDF... {progress}%
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              📤 Export Session
            </>
          )}
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">Export Options</span>
            <button
              onClick={() => setShowMenu(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col">
            <button
              onClick={handleExportPDF}
              className="px-4 py-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-200"
            >
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Export as PDF</div>
                <div className="text-sm text-gray-500">Download all captures with photos</div>
              </div>
            </button>

            <button
              onClick={handleCopyText}
              className="px-4 py-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Copy All Text</div>
                <div className="text-sm text-gray-500">Copy text captures to clipboard</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

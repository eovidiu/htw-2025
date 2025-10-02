import React from 'react';

const CaptureButtons = ({ onAddText, onAddPhoto, disabled = false, processingCount = 0, maxProcessing = 5 }) => {
  const buttonClass = disabled
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg shadow-md font-semibold'
    : 'btn-primary flex-1 flex items-center justify-center gap-2';

  const buttonText = disabled && processingCount > 0
    ? `(${processingCount}/${maxProcessing} Processing...)`
    : '';

  return (
    <div className="sticky top-0 z-10 bg-white shadow-md mb-4">
      {/* Logo Header */}
      <div className="w-full bg-gradient-to-r from-blue-900 to-blue-700">
        <img
          src="/logo.png"
          alt="How to Web Conference 2025"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={onAddText}
            disabled={disabled}
            className={buttonClass}
            aria-label="Add text capture"
            title={disabled ? `Wait for current uploads to finish (${processingCount}/${maxProcessing})` : ''}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="flex flex-col items-start">
              <span>Add Text</span>
              {disabled && buttonText && <span className="text-xs">{buttonText}</span>}
            </span>
          </button>
          <button
            onClick={onAddPhoto}
            disabled={disabled}
            className={buttonClass}
            aria-label="Add photo capture"
            title={disabled ? `Wait for current uploads to finish (${processingCount}/${maxProcessing})` : ''}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="flex flex-col items-start">
              <span>Add Photo</span>
              {disabled && buttonText && <span className="text-xs">{buttonText}</span>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureButtons;

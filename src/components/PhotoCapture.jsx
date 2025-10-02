import React, { useRef, useState } from 'react';
import { validateFileSize } from '../utils/validation';
import ErrorModal from './ErrorModal';

const PhotoCapture = ({ onCapture, onCancel }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      const validation = validateFileSize(file);

      if (!validation.valid) {
        setError(validation.error);
        // Reset file input
        if (e.target) {
          e.target.value = '';
        }
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleChooseFromGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleConfirm = async () => {
    if (selectedFile) {
      await onCapture(selectedFile);
      setPreview(null);
      setSelectedFile(null);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  // Preview mode
  if (preview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg shadow-xl mb-4"
          />
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className="btn-primary w-full text-lg py-4"
            >
              Confirm
            </button>
            <button
              onClick={handleRetake}
              className="btn-secondary w-full"
            >
              Choose Different Photo
            </button>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-300 text-center py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Selection mode
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4">Add Photo</h2>

          {/* Camera input - opens camera directly */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Gallery input - opens file picker */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col gap-3">
            <button
              onClick={handleTakePhoto}
              className="btn-primary flex items-center justify-center gap-2 text-lg py-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              📷 Take Photo
            </button>

            <button
              onClick={handleChooseFromGallery}
              className="btn-secondary flex items-center justify-center gap-2 text-lg py-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              🖼️ Choose from Gallery
            </button>

            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 text-center py-2 mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <ErrorModal
          title="File Too Large"
          message={error}
          onClose={handleCloseError}
        />
      )}
    </>
  );
};

export default PhotoCapture;

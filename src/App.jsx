import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import CaptureButtons from './components/CaptureButtons';
import TextCapture from './components/TextCapture';
import PhotoCapture from './components/PhotoCapture';
import ContentFeed from './components/ContentFeed';
import PhotoViewer from './components/PhotoViewer';
import { loadCaptures, addCapture, updateCapture, deleteCapture as deleteStorageCapture, reorderCaptures } from './utils/storage';
import { savePhoto, deletePhoto } from './utils/indexedDB';
import { compressImage } from './utils/imageCompression';

function App() {
  const [captures, setCaptures] = useState([]);
  const [showTextCapture, setShowTextCapture] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  useEffect(() => {
    // Load captures on mount
    const loadedCaptures = loadCaptures();
    setCaptures(loadedCaptures);
  }, []);

  const handleAddText = () => {
    setShowTextCapture(true);
  };

  const handleSaveText = (text) => {
    const capture = addCapture({
      type: 'text',
      text
    });
    setCaptures([capture, ...captures]);
    setShowTextCapture(false);
  };

  const handleAddPhoto = () => {
    setShowPhotoCapture(true);
  };

  const handlePhotoCapture = async (file) => {
    try {
      // Compress the image
      const compressedBlob = await compressImage(file);

      // Create capture entry
      const capture = addCapture({
        type: 'photo',
        photoId: null // Will be set after saving
      });

      // Save photo to IndexedDB
      const photoId = capture.id;
      await savePhoto(photoId, compressedBlob);

      // Update capture with photoId
      const updatedCapture = updateCapture(capture.id, { photoId });

      setCaptures([updatedCapture, ...captures]);
      setShowPhotoCapture(false);
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Failed to save photo. Please try again.');
      setShowPhotoCapture(false);
    }
  };

  const handleEdit = (id, updates) => {
    const updated = updateCapture(id, updates);
    if (updated) {
      setCaptures(captures.map(c => c.id === id ? updated : c));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this capture?')) {
      return;
    }

    const capture = captures.find(c => c.id === id);

    // Delete photo from IndexedDB if it's a photo capture
    if (capture?.type === 'photo' && capture.photoId) {
      await deletePhoto(capture.photoId);
    }

    // Delete from localStorage
    const updatedCaptures = deleteStorageCapture(id);
    setCaptures(updatedCaptures);
  };

  const handleReorder = (newCaptures) => {
    setCaptures(newCaptures);
    reorderCaptures(newCaptures);
  };

  const handlePhotoClick = (photoUrl) => {
    setViewingPhoto(photoUrl);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <CaptureButtons onAddText={handleAddText} onAddPhoto={handleAddPhoto} />

        <div className="px-4">
          <ErrorBoundary>
            <ContentFeed
              captures={captures}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
              onPhotoClick={handlePhotoClick}
            />
          </ErrorBoundary>
        </div>

        {showTextCapture && (
          <TextCapture
            onSave={handleSaveText}
            onCancel={() => setShowTextCapture(false)}
          />
        )}

        {showPhotoCapture && (
          <PhotoCapture
            onCapture={handlePhotoCapture}
            onCancel={() => setShowPhotoCapture(false)}
          />
        )}

        {viewingPhoto && (
          <PhotoViewer
            photoUrl={viewingPhoto}
            onClose={() => setViewingPhoto(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;

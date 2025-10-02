import React, { useState, useEffect } from 'react';
import CaptureButtons from './components/CaptureButtons';
import TextCapture from './components/TextCapture';
import PhotoCapture from './components/PhotoCapture';
import ContentFeed from './components/ContentFeed';
import PhotoViewer from './components/PhotoViewer';
import ExportButton from './components/ExportButton';
import ProcessingIndicator from './components/ProcessingIndicator';
import ErrorModal from './components/ErrorModal';
import FeedbackButton from './components/FeedbackButton';
import SessionSelector from './components/SessionSelector';
import FeedbackForm from './components/FeedbackForm';
import { loadCaptures, addCapture, updateCapture, deleteCapture as deleteStorageCapture, reorderCaptures } from './utils/storage';
import { savePhoto, deletePhoto } from './utils/indexedDB';
import { compressImage } from './utils/imageCompression';
import { captureQueue } from './utils/captureQueue';

function App() {
  const [captures, setCaptures] = useState([]);
  const [showTextCapture, setShowTextCapture] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [queueState, setQueueState] = useState({ active: 0, max: 5, canAddMore: true });
  const [error, setError] = useState(null);
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Load captures on mount
    const loadedCaptures = loadCaptures();
    setCaptures(loadedCaptures);

    // Subscribe to queue state changes
    const handleQueueChange = (state) => {
      setQueueState(state);
    };

    captureQueue.addListener(handleQueueChange);

    return () => {
      captureQueue.removeListener(handleQueueChange);
    };
  }, []);

  const handleAddText = () => {
    if (!queueState.canAddMore) {
      setError(`Too many items being processed. Please wait for current uploads to complete (${queueState.active}/${queueState.max}).`);
      return;
    }
    setShowTextCapture(true);
  };

  const handleSaveText = async (text) => {
    try {
      await captureQueue.addCapture(async () => {
        const capture = addCapture({
          type: 'text',
          text
        });
        setCaptures([capture, ...captures]);
      });
      setShowTextCapture(false);
    } catch (error) {
      console.error('Error saving text:', error);
      setError(error.message);
      setShowTextCapture(false);
    }
  };

  const handleAddPhoto = () => {
    if (!queueState.canAddMore) {
      setError(`Too many items being processed. Please wait for current uploads to complete (${queueState.active}/${queueState.max}).`);
      return;
    }
    setShowPhotoCapture(true);
  };

  const handlePhotoCapture = async (file) => {
    try {
      await captureQueue.addCapture(async () => {
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
      });
      setShowPhotoCapture(false);
    } catch (error) {
      console.error('Error capturing photo:', error);
      setError(error.message || 'Failed to save photo. Please try again.');
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

  const handleOpenSessionSelector = () => {
    setShowSessionSelector(true);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setShowSessionSelector(false);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = () => {
    setShowFeedbackForm(false);
    setSelectedSession(null);
    // Force re-render of FeedbackButton to update count
    setCaptures([...captures]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CaptureButtons
        onAddText={handleAddText}
        onAddPhoto={handleAddPhoto}
        disabled={!queueState.canAddMore}
        processingCount={queueState.active}
        maxProcessing={queueState.max}
      />

      <div className="px-4">
        <FeedbackButton onClick={handleOpenSessionSelector} />

        <ExportButton captures={captures} />

        <ContentFeed
          captures={captures}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={handleReorder}
          onPhotoClick={handlePhotoClick}
        />
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

      {/* Session Selector */}
      {showSessionSelector && (
        <SessionSelector
          onSelectSession={handleSelectSession}
          onClose={() => setShowSessionSelector(false)}
        />
      )}

      {/* Feedback Form */}
      {showFeedbackForm && selectedSession && (
        <FeedbackForm
          session={selectedSession}
          onSubmit={handleFeedbackSubmit}
          onCancel={() => {
            setShowFeedbackForm(false);
            setSelectedSession(null);
          }}
        />
      )}

      {/* Processing Indicator */}
      <ProcessingIndicator active={queueState.active} max={queueState.max} />

      {/* Error Modal */}
      {error && (
        <ErrorModal
          title="Processing Limit Reached"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}

export default App;

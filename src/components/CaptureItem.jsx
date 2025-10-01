import React, { useState, useEffect } from 'react';
import { getPhoto } from '../utils/indexedDB';

const CaptureItem = ({ capture, onEdit, onDelete, onPhotoClick }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(capture.text || '');
  const [editTags, setEditTags] = useState(capture.tags?.join(', ') || '');

  useEffect(() => {
    if (capture.type === 'photo' && capture.photoId) {
      loadPhoto();
    }

    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [capture.photoId]);

  const loadPhoto = async () => {
    const blob = await getPhoto(capture.photoId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPhotoUrl(url);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveEdit = () => {
    const tags = editTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onEdit(capture.id, {
      text: editText,
      tags: tags.length > 0 ? tags : undefined
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(capture.text || '');
    setEditTags(capture.tags?.join(', ') || '');
    setIsEditing(false);
  };

  return (
    <div className="capture-item">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500">{formatTimestamp(capture.timestamp)}</span>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 text-sm"
                aria-label="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(capture.id)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div>
          {capture.type === 'text' && (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          )}
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="btn-primary text-sm py-2">
              Save
            </button>
            <button onClick={handleCancelEdit} className="btn-secondary text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {capture.type === 'text' && (
            <p className="text-gray-800 whitespace-pre-wrap">{capture.text}</p>
          )}

          {capture.type === 'photo' && photoUrl && (
            <img
              src={photoUrl}
              alt="Capture"
              onClick={() => onPhotoClick(photoUrl)}
              className="w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
            />
          )}

          {capture.tags && capture.tags.length > 0 && (
            <div className="mt-3">
              {capture.tags.map((tag, idx) => (
                <span key={idx} className="tag-badge">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CaptureItem;

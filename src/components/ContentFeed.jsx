import React, { useState, useEffect } from 'react';
import CaptureItem from './CaptureItem';

const ContentFeed = ({ captures, onEdit, onDelete, onReorder, onPhotoClick }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem !== index) {
      setDragOverItem(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem !== null && draggedItem !== dropIndex) {
      const newCaptures = [...captures];
      const [removed] = newCaptures.splice(draggedItem, 1);
      newCaptures.splice(dropIndex, 0, removed);
      onReorder(newCaptures);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  if (captures.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg">No captures yet</p>
        <p className="text-sm mt-2">Tap "Add Text" or "Add Photo" to get started</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-4">
      {captures.map((capture, index) => (
        <div
          key={capture.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`${draggedItem === index ? 'dragging' : ''} ${dragOverItem === index ? 'drag-over' : ''}`}
        >
          <CaptureItem
            capture={capture}
            onEdit={onEdit}
            onDelete={onDelete}
            onPhotoClick={onPhotoClick}
          />
        </div>
      ))}
    </div>
  );
};

export default ContentFeed;

// localStorage utilities for text content and app state
const STORAGE_KEY = 'conference-captures';

export const loadCaptures = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading captures:', error);
    return [];
  }
};

export const saveCaptures = (captures) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some items or export your data.');
    }
    console.error('Error saving captures:', error);
    return false;
  }
};

export const addCapture = (capture) => {
  const captures = loadCaptures();
  const newCapture = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...capture
  };
  captures.unshift(newCapture);
  saveCaptures(captures);
  return newCapture;
};

export const updateCapture = (id, updates) => {
  const captures = loadCaptures();
  const index = captures.findIndex(c => c.id === id);
  if (index !== -1) {
    captures[index] = { ...captures[index], ...updates };
    saveCaptures(captures);
    return captures[index];
  }
  return null;
};

export const deleteCapture = (id) => {
  const captures = loadCaptures();
  const filtered = captures.filter(c => c.id !== id);
  saveCaptures(filtered);
  return filtered;
};

export const reorderCaptures = (captures) => {
  saveCaptures(captures);
};

// Feedback storage utilities
const FEEDBACK_KEY = 'htw-session-feedback';

/**
 * Get all session feedback
 */
export const getAllFeedback = () => {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading feedback:', error);
    return [];
  }
};

/**
 * Save session feedback
 */
export const saveFeedback = (feedbackData) => {
  try {
    const allFeedback = getAllFeedback();

    // Check if feedback for this session already exists
    const existingIndex = allFeedback.findIndex(f => f.sessionId === feedbackData.sessionId);

    if (existingIndex !== -1) {
      // Update existing feedback
      allFeedback[existingIndex] = {
        ...feedbackData,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new feedback
      allFeedback.push({
        ...feedbackData,
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
    return true;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return false;
  }
};

/**
 * Get feedback for a specific session
 */
export const getFeedbackForSession = (sessionId) => {
  const allFeedback = getAllFeedback();
  return allFeedback.find(f => f.sessionId === sessionId) || null;
};

/**
 * Delete feedback for a session
 */
export const deleteFeedback = (sessionId) => {
  try {
    const allFeedback = getAllFeedback();
    const filtered = allFeedback.filter(f => f.sessionId !== sessionId);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return false;
  }
};

/**
 * Check if feedback exists for a session
 */
export const hasFeedback = (sessionId) => {
  return getFeedbackForSession(sessionId) !== null;
};

/**
 * Get feedback count
 */
export const getFeedbackCount = () => {
  return getAllFeedback().length;
};

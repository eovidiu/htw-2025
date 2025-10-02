import React from 'react';
import { getFeedbackCount } from '../utils/feedbackStorage';

const FeedbackButton = ({ onClick }) => {
  const feedbackCount = getFeedbackCount();

  return (
    <div className="max-w-2xl mx-auto mb-4">
      <button
        onClick={onClick}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <span>Add Session Feedback</span>
        {feedbackCount > 0 && (
          <span className="bg-purple-800 text-white text-xs font-bold px-2 py-1 rounded-full">
            {feedbackCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FeedbackButton;

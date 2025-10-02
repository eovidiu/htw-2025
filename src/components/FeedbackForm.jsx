import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { saveFeedback, getFeedbackForSession } from '../utils/feedbackStorage';

const FeedbackForm = ({ session, onSubmit, onCancel }) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    speaker: 0,
    content: 0,
    presentation: 0
  });
  const [recommend, setRecommend] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [charCount, setCharCount] = useState(0);

  // Load existing feedback if editing
  useEffect(() => {
    const existingFeedback = getFeedbackForSession(session.id);
    if (existingFeedback) {
      setRatings(existingFeedback.ratings);
      setRecommend(existingFeedback.recommend);
      setFeedback(existingFeedback.feedback || '');
      setCharCount(existingFeedback.feedback?.length || 0);
    }
  }, [session.id]);

  const handleFeedbackChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = () => {
    if (ratings.overall === 0 || ratings.speaker === 0) {
      alert('Please provide both overall and speaker ratings');
      return;
    }

    const feedbackData = {
      sessionId: session.id,
      sessionTitle: session.title,
      speakerName: session.speaker,
      speakerCompany: session.company,
      stage: session.stage,
      day: session.day,
      time: session.time,
      timestamp: new Date().toISOString(),
      ratings,
      recommend,
      feedback: feedback.trim()
    };

    const success = saveFeedback(feedbackData);
    if (success) {
      onSubmit(feedbackData);
    } else {
      alert('Failed to save feedback. Please try again.');
    }
  };

  const isValid = ratings.overall > 0 && ratings.speaker > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4">
          <h2 className="text-xl font-bold text-gray-900">Session Feedback</h2>
          <p className="text-sm text-gray-700 mt-1 font-medium">{session.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {session.speaker} • {session.company} • {session.stage}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Overall Rating */}
          <StarRating
            rating={ratings.overall}
            onRatingChange={(rating) => setRatings({ ...ratings, overall: rating })}
            label="How would you rate this session?"
            required
          />

          {/* Speaker Rating */}
          <StarRating
            rating={ratings.speaker}
            onRatingChange={(rating) => setRatings({ ...ratings, speaker: rating })}
            label="How would you rate the speaker?"
            required
          />

          {/* Content Quality */}
          <StarRating
            rating={ratings.content}
            onRatingChange={(rating) => setRatings({ ...ratings, content: rating })}
            label="Content relevance and usefulness"
          />

          {/* Presentation Style */}
          <StarRating
            rating={ratings.presentation}
            onRatingChange={(rating) => setRatings({ ...ratings, presentation: rating })}
            label="Presentation delivery and engagement"
          />

          {/* Text Feedback */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Additional feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={handleFeedbackChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="4"
              maxLength="500"
              placeholder="What did you find most valuable? Any suggestions?"
            />
            <p className="text-xs text-gray-500 mt-1">{charCount}/500 characters</p>
          </div>

          {/* Recommend Toggle */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Would you recommend this session?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  recommend === true
                    ? 'bg-green-600 text-white'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  recommend === false
                    ? 'bg-red-600 text-white'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                👎 No
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              isValid
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;

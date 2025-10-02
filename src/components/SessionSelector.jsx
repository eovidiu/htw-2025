import React, { useState, useMemo } from 'react';
import { HTW_2025_SESSIONS, STAGES } from '../data/sessions';
import { hasFeedback } from '../utils/feedbackStorage';

const SessionSelector = ({ onSelectSession, onClose }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = useMemo(() => {
    return HTW_2025_SESSIONS.filter(session => {
      const matchesDay = session.day === selectedDay;
      const matchesStage = selectedStage === "All Stages" || session.stage === selectedStage;
      const matchesSearch = searchQuery === "" ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.company.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDay && matchesStage && matchesSearch;
    });
  }, [selectedDay, selectedStage, searchQuery]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Select Session</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 border-b">
          {/* Day selector */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSelectedDay(1)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day 1 - Oct 1
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === 2
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Day 2 - Oct 2
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search sessions or speakers..."
          />

          {/* Stage filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedStage === stage
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => {
                const hasFeedbackAlready = hasFeedback(session.id);

                return (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 pr-2">
                        {session.title}
                      </h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                        {session.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {session.speaker} • {session.company}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{session.stage}</p>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => onSelectSession(session)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasFeedbackAlready
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {hasFeedbackAlready ? '✓ Edit Feedback' : 'Add Feedback'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSelector;

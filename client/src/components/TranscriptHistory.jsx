// client/src/components/TranscriptHistory.jsx
import React from 'react';
import axios from 'axios';

const TranscriptHistory = ({ transcripts, onDelete }) => {

  const formatDate = (dateString) => {
    if (!dateString) return '📅 Date not available';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? '📅 Invalid Date'
      : date.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Optionally show a confirmation message
    console.log('Transcript copied to clipboard!');
    // Add visual feedback (e.g., change button color or show a tooltip)
    // For simplicity, we'll just log for now.
  };

  return (
    <div className="w-full">
      {transcripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-20 h-20 text-gray-600 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>
          <p className="text-gray-400 text-center italic">No transcripts saved yet.</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {transcripts.map((t, index) => (
            <li
              key={t._id}
              className={`bg-gray-700 p-6 rounded-lg shadow-lg border-l-4 border-blue-500 ${index === 0 ? 'animate-slide-down' : 'animate-fade-in'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Invalid Date'}</span>
                <div className="flex space-x-3">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(t.text)}
                    className="text-gray-400 hover:text-blue-400 transition duration-150"
                    title="Copy to Clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(t._id)}
                    className="text-gray-400 hover:text-red-400 transition duration-150"
                    title="Delete Transcript"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm.002 6.75l1.83-4.88a.75.75 0 011.436 0l1.83 4.88a.75.75 0 001.35-.447L12.216 9.22a.75.75 0 00-1.372 0L9.116 14.3a.75.75 0 001.35.447z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-200 whitespace-pre-line text-base leading-relaxed">{t.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );  
};

export default TranscriptHistory;

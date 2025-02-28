// File: components/TranscriptDisplay.js
import React from 'react';

function TranscriptDisplay({ title, transcript, language, isLoading, children }) {
  return (
    <div className="transcript-display">
      <div className="transcript-header">
        <h3>{title}</h3>
        {isLoading && <span className="loading-indicator">Processing...</span>}
      </div>
      <div className="transcript-content" lang={language}>
        {transcript || <span className="empty-message">Transcript will appear here...</span>}
      </div>
      {children && <div className="transcript-actions">{children}</div>}
    </div>
  );
}

export default TranscriptDisplay;
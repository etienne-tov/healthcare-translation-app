
// File: components/OfflineNotice.js
import React from 'react';

function OfflineNotice({ audioData }) {
  return (
    <div className="offline-notice">
      <div className="offline-icon">⚠️</div>
      <div className="offline-message">
        <h3>You are currently offline</h3>
        <p>
          Limited functionality is available. Translation and transcription 
          services require an internet connection.
        </p>
        {audioData && (
          <p className="pending-data">
            You have a pending recording that will be processed when you reconnect.
          </p>
        )}
      </div>
    </div>
  );
}

export default OfflineNotice;


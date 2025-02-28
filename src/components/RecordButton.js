// File: components/RecordButton.js
import React from 'react';

function RecordButton({ isListening, onClick }) {
  return (
    <button 
      className={`record-button ${isListening ? 'active' : ''}`}
      onClick={onClick}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      <span className="record-icon"></span>
      {isListening ? 'Stop' : 'Start'} Recording
    </button>
  );
}

export default RecordButton;
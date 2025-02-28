
// File: components/SpeakButton.js
import React, { useState } from 'react';

function SpeakButton({ text, language, disabled }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = () => {
    if (!text || isSpeaking) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  
  return (
    <button
      className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
      onClick={isSpeaking ? stopSpeaking : speak}
      disabled={disabled}
      aria-label={isSpeaking ? 'Stop speaking' : 'Speak translation'}
    >
      <span className="speak-icon"></span>
      {isSpeaking ? 'Stop' : 'Speak'} Translation
    </button>
  );
}

export default SpeakButton;
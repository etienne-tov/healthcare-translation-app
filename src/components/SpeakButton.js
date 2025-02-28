// File: components/SpeakButton.js
import React, { useState, useEffect } from 'react';

function SpeakButton({ text, language, disabled }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Nettoyer la synthèse vocale lors du démontage du composant
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Ajout d'un correctif pour empêcher Chrome de suspendre la synthèse vocale
  useEffect(() => {
    if (isSpeaking) {
      // Crée un intervalle qui "réveille" la synthèse vocale
      const intervalId = setInterval(() => {
        if (window.speechSynthesis) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000); // Toutes les 10 secondes
      
      return () => clearInterval(intervalId);
    }
  }, [isSpeaking]);
  
  const speak = () => {
    if (!text || isSpeaking || disabled) return;
    
    // Arrêter toute synthèse vocale en cours
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Légèrement plus lent pour améliorer la compréhension
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Mettre l'état à jour avant de commencer la lecture
    setIsSpeaking(true);
    
    // Utiliser setTimeout pour permettre au state de se mettre à jour
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };
  
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import LanguageSelector from './components/LanguageSelector';
import TranscriptDisplay from './components/TranscriptDisplay';
import RecordButton from './components/RecordButton';
import SpeakButton from './components/SpeakButton';
import TranslationHistory from './components/TranslationHistory';
import OfflineNotice from './components/OfflineNotice';
import { translateText, enhanceTranscript } from './services/translationService';
import { supportedLanguages } from './utils/languages';
import { saveTranslation, getTranslationHistory, clearHistory } from './utils/storageUtils';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [medicalSpecialty, setMedicalSpecialty] = useState('general');
  
  const recognitionRef = useRef(null);
  
  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load translation history
    loadHistory();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load translation history from local storage
  const loadHistory = async () => {
    const savedHistory = await getTranslationHistory();
    setHistory(savedHistory);
  };
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setOriginalTranscript(transcript);
        
        // Only call the AI enhancement for final results to avoid excessive API calls
        if (event.results[0].isFinal && !isOffline) {
          processTranscription(transcript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('Speech recognition error: ' + event.error);
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in your browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sourceLanguage, targetLanguage, isOffline, medicalSpecialty]);
  
  // Process transcription with enhancement and translation
  const processTranscription = async (transcript) => {
    try {
      // Enhance transcript for medical terminology
      const enhancedTranscript = await enhanceTranscript(transcript, sourceLanguage);
      setOriginalTranscript(enhancedTranscript);
      
      // Translate the enhanced transcript
      setIsTranslating(true);
      const translated = await translateText(enhancedTranscript, sourceLanguage, targetLanguage);
      setTranslatedTranscript(translated);
      setIsTranslating(false);
      
      // Save to history
      if (enhancedTranscript && translated) {
        const newEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          original: enhancedTranscript,
          translated: translated,
          sourceLanguage,
          targetLanguage,
          specialty: medicalSpecialty
        };
        
        saveTranslation(newEntry);
        setHistory(prev => [newEntry, ...prev]);
      }
    } catch (err) {
      setError('Translation error: ' + err.message);
      setIsTranslating(false);
    }
  };
  
  // Toggle recording
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current.lang = sourceLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  // Clear current transcripts
  const clearTranscripts = () => {
    setOriginalTranscript('');
    setTranslatedTranscript('');
    setError(null);
  };
  
  // Select a history item for display
  const selectHistoryItem = (item) => {
    setOriginalTranscript(item.original);
    setTranslatedTranscript(item.translated);
    setSourceLanguage(item.sourceLanguage);
    setTargetLanguage(item.targetLanguage);
    setIsHistoryModalOpen(false);
  };
  
  // Handle specialty change
  // const handleSpecialtyChange = (specialty) => {
  //   setMedicalSpecialty(specialty);
  // };
  
  return (
    <div className="app-container">
      <header>
        <h1>Healthcare Translation App</h1>
        <p>Speak in your language to translate for healthcare conversations</p>
      </header>
      
      {isOffline && <OfflineNotice />}
      
      <main>
        <div className="toolbar">
          <button 
            className="history-button" 
            onClick={() => setIsHistoryModalOpen(true)}
          >
            View History
          </button>
          {/* <div className="specialty-selector">
            <label>Medical Specialty:</label>
            <select
              value={medicalSpecialty}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
            >
              <option value="general">General</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="oncology">Oncology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="psychiatry">Psychiatry</option>
            </select>
          </div> */}
        </div>
        
        <div className="language-controls">
          <LanguageSelector 
            label="I speak"
            selectedLanguage={sourceLanguage}
            onLanguageChange={setSourceLanguage}
            languages={supportedLanguages}
          />
          <LanguageSelector 
            label="Translate to"
            selectedLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            languages={supportedLanguages}
          />
        </div>
        
        <div className="transcript-container">
          <TranscriptDisplay 
            title="Original"
            transcript={originalTranscript}
            language={sourceLanguage}
            isLoading={isListening}
          />
          
          <TranscriptDisplay 
            title="Translation"
            transcript={translatedTranscript}
            language={targetLanguage}
            isLoading={isTranslating}
          >
            <SpeakButton 
              text={translatedTranscript} 
              language={targetLanguage}
              disabled={!translatedTranscript || isOffline}
            />
          </TranscriptDisplay>
        </div>
        
        <div className="controls">
          <RecordButton 
            isListening={isListening} 
            onClick={toggleListening} 
            disabled={isOffline}
          />
          <button 
            className="clear-button"
            onClick={clearTranscripts}
            disabled={!originalTranscript && !translatedTranscript}
          >
            Clear All
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
      
      <TranslationHistory 
        history={history} 
        onSelectItem={selectHistoryItem} 
        onClearHistory={() => {
          clearHistory();
          setHistory([]);
        }}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
      
      <footer>
        <p>Privacy Notice: Speech data is processed securely. No patient information is stored.</p>
      </footer>
    </div>
  );
}

export default App;
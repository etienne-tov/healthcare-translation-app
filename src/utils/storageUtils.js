// File: utils/storageUtils.js
// Utilities for handling local storage operations

// Save a translation to local storage
export const saveTranslation = (translation) => {
    try {
      // Get existing history
      const existingHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      
      // Add new translation to the beginning
      const updatedHistory = [translation, ...existingHistory];
      
      // Limit history size to 50 entries
      const limitedHistory = updatedHistory.slice(0, 50);
      
      // Save back to localStorage
      localStorage.setItem('translationHistory', JSON.stringify(limitedHistory));
      
      return true;
    } catch (error) {
      console.error('Error saving translation to history:', error);
      return false;
    }
  };
  
  // Get translation history from local storage
  export const getTranslationHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      return history;
    } catch (error) {
      console.error('Error retrieving translation history:', error);
      return [];
    }
  };
  
  // Clear all translation history
  export const clearHistory = () => {
    try {
      localStorage.removeItem('translationHistory');
      return true;
    } catch (error) {
      console.error('Error clearing translation history:', error);
      return false;
    }
  };
  
  // Save application settings
  export const saveSettings = (settings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };
  
  // Get application settings
  export const getSettings = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      return settings;
    } catch (error) {
      console.error('Error retrieving settings:', error);
      return {};
    }
  };
  
  // Save pending audio for processing when online
  export const savePendingAudio = (audioBlob, metadata) => {
    try {
      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          const pendingItem = {
            audio: base64data,
            metadata,
            timestamp: new Date().toISOString()
          };
          
          // Get existing pending items
          const pendingItems = JSON.parse(localStorage.getItem('pendingAudio') || '[]');
          pendingItems.push(pendingItem);
          
          // Save back to localStorage
          localStorage.setItem('pendingAudio', JSON.stringify(pendingItems));
          resolve(true);
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Error saving pending audio:', error);
      return Promise.resolve(false);
    }
  };
  
  // Get pending audio items
  export const getPendingAudio = () => {
    try {
      return JSON.parse(localStorage.getItem('pendingAudio') || '[]');
    } catch (error) {
      console.error('Error retrieving pending audio:', error);
      return [];
    }
  };
  
  // Clear processed pending audio item
  export const clearPendingAudio = (timestamp) => {
    try {
      const pendingItems = JSON.parse(localStorage.getItem('pendingAudio') || '[]');
      const updatedItems = pendingItems.filter(item => item.timestamp !== timestamp);
      localStorage.setItem('pendingAudio', JSON.stringify(updatedItems));
      return true;
    } catch (error) {
      console.error('Error clearing pending audio:', error);
      return false;
    }
  };
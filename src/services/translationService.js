// File: services/translationService.js
import axios from 'axios';

// Get API keys from environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Translates text from source language to target language using OpenAI
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (e.g., 'en-US')
 * @param {string} targetLanguage - Target language code (e.g., 'es-ES')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    // Extract base language codes (e.g., 'en-US' -> 'English')
    const sourceLanguageName = getLanguageName(sourceLanguage);
    const targetLanguageName = getLanguageName(targetLanguage);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a medical translator specialized in healthcare terminology. 
                     Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. 
                     Preserve medical terminology accurately and maintain the same tone and formality level.
                     Only return the translated text with no additional commentary.`
          },
          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
}

/**
 * Enhances transcript by correcting medical terminology using OpenAI
 * @param {string} transcript - Original transcript text
 * @param {string} language - Language code
 * @returns {Promise<string>} - Enhanced transcript
 */
export async function enhanceTranscript(transcript, language) {
  if (!transcript) return transcript;
  
  try {
    const languageName = getLanguageName(language);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a medical terminology specialist. 
                     Correct any misheard or misspelled medical terms in the following ${languageName} text.
                     Maintain the exact same meaning, and only correct medical terminology errors.
                     Return the corrected text with no additional comments.`
          },
          {
            role: "user",
            content: transcript
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Transcript enhancement error:', error);
    // If enhancement fails, return original transcript
    return transcript;
  }
}

/**
 * Uses Groq's API for transcribing audio files
 * @param {Blob} audioBlob - Audio blob to transcribe
 * @param {string} language - Language code
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeAudio(audioBlob, language) {
  try {
    const formData = new FormData();
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('response_format', 'verbose_json');
    
    // Add language parameter if available
    if (language) {
      const langCode = language.split('-')[0]; // Get base language code (e.g., 'en' from 'en-US')
      formData.append('language', langCode);
    }
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

/**
 * Converts language code to full language name
 * @param {string} languageCode - Language code (e.g., 'en-US')
 * @returns {string} - Full language name (e.g., 'English')
 */
function getLanguageName(languageCode) {
  const languageMap = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ko': 'Korean'
  };
  
  const baseCode = languageCode.split('-')[0].toLowerCase();
  return languageMap[baseCode] || languageCode;
}
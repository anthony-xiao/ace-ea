/**
 * Voice Command Service for Ace Assistant
 * 
 * This service handles voice recognition, wake word detection, and command processing
 * with support for both English and Chinese languages.
 */

import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import Voice from '@react-native-voice/voice';
import * as ExpoSpeechRecognition from 'expo-speech-recognition';
import { PicovoiceManager } from '@picovoice/picovoice-react-native';
import appConfig from '../../constants/appConfig';
import { LanguageDetector } from '../translation/detector';

// Constants
const WAKE_WORD = 'Hey Ace';
const WAKE_WORD_CHINESE = '嘿 Ace';
const WAKE_WORD_SENSITIVITY = appConfig.voice.wakeWordSensitivity;
const LISTENING_TIMEOUT = appConfig.voice.listeningTimeout;

/**
 * Class representing the Voice Command Service
 */
class VoiceCommandService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.listening = false;
    this.wakeWordDetected = false;
    this.picovoice = null;
    this.platform = Platform.OS;
    this.isIOS = this.platform === 'ios';
    this.isMacOS = this.platform === 'macos';
    this.languageDetector = new LanguageDetector();
    this.currentLanguage = appConfig.voice.defaultLanguage;
    this.apiKey = null;
    this.listeners = [];
    this.voiceEmitter = null;
    
    // Callbacks
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onSpeechResults = null;
    this.onSpeechError = null;
    this.onWakeWordDetected = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.startListening = this.startListening.bind(this);
    this.stopListening = this.stopListening.bind(this);
    this.startWakeWordDetection = this.startWakeWordDetection.bind(this);
    this.stopWakeWordDetection = this.stopWakeWordDetection.bind(this);
    this.handleSpeechStart = this.handleSpeechStart.bind(this);
    this.handleSpeechEnd = this.handleSpeechEnd.bind(this);
    this.handleSpeechResults = this.handleSpeechResults.bind(this);
    this.handleSpeechError = this.handleSpeechError.bind(this);
    this.handleWakeWordDetection = this.handleWakeWordDetection.bind(this);
    this.setCallbacks = this.setCallbacks.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Voice Command Service
   * @param {string} apiKey - Picovoice API key
   * @returns {Promise<boolean>} Success status
   */
  async initialize(apiKey) {
    try {
      console.log('Initializing Voice Command Service...');
      
      // Store API key
      this.apiKey = apiKey;
      
      // Set up Voice recognition
      if (this.isIOS || this.isMacOS) {
        // Set up Voice event emitter
        this.voiceEmitter = new NativeEventEmitter(NativeModules.Voice);
        
        // Add event listeners
        this.listeners.push(
          this.voiceEmitter.addListener('onSpeechStart', this.handleSpeechStart),
          this.voiceEmitter.addListener('onSpeechEnd', this.handleSpeechEnd),
          this.voiceEmitter.addListener('onSpeechResults', this.handleSpeechResults),
          this.voiceEmitter.addListener('onSpeechError', this.handleSpeechError)
        );
      }
      
      // Initialize Picovoice for wake word detection if API key is provided
      if (this.apiKey && this.apiKey !== 'demo_key') {
        try {
          this.picovoice = await PicovoiceManager.create(
            this.apiKey,
            { 
              keyword: WAKE_WORD,
              sensitivity: WAKE_WORD_SENSITIVITY
            },
            this.handleWakeWordDetection
          );
          
          console.log('Picovoice initialized successfully');
        } catch (error) {
          console.error('Error initializing Picovoice:', error);
          // Continue without wake word detection
        }
      }
      
      // Request microphone permissions
      if (this.isIOS || this.isMacOS) {
        try {
          await Voice.requestPermissions();
        } catch (error) {
          console.error('Error requesting Voice permissions:', error);
          return false;
        }
      }
      
      // Set initialization flag
      this.initialized = true;
      console.log('Voice Command Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Voice Command Service:', error);
      return false;
    }
  }
  
  /**
   * Start listening for voice commands
   * @param {string} language - Language code ('en' or 'zh')
   * @returns {Promise<boolean>} Success status
   */
  async startListening(language = null) {
    try {
      if (!this.initialized) {
        console.warn('Voice Command Service not initialized');
        return false;
      }
      
      if (this.listening) {
        console.warn('Already listening');
        return true;
      }
      
      // Set language if provided
      if (language && appConfig.voice.languages.includes(language)) {
        this.currentLanguage = language;
      }
      
      // Start Voice recognition
      await Voice.start(this.currentLanguage);
      
      // Set listening flag
      this.listening = true;
      console.log(`Started listening (language: ${this.currentLanguage})`);
      
      // Set timeout to stop listening if no speech is detected
      this.listeningTimeout = setTimeout(() => {
        if (this.listening) {
          console.log('Listening timeout reached');
          this.stopListening();
        }
      }, LISTENING_TIMEOUT);
      
      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      return false;
    }
  }
  
  /**
   * Stop listening for voice commands
   * @returns {Promise<boolean>} Success status
   */
  async stopListening() {
    try {
      if (!this.listening) {
        return true;
      }
      
      // Clear timeout
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
        this.listeningTimeout = null;
      }
      
      // Stop Voice recognition
      await Voice.stop();
      
      // Reset flags
      this.listening = false;
      console.log('Stopped listening');
      
      return true;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      return false;
    }
  }
  
  /**
   * Start wake word detection
   * @returns {Promise<boolean>} Success status
   */
  async startWakeWordDetection() {
    try {
      if (!this.initialized) {
        console.warn('Voice Command Service not initialized');
        return false;
      }
      
      if (!this.picovoice) {
        console.warn('Picovoice not initialized');
        return false;
      }
      
      if (this.wakeWordDetected) {
        console.warn('Wake word detection already active');
        return true;
      }
      
      // Start Picovoice
      await this.picovoice.start();
      
      // Set wake word detection flag
      this.wakeWordDetected = true;
      console.log('Started wake word detection');
      
      return true;
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      return false;
    }
  }
  
  /**
   * Stop wake word detection
   * @returns {Promise<boolean>} Success status
   */
  async stopWakeWordDetection() {
    try {
      if (!this.wakeWordDetected) {
        return true;
      }
      
      if (!this.picovoice) {
        return false;
      }
      
      // Stop Picovoice
      await this.picovoice.stop();
      
      // Reset flag
      this.wakeWordDetected = false;
      console.log('Stopped wake word detection');
      
      return true;
    } catch (error) {
      console.error('Error stopping wake word detection:', error);
      return false;
    }
  }
  
  /**
   * Handle speech start event
   */
  handleSpeechStart() {
    console.log('Speech started');
    
    if (this.onSpeechStart) {
      this.onSpeechStart();
    }
  }
  
  /**
   * Handle speech end event
   */
  handleSpeechEnd() {
    console.log('Speech ended');
    
    // Clear timeout
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
    
    if (this.onSpeechEnd) {
      this.onSpeechEnd();
    }
  }
  
  /**
   * Handle speech results event
   * @param {Object} event - Speech results event
   */
  handleSpeechResults(event) {
    if (!event.value || event.value.length === 0) {
      console.warn('No speech results');
      return;
    }
    
    const results = event.value;
    const transcript = results[0]; // Use the most confident result
    
    console.log('Speech results:', transcript);
    
    // Detect language
    const detectedLanguage = this.languageDetector.detectLanguage(transcript);
    console.log('Detected language:', detectedLanguage);
    
    if (this.onSpeechResults) {
      this.onSpeechResults(transcript, detectedLanguage);
    }
  }
  
  /**
   * Handle speech error event
   * @param {Object} event - Speech error event
   */
  handleSpeechError(event) {
    console.error('Speech recognition error:', event);
    
    // Clear timeout
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
    
    if (this.onSpeechError) {
      this.onSpeechError(event);
    }
  }
  
  /**
   * Handle wake word detection
   */
  handleWakeWordDetection() {
    console.log('Wake word detected');
    
    if (this.onWakeWordDetected) {
      this.onWakeWordDetected();
    }
    
    // Automatically start listening after wake word
    this.startListening();
  }
  
  /**
   * Set callback functions
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onSpeechStart) {
      this.onSpeechStart = callbacks.onSpeechStart;
    }
    
    if (callbacks.onSpeechEnd) {
      this.onSpeechEnd = callbacks.onSpeechEnd;
    }
    
    if (callbacks.onSpeechResults) {
      this.onSpeechResults = callbacks.onSpeechResults;
    }
    
    if (callbacks.onSpeechError) {
      this.onSpeechError = callbacks.onSpeechError;
    }
    
    if (callbacks.onWakeWordDetected) {
      this.onWakeWordDetected = callbacks.onWakeWordDetected;
    }
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      // Stop listening
      if (this.listening) {
        await this.stopListening();
      }
      
      // Stop wake word detection
      if (this.wakeWordDetected) {
        await this.stopWakeWordDetection();
      }
      
      // Remove event listeners
      if (this.listeners.length > 0) {
        this.listeners.forEach(listener => listener.remove());
        this.listeners = [];
      }
      
      // Destroy Picovoice
      if (this.picovoice) {
        await this.picovoice.delete();
        this.picovoice = null;
      }
      
      // Reset flags
      this.initialized = false;
      this.listening = false;
      this.wakeWordDetected = false;
      
      console.log('Voice Command Service cleaned up');
      
      return true;
    } catch (error) {
      console.error('Error cleaning up Voice Command Service:', error);
      return false;
    }
  }
  
  /**
   * Check if the service is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Check if the service is listening
   * @returns {boolean} Listening status
   */
  isListening() {
    return this.listening;
  }
  
  /**
   * Check if wake word detection is active
   * @returns {boolean} Wake word detection status
   */
  isWakeWordDetectionActive() {
    return this.wakeWordDetected;
  }
  
  /**
   * Get the current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  /**
   * Set the current language
   * @param {string} language - Language code ('en' or 'zh')
   */
  setLanguage(language) {
    if (appConfig.voice.languages.includes(language)) {
      this.currentLanguage = language;
      console.log(`Voice language set to: ${language}`);
    } else {
      console.warn(`Unsupported language: ${language}`);
    }
  }
}

// Create a singleton instance
const voiceCommandService = new VoiceCommandService();

export default voiceCommandService;

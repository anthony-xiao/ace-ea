/**
 * App Core for Ace Assistant
 * 
 * This module serves as the central core of the Ace Assistant application,
 * coordinating between the UI, services, and agent system.
 */

import { Platform } from 'react-native';
import appConfig from '../constants/appConfig';
import { AgentCoordinator } from '../services/agents/coordinator';
import { TranslationService, LanguageDetector } from '../services/translation/detector';

/**
 * Class representing the core functionality of the Ace Assistant
 */
class AppCore {
  constructor() {
    // Initialize core components
    this.initialized = false;
    this.agentCoordinator = null;
    this.translationService = null;
    this.languageDetector = null;
    this.currentLanguage = appConfig.voice.defaultLanguage;
    this.platform = Platform.OS;
    this.isIOS = this.platform === 'ios';
    this.isMacOS = this.platform === 'macos';
    this.apiKeys = {};
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.processVoiceCommand = this.processVoiceCommand.bind(this);
    this.processTextCommand = this.processTextCommand.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.getAgentResponse = this.getAgentResponse.bind(this);
  }
  
  /**
   * Initialize the App Core
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Ace Assistant Core...');
      
      // Initialize language services
      this.languageDetector = new LanguageDetector();
      this.translationService = new TranslationService();
      
      // Load API keys (in a real implementation, these would be securely stored)
      this.apiKeys = {
        perplexity: process.env.PERPLEXITY_API_KEY || 'demo_key',
        picovoice: process.env.PICOVOICE_API_KEY || 'demo_key',
        google: process.env.GOOGLE_CLIENT_ID || 'demo_key'
      };
      
      // Initialize agent coordinator with API keys
      this.agentCoordinator = new AgentCoordinator(this.apiKeys);
      await this.agentCoordinator.initialize();
      
      // Set initialization flag
      this.initialized = true;
      console.log('Ace Assistant Core initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Ace Assistant Core:', error);
      return false;
    }
  }
  
  /**
   * Process a voice command
   * @param {string} voiceText - The transcribed voice command
   * @param {string} detectedLanguage - The detected language of the command
   * @returns {Promise<Object>} Processing result
   */
  async processVoiceCommand(voiceText, detectedLanguage = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      console.log(`Processing voice command: "${voiceText}"`);
      
      // Detect language if not provided
      const language = detectedLanguage || this.languageDetector.detectLanguage(voiceText);
      
      // Process the command through the agent coordinator
      const result = await this.processTextCommand(voiceText, language);
      
      return {
        success: true,
        originalCommand: voiceText,
        language,
        response: result.response,
        action: result.action,
        data: result.data
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        success: false,
        originalCommand: voiceText,
        error: error.message
      };
    }
  }
  
  /**
   * Process a text command
   * @param {string} text - The text command
   * @param {string} language - The language of the command
   * @returns {Promise<Object>} Processing result
   */
  async processTextCommand(text, language = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Detect language if not provided
      const detectedLanguage = language || this.languageDetector.detectLanguage(text);
      
      // If the detected language is different from the current UI language,
      // translate the command for processing if needed
      let processedText = text;
      let translationResult = null;
      
      if (detectedLanguage !== 'en' && this.agentCoordinator.requiresTranslation) {
        translationResult = await this.translationService.translate(text, 'en');
        if (translationResult.success) {
          processedText = translationResult.translatedText;
        }
      }
      
      // Process the command through the agent coordinator
      const result = await this.agentCoordinator.processCommand(processedText, detectedLanguage);
      
      // If the response needs to be in a different language than English,
      // translate the response
      if (detectedLanguage !== 'en' && result.response) {
        const responseTranslation = await this.translationService.translate(
          result.response, 
          detectedLanguage
        );
        
        if (responseTranslation.success) {
          result.response = responseTranslation.translatedText;
        }
      }
      
      return {
        success: true,
        originalCommand: text,
        processedCommand: processedText,
        language: detectedLanguage,
        translation: translationResult,
        response: result.response,
        action: result.action,
        data: result.data
      };
    } catch (error) {
      console.error('Error processing text command:', error);
      return {
        success: false,
        originalCommand: text,
        error: error.message
      };
    }
  }
  
  /**
   * Set the current language
   * @param {string} language - The language code ('en' or 'zh')
   */
  setLanguage(language) {
    if (appConfig.voice.languages.includes(language)) {
      this.currentLanguage = language;
      console.log(`Language set to: ${language}`);
    } else {
      console.warn(`Unsupported language: ${language}`);
    }
  }
  
  /**
   * Get a response from a specific agent
   * @param {string} agentType - The type of agent to use
   * @param {string} query - The query to process
   * @param {string} language - The language of the query
   * @returns {Promise<Object>} Agent response
   */
  async getAgentResponse(agentType, query, language = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Detect language if not provided
      const detectedLanguage = language || this.languageDetector.detectLanguage(query);
      
      // If the detected language is different from English and the agent requires translation,
      // translate the query for processing
      let processedQuery = query;
      let translationResult = null;
      
      if (detectedLanguage !== 'en' && this.agentCoordinator.requiresTranslation) {
        translationResult = await this.translationService.translate(query, 'en');
        if (translationResult.success) {
          processedQuery = translationResult.translatedText;
        }
      }
      
      // Get response from the specific agent
      const result = await this.agentCoordinator.getAgentResponse(agentType, processedQuery);
      
      // If the response needs to be in a different language than English,
      // translate the response
      if (detectedLanguage !== 'en' && result.response) {
        const responseTranslation = await this.translationService.translate(
          result.response, 
          detectedLanguage
        );
        
        if (responseTranslation.success) {
          result.response = responseTranslation.translatedText;
        }
      }
      
      return {
        success: true,
        originalQuery: query,
        processedQuery,
        language: detectedLanguage,
        translation: translationResult,
        response: result.response,
        data: result.data
      };
    } catch (error) {
      console.error(`Error getting response from ${agentType} agent:`, error);
      return {
        success: false,
        originalQuery: query,
        agentType,
        error: error.message
      };
    }
  }
  
  /**
   * Check if the assistant is initialized
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Get the current platform (iOS or macOS)
   * @returns {string} Platform name
   */
  getPlatform() {
    return this.platform;
  }
  
  /**
   * Get the current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Create a singleton instance
const appCore = new AppCore();

export default appCore;

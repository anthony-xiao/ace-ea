/**
 * Ace Provider Component for Ace Assistant
 * 
 * This component provides a React Context for accessing the Ace Assistant core
 * functionality throughout the application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import appCore from '../AppCore';
import useLocalization from '../../hooks/useLocalization';

// Create context
const AceContext = createContext(null);

/**
 * Hook for using the Ace Assistant context
 * @returns {Object} Ace context value
 */
export const useAce = () => {
  const context = useContext(AceContext);
  if (!context) {
    throw new Error('useAce must be used within an AceProvider');
  }
  return context;
};

/**
 * Ace Provider Component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Component
 */
export const AceProvider = ({ children }) => {
  // State
  const [initialized, setInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [error, setError] = useState(null);
  
  // Get localization utilities
  const { language, setLanguage } = useLocalization();
  
  // Initialize Ace core on mount
  useEffect(() => {
    const initializeAce = async () => {
      try {
        const success = await appCore.initialize();
        setInitialized(success);
        
        if (success) {
          // Set the language in the core to match the UI language
          appCore.setLanguage(language);
        }
      } catch (err) {
        console.error('Error initializing Ace:', err);
        setError(err.message);
      }
    };
    
    initializeAce();
  }, []);
  
  // Listen for app state changes to reinitialize if needed
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && !appCore.isInitialized()) {
        appCore.initialize().then(success => {
          setInitialized(success);
        });
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Update core language when UI language changes
  useEffect(() => {
    if (initialized) {
      appCore.setLanguage(language);
    }
  }, [language, initialized]);
  
  /**
   * Process a voice command
   * @param {string} voiceText - The transcribed voice command
   * @param {string} detectedLanguage - The detected language of the command
   * @returns {Promise<Object>} Processing result
   */
  const processVoiceCommand = async (voiceText, detectedLanguage = null) => {
    try {
      setProcessing(true);
      setError(null);
      setLastCommand({ text: voiceText, type: 'voice', language: detectedLanguage });
      
      const result = await appCore.processVoiceCommand(voiceText, detectedLanguage);
      
      setLastResponse(result);
      setProcessing(false);
      return result;
    } catch (err) {
      console.error('Error processing voice command:', err);
      setError(err.message);
      setProcessing(false);
      return { success: false, error: err.message };
    }
  };
  
  /**
   * Process a text command
   * @param {string} text - The text command
   * @param {string} language - The language of the command
   * @returns {Promise<Object>} Processing result
   */
  const processTextCommand = async (text, language = null) => {
    try {
      setProcessing(true);
      setError(null);
      setLastCommand({ text, type: 'text', language });
      
      const result = await appCore.processTextCommand(text, language);
      
      setLastResponse(result);
      setProcessing(false);
      return result;
    } catch (err) {
      console.error('Error processing text command:', err);
      setError(err.message);
      setProcessing(false);
      return { success: false, error: err.message };
    }
  };
  
  /**
   * Get a response from a specific agent
   * @param {string} agentType - The type of agent to use
   * @param {string} query - The query to process
   * @param {string} language - The language of the query
   * @returns {Promise<Object>} Agent response
   */
  const getAgentResponse = async (agentType, query, language = null) => {
    try {
      setProcessing(true);
      setError(null);
      
      const result = await appCore.getAgentResponse(agentType, query, language);
      
      setProcessing(false);
      return result;
    } catch (err) {
      console.error(`Error getting response from ${agentType} agent:`, err);
      setError(err.message);
      setProcessing(false);
      return { success: false, error: err.message };
    }
  };
  
  // Context value
  const contextValue = {
    initialized,
    processing,
    lastCommand,
    lastResponse,
    error,
    platform: appCore.getPlatform(),
    isIOS: appCore.isIOS,
    isMacOS: appCore.isMacOS,
    language: appCore.getCurrentLanguage(),
    processVoiceCommand,
    processTextCommand,
    getAgentResponse,
    setLanguage: (newLanguage) => {
      appCore.setLanguage(newLanguage);
      setLanguage(newLanguage);
    }
  };
  
  return (
    <AceContext.Provider value={contextValue}>
      {children}
    </AceContext.Provider>
  );
};

export default AceProvider;

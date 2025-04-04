/**
 * useVoiceCommands Hook for Ace Assistant
 * 
 * This hook provides access to the voice command functionality throughout the application,
 * with support for both English and Chinese languages.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import voiceCommandService from '../services/voice/VoiceCommandService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';
import appConfig from '../constants/appConfig';

/**
 * Hook for using voice commands
 * @param {Object} options - Hook options
 * @returns {Object} Voice command utilities
 */
const useVoiceCommands = (options = {}) => {
  // Get options with defaults
  const {
    autoInitialize = true,
    enableWakeWord = true,
    enableHapticFeedback = true,
    apiKey = process.env.PICOVOICE_API_KEY || 'demo_key'
  } = options;
  
  // Get Ace context and localization
  const ace = useAce();
  const { t, language } = useLocalization();
  
  // State
  const [initialized, setInitialized] = useState(false);
  const [listening, setListening] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(language);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Refs
  const appStateRef = useRef(AppState.currentState);
  
  // Initialize voice command service
  const initialize = useCallback(async () => {
    try {
      setError(null);
      
      const success = await voiceCommandService.initialize(apiKey);
      
      if (success) {
        setInitialized(true);
        
        // Set callbacks
        voiceCommandService.setCallbacks({
          onSpeechStart: () => {
            setListening(true);
            setTranscript('');
            setError(null);
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
          onSpeechEnd: () => {
            setListening(false);
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
          onSpeechResults: (results, language) => {
            setTranscript(results);
            setDetectedLanguage(language);
            
            // Process the command
            processCommand(results, language);
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          },
          onSpeechError: (event) => {
            setListening(false);
            setError(event.error);
            
            // Provide haptic feedback for error
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
          onWakeWordDetected: () => {
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        });
        
        // Start wake word detection if enabled
        if (enableWakeWord) {
          const wakeWordSuccess = await voiceCommandService.startWakeWordDetection();
          setWakeWordActive(wakeWordSuccess);
        }
        
        return true;
      } else {
        setError('Failed to initialize voice command service');
        return false;
      }
    } catch (err) {
      console.error('Error initializing voice commands:', err);
      setError(err.message);
      return false;
    }
  }, [apiKey, enableWakeWord, enableHapticFeedback]);
  
  // Start listening for voice commands
  const startListening = useCallback(async () => {
    try {
      if (!initialized) {
        await initialize();
      }
      
      setError(null);
      
      const success = await voiceCommandService.startListening(language);
      
      if (success) {
        setListening(true);
        setTranscript('');
        
        // Provide haptic feedback
        if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        return true;
      } else {
        setError('Failed to start listening');
        return false;
      }
    } catch (err) {
      console.error('Error starting voice listening:', err);
      setError(err.message);
      return false;
    }
  }, [initialized, language, enableHapticFeedback, initialize]);
  
  // Stop listening for voice commands
  const stopListening = useCallback(async () => {
    try {
      const success = await voiceCommandService.stopListening();
      
      if (success) {
        setListening(false);
        
        // Provide haptic feedback
        if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        return true;
      } else {
        setError('Failed to stop listening');
        return false;
      }
    } catch (err) {
      console.error('Error stopping voice listening:', err);
      setError(err.message);
      return false;
    }
  }, [enableHapticFeedback]);
  
  // Toggle wake word detection
  const toggleWakeWordDetection = useCallback(async () => {
    try {
      if (!initialized) {
        await initialize();
      }
      
      if (wakeWordActive) {
        const success = await voiceCommandService.stopWakeWordDetection();
        
        if (success) {
          setWakeWordActive(false);
          return true;
        } else {
          setError('Failed to stop wake word detection');
          return false;
        }
      } else {
        const success = await voiceCommandService.startWakeWordDetection();
        
        if (success) {
          setWakeWordActive(true);
          return true;
        } else {
          setError('Failed to start wake word detection');
          return false;
        }
      }
    } catch (err) {
      console.error('Error toggling wake word detection:', err);
      setError(err.message);
      return false;
    }
  }, [initialized, wakeWordActive, initialize]);
  
  // Process voice command
  const processCommand = useCallback(async (command, commandLanguage = null) => {
    try {
      setProcessing(true);
      
      // Use the detected language or fall back to the current language
      const language = commandLanguage || detectedLanguage || ace.language;
      
      // Process the command through the Ace core
      const result = await ace.processVoiceCommand(command, language);
      
      setProcessing(false);
      
      // Provide haptic feedback for success
      if (result.success && enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      return result;
    } catch (err) {
      console.error('Error processing voice command:', err);
      setError(err.message);
      setProcessing(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return { success: false, error: err.message };
    }
  }, [ace, detectedLanguage, enableHapticFeedback]);
  
  // Clean up resources
  const cleanup = useCallback(async () => {
    try {
      const success = await voiceCommandService.cleanup();
      
      if (success) {
        setInitialized(false);
        setListening(false);
        setWakeWordActive(false);
        setTranscript('');
        setError(null);
        
        return true;
      } else {
        setError('Failed to clean up voice command service');
        return false;
      }
    } catch (err) {
      console.error('Error cleaning up voice commands:', err);
      setError(err.message);
      return false;
    }
  }, []);
  
  // Initialize on mount if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
    
    // Clean up on unmount
    return () => {
      cleanup();
    };
  }, [autoInitialize, initialize, cleanup]);
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (initialized && enableWakeWord && !wakeWordActive) {
          voiceCommandService.startWakeWordDetection().then(success => {
            setWakeWordActive(success);
          });
        }
      } else if (nextAppState.match(/inactive|background/) && appStateRef.current === 'active') {
        // App has gone to the background
        if (listening) {
          voiceCommandService.stopListening().then(() => {
            setListening(false);
          });
        }
      }
      
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [initialized, listening, wakeWordActive, enableWakeWord]);
  
  // Update language when UI language changes
  useEffect(() => {
    if (initialized) {
      voiceCommandService.setLanguage(language);
    }
  }, [language, initialized]);
  
  // Return hook value
  return {
    initialized,
    listening,
    wakeWordActive,
    transcript,
    detectedLanguage,
    error,
    processing,
    initialize,
    startListening,
    stopListening,
    toggleWakeWordDetection,
    processCommand,
    cleanup,
    // Helper functions
    getWakeWord: () => language === 'zh' ? WAKE_WORD_CHINESE : WAKE_WORD,
    getExampleCommands: () => {
      return t('voice.command_examples', []);
    },
    isInitialized: () => initialized,
    isListening: () => listening,
    isWakeWordActive: () => wakeWordActive,
    isProcessing: () => processing
  };
};

export default useVoiceCommands;

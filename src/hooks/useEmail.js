/**
 * useEmail Hook for Ace Assistant
 * 
 * This hook provides access to the email management functionality throughout the application,
 * with support for both English and Chinese languages.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import emailService, { 
  EMAIL_STATUSES, 
  EMAIL_PRIORITIES, 
  EMAIL_CONTEXTS 
} from '../services/organization/EmailService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';

/**
 * Hook for using emails
 * @param {Object} options - Hook options
 * @returns {Object} Email utilities
 */
const useEmail = (options = {}) => {
  // Get options with defaults
  const {
    autoInitialize = true,
    enableHapticFeedback = true,
    defaultFilters = {}
  } = options;
  
  // Get Ace context and localization
  const ace = useAce();
  const { language } = useLocalization();
  
  // State
  const [initialized, setInitialized] = useState(false);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  
  // Initialize email service
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await emailService.initialize();
      
      if (success) {
        setInitialized(true);
        
        // Set callbacks
        emailService.setCallbacks({
          onEmailAdded: (email) => {
            // Refresh emails
            refreshEmails();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          onEmailUpdated: () => {
            // Refresh emails
            refreshEmails();
          },
          onEmailDeleted: () => {
            // Refresh emails
            refreshEmails();
          },
          onEmailStatusChanged: (email, previousStatus) => {
            // Refresh emails
            refreshEmails();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          },
          onEmailSent: (email) => {
            // Refresh emails
            refreshEmails();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        });
        
        // Set language
        emailService.setLanguage(language);
        
        // Load emails
        refreshEmails();
        
        setLoading(false);
        return true;
      } else {
        setError('Failed to initialize email service');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error initializing emails:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [language, enableHapticFeedback]);
  
  // Refresh emails
  const refreshEmails = useCallback(() => {
    try {
      const filteredEmails = emailService.getEmails(filters);
      setEmails(filteredEmails);
      return filteredEmails;
    } catch (err) {
      console.error('Error refreshing emails:', err);
      setError(err.message);
      return [];
    }
  }, [filters]);
  
  // Create an email
  const createEmail = useCallback(async (emailData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set language if not provided
      if (!emailData.language) {
        emailData.language = language;
      }
      
      const email = await emailService.createEmail(emailData);
      
      // Refresh emails
      refreshEmails();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return email;
    } catch (err) {
      console.error('Error creating email:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [language, refreshEmails, enableHapticFeedback]);
  
  // Update an email
  const updateEmail = useCallback(async (id, emailData) => {
    try {
      setLoading(true);
      setError(null);
      
      const email = await emailService.updateEmail(id, emailData);
      
      // Refresh emails
      refreshEmails();
      
      setLoading(false);
      return email;
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshEmails, enableHapticFeedback]);
  
  // Delete an email
  const deleteEmail = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await emailService.deleteEmail(id);
      
      // Refresh emails
      refreshEmails();
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error('Error deleting email:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return false;
    }
  }, [refreshEmails, enableHapticFeedback]);
  
  // Send an email
  const sendEmail = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const email = await emailService.sendEmail(id);
      
      // Refresh emails
      refreshEmails();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return email;
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshEmails, enableHapticFeedback]);
  
  // Add attachment to email
  const addAttachment = useCallback(async (id, attachment) => {
    try {
      const email = await emailService.addAttachment(id, attachment);
      
      // Refresh emails
      refreshEmails();
      
      return email;
    } catch (err) {
      console.error('Error adding attachment to email:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshEmails, enableHapticFeedback]);
  
  // Remove attachment from email
  const removeAttachment = useCallback(async (id, attachmentId) => {
    try {
      const email = await emailService.removeAttachment(id, attachmentId);
      
      // Refresh emails
      refreshEmails();
      
      return email;
    } catch (err) {
      console.error('Error removing attachment from email:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshEmails, enableHapticFeedback]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      // Remove null or undefined values
      Object.keys(updatedFilters).forEach(key => {
        if (updatedFilters[key] === null || updatedFilters[key] === undefined) {
          delete updatedFilters[key];
        }
      });
      
      return updatedFilters;
    });
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);
  
  // Clean up resources
  const cleanup = useCallback(async () => {
    try {
      const success = await emailService.cleanup();
      
      if (success) {
        setInitialized(false);
        setEmails([]);
        setError(null);
        
        return true;
      } else {
        setError('Failed to clean up email service');
        return false;
      }
    } catch (err) {
      console.error('Error cleaning up emails:', err);
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
  
  // Refresh emails when filters change
  useEffect(() => {
    if (initialized) {
      refreshEmails();
    }
  }, [initialized, filters, refreshEmails]);
  
  // Update language when UI language changes
  useEffect(() => {
    if (initialized) {
      emailService.setLanguage(language);
    }
  }, [language, initialized]);
  
  // Helper functions
  const getDraftEmails = useCallback(() => {
    return emails.filter(e => e.status === EMAIL_STATUSES.DRAFT);
  }, [emails]);
  
  const getSentEmails = useCallback(() => {
    return emails.filter(e => e.status === EMAIL_STATUSES.SENT);
  }, [emails]);
  
  const getReceivedEmails = useCallback(() => {
    return emails.filter(e => e.status === EMAIL_STATUSES.RECEIVED);
  }, [emails]);
  
  const getScheduledEmails = useCallback(() => {
    const now = new Date();
    return emails
      .filter(e => e.status === EMAIL_STATUSES.DRAFT && e.scheduledDate && new Date(e.scheduledDate) > now)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }, [emails]);
  
  const getEmailsByContext = useCallback((context) => {
    return emails.filter(e => e.context === context);
  }, [emails]);
  
  const getEmailsByPriority = useCallback((priority) => {
    return emails.filter(e => e.priority === priority);
  }, [emails]);
  
  // Return hook value
  return {
    // State
    initialized,
    emails,
    loading,
    error,
    filters,
    
    // Constants
    statuses: EMAIL_STATUSES,
    priorities: EMAIL_PRIORITIES,
    contexts: EMAIL_CONTEXTS,
    
    // Core functions
    initialize,
    refreshEmails,
    createEmail,
    updateEmail,
    deleteEmail,
    sendEmail,
    addAttachment,
    removeAttachment,
    updateFilters,
    resetFilters,
    cleanup,
    
    // Helper functions
    getDraftEmails,
    getSentEmails,
    getReceivedEmails,
    getScheduledEmails,
    getEmailsByContext,
    getEmailsByPriority,
    getEmailById: emailService.getEmailById,
    
    // Status checks
    isInitialized: () => initialized,
    isLoading: () => loading,
    hasError: () => error !== null
  };
};

export default useEmail;

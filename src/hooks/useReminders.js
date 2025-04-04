/**
 * useReminders Hook for Ace Assistant
 * 
 * This hook provides access to the reminder functionality throughout the application,
 * with support for both English and Chinese languages.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import reminderService, { 
  REMINDER_CATEGORIES, 
  REMINDER_PRIORITIES, 
  REMINDER_CONTEXTS 
} from '../services/reminders/ReminderService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';

/**
 * Hook for using reminders
 * @param {Object} options - Hook options
 * @returns {Object} Reminder utilities
 */
const useReminders = (options = {}) => {
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
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  
  // Initialize reminder service
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await reminderService.initialize();
      
      if (success) {
        setInitialized(true);
        
        // Set callbacks
        reminderService.setCallbacks({
          onReminderTriggered: (reminder) => {
            // Refresh reminders
            refreshReminders();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          onReminderAdded: () => {
            // Refresh reminders
            refreshReminders();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          onReminderUpdated: () => {
            // Refresh reminders
            refreshReminders();
          },
          onReminderDeleted: () => {
            // Refresh reminders
            refreshReminders();
          }
        });
        
        // Set language
        reminderService.setLanguage(language);
        
        // Load reminders
        refreshReminders();
        
        setLoading(false);
        return true;
      } else {
        setError('Failed to initialize reminder service');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error initializing reminders:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [language, enableHapticFeedback]);
  
  // Refresh reminders
  const refreshReminders = useCallback(() => {
    try {
      const filteredReminders = reminderService.getReminders(filters);
      setReminders(filteredReminders);
      return filteredReminders;
    } catch (err) {
      console.error('Error refreshing reminders:', err);
      setError(err.message);
      return [];
    }
  }, [filters]);
  
  // Create a reminder
  const createReminder = useCallback(async (reminderData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set language if not provided
      if (!reminderData.language) {
        reminderData.language = language;
      }
      
      const reminder = await reminderService.createReminder(reminderData);
      
      // Refresh reminders
      refreshReminders();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return reminder;
    } catch (err) {
      console.error('Error creating reminder:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [language, refreshReminders, enableHapticFeedback]);
  
  // Update a reminder
  const updateReminder = useCallback(async (id, reminderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const reminder = await reminderService.updateReminder(id, reminderData);
      
      // Refresh reminders
      refreshReminders();
      
      setLoading(false);
      return reminder;
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshReminders, enableHapticFeedback]);
  
  // Delete a reminder
  const deleteReminder = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await reminderService.deleteReminder(id);
      
      // Refresh reminders
      refreshReminders();
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return false;
    }
  }, [refreshReminders, enableHapticFeedback]);
  
  // Toggle reminder completion
  const toggleReminderCompletion = useCallback(async (id) => {
    try {
      const reminder = reminderService.getReminderById(id);
      
      if (!reminder) {
        throw new Error(`Reminder with ID ${id} not found`);
      }
      
      const updatedReminder = await reminderService.updateReminder(id, {
        completed: !reminder.completed
      });
      
      // Refresh reminders
      refreshReminders();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      return updatedReminder;
    } catch (err) {
      console.error('Error toggling reminder completion:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return null;
    }
  }, [refreshReminders, enableHapticFeedback]);
  
  // Toggle reminder active status
  const toggleReminderActive = useCallback(async (id) => {
    try {
      const reminder = reminderService.getReminderById(id);
      
      if (!reminder) {
        throw new Error(`Reminder with ID ${id} not found`);
      }
      
      const updatedReminder = await reminderService.updateReminder(id, {
        active: !reminder.active
      });
      
      // Refresh reminders
      refreshReminders();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      return updatedReminder;
    } catch (err) {
      console.error('Error toggling reminder active status:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return null;
    }
  }, [refreshReminders, enableHapticFeedback]);
  
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
      const success = await reminderService.cleanup();
      
      if (success) {
        setInitialized(false);
        setReminders([]);
        setError(null);
        
        return true;
      } else {
        setError('Failed to clean up reminder service');
        return false;
      }
    } catch (err) {
      console.error('Error cleaning up reminders:', err);
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
  
  // Refresh reminders when filters change
  useEffect(() => {
    if (initialized) {
      refreshReminders();
    }
  }, [initialized, filters, refreshReminders]);
  
  // Update language when UI language changes
  useEffect(() => {
    if (initialized) {
      reminderService.setLanguage(language);
    }
  }, [language, initialized]);
  
  // Helper functions
  const getUpcomingReminders = useCallback((count = 5) => {
    const now = new Date();
    return reminders
      .filter(r => !r.completed && r.active && new Date(r.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, count);
  }, [reminders]);
  
  const getOverdueReminders = useCallback(() => {
    const now = new Date();
    return reminders
      .filter(r => !r.completed && r.active && new Date(r.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [reminders]);
  
  const getRemindersByCategory = useCallback((category) => {
    return reminders.filter(r => r.category === category);
  }, [reminders]);
  
  const getRemindersByContext = useCallback((context) => {
    return reminders.filter(r => r.context === context);
  }, [reminders]);
  
  const getRemindersByPriority = useCallback((priority) => {
    return reminders.filter(r => r.priority === priority);
  }, [reminders]);
  
  // Return hook value
  return {
    // State
    initialized,
    reminders,
    loading,
    error,
    filters,
    
    // Constants
    categories: REMINDER_CATEGORIES,
    priorities: REMINDER_PRIORITIES,
    contexts: REMINDER_CONTEXTS,
    
    // Core functions
    initialize,
    refreshReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminderCompletion,
    toggleReminderActive,
    updateFilters,
    resetFilters,
    cleanup,
    
    // Helper functions
    getUpcomingReminders,
    getOverdueReminders,
    getRemindersByCategory,
    getRemindersByContext,
    getRemindersByPriority,
    getReminderById: reminderService.getReminderById,
    
    // Status checks
    isInitialized: () => initialized,
    isLoading: () => loading,
    hasError: () => error !== null
  };
};

export default useReminders;

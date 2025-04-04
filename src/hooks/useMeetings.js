/**
 * useMeetings Hook for Ace Assistant
 * 
 * This hook provides access to the meeting management functionality throughout the application,
 * with support for both English and Chinese languages.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import meetingService, { 
  MEETING_STATUSES, 
  MEETING_PRIORITIES, 
  MEETING_CONTEXTS 
} from '../services/organization/MeetingService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';

/**
 * Hook for using meetings
 * @param {Object} options - Hook options
 * @returns {Object} Meeting utilities
 */
const useMeetings = (options = {}) => {
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
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  
  // Initialize meeting service
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await meetingService.initialize();
      
      if (success) {
        setInitialized(true);
        
        // Set callbacks
        meetingService.setCallbacks({
          onMeetingAdded: (meeting) => {
            // Refresh meetings
            refreshMeetings();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          onMeetingUpdated: () => {
            // Refresh meetings
            refreshMeetings();
          },
          onMeetingDeleted: () => {
            // Refresh meetings
            refreshMeetings();
          },
          onMeetingStatusChanged: (meeting, previousStatus) => {
            // Refresh meetings
            refreshMeetings();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          },
          onMeetingStarted: (meeting) => {
            // Refresh meetings
            refreshMeetings();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        });
        
        // Set language
        meetingService.setLanguage(language);
        
        // Load meetings
        refreshMeetings();
        
        setLoading(false);
        return true;
      } else {
        setError('Failed to initialize meeting service');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error initializing meetings:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [language, enableHapticFeedback]);
  
  // Refresh meetings
  const refreshMeetings = useCallback(() => {
    try {
      const filteredMeetings = meetingService.getMeetings(filters);
      setMeetings(filteredMeetings);
      return filteredMeetings;
    } catch (err) {
      console.error('Error refreshing meetings:', err);
      setError(err.message);
      return [];
    }
  }, [filters]);
  
  // Create a meeting
  const createMeeting = useCallback(async (meetingData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set language if not provided
      if (!meetingData.language) {
        meetingData.language = language;
      }
      
      const meeting = await meetingService.createMeeting(meetingData);
      
      // Refresh meetings
      refreshMeetings();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return meeting;
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [language, refreshMeetings, enableHapticFeedback]);
  
  // Update a meeting
  const updateMeeting = useCallback(async (id, meetingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const meeting = await meetingService.updateMeeting(id, meetingData);
      
      // Refresh meetings
      refreshMeetings();
      
      setLoading(false);
      return meeting;
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Delete a meeting
  const deleteMeeting = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await meetingService.deleteMeeting(id);
      
      // Refresh meetings
      refreshMeetings();
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return false;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Start a meeting
  const startMeeting = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const meeting = await meetingService.startMeeting(id);
      
      // Refresh meetings
      refreshMeetings();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return meeting;
    } catch (err) {
      console.error('Error starting meeting:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Add participant to meeting
  const addParticipant = useCallback(async (id, participant) => {
    try {
      const meeting = await meetingService.addParticipant(id, participant);
      
      // Refresh meetings
      refreshMeetings();
      
      return meeting;
    } catch (err) {
      console.error('Error adding participant to meeting:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Remove participant from meeting
  const removeParticipant = useCallback(async (id, participant) => {
    try {
      const meeting = await meetingService.removeParticipant(id, participant);
      
      // Refresh meetings
      refreshMeetings();
      
      return meeting;
    } catch (err) {
      console.error('Error removing participant from meeting:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Add attachment to meeting
  const addAttachment = useCallback(async (id, attachment) => {
    try {
      const meeting = await meetingService.addAttachment(id, attachment);
      
      // Refresh meetings
      refreshMeetings();
      
      return meeting;
    } catch (err) {
      console.error('Error adding attachment to meeting:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
  // Remove attachment from meeting
  const removeAttachment = useCallback(async (id, attachmentId) => {
    try {
      const meeting = await meetingService.removeAttachment(id, attachmentId);
      
      // Refresh meetings
      refreshMeetings();
      
      return meeting;
    } catch (err) {
      console.error('Error removing attachment from meeting:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshMeetings, enableHapticFeedback]);
  
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
      const success = await meetingService.cleanup();
      
      if (success) {
        setInitialized(false);
        setMeetings([]);
        setError(null);
        
        return true;
      } else {
        setError('Failed to clean up meeting service');
        return false;
      }
    } catch (err) {
      console.error('Error cleaning up meetings:', err);
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
  
  // Refresh meetings when filters change
  useEffect(() => {
    if (initialized) {
      refreshMeetings();
    }
  }, [initialized, filters, refreshMeetings]);
  
  // Update language when UI language changes
  useEffect(() => {
    if (initialized) {
      meetingService.setLanguage(language);
    }
  }, [language, initialized]);
  
  // Helper functions
  const getUpcomingMeetings = useCallback((count = 5) => {
    const now = new Date();
    return meetings
      .filter(m => m.status === MEETING_STATUSES.SCHEDULED && new Date(m.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, count);
  }, [meetings]);
  
  const getTodayMeetings = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return meetings
      .filter(m => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= today && meetingDate < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [meetings]);
  
  const getInProgressMeetings = useCallback(() => {
    return meetings.filter(m => m.status === MEETING_STATUSES.IN_PROGRESS);
  }, [meetings]);
  
  const getCompletedMeetings = useCallback(() => {
    return meetings.filter(m => m.status === MEETING_STATUSES.COMPLETED);
  }, [meetings]);
  
  const getMeetingsByContext = useCallback((context) => {
    return meetings.filter(m => m.context === context);
  }, [meetings]);
  
  const getMeetingsByPriority = useCallback((priority) => {
    return meetings.filter(m => m.priority === priority);
  }, [meetings]);
  
  // Return hook value
  return {
    // State
    initialized,
    meetings,
    loading,
    error,
    filters,
    
    // Constants
    statuses: MEETING_STATUSES,
    priorities: MEETING_PRIORITIES,
    contexts: MEETING_CONTEXTS,
    
    // Core functions
    initialize,
    refreshMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    startMeeting,
    addParticipant,
    removeParticipant,
    addAttachment,
    removeAttachment,
    updateFilters,
    resetFilters,
    cleanup,
    
    // Helper functions
    getUpcomingMeetings,
    getTodayMeetings,
    getInProgressMeetings,
    getCompletedMeetings,
    getMeetingsByContext,
    getMeetingsByPriority,
    getMeetingById: meetingService.getMeetingById,
    
    // Status checks
    isInitialized: () => initialized,
    isLoading: () => loading,
    hasError: () => error !== null
  };
};

export default useMeetings;

/**
 * useSync Hook for Ace Assistant
 * 
 * This hook provides access to the sync functionality throughout the application,
 * enabling cross-device synchronization between iPhone and Mac.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import syncService from '../services/sync/SyncService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';

/**
 * Hook for using sync functionality
 * @param {Object} options - Hook options
 * @returns {Object} Sync utilities
 */
const useSync = (options = {}) => {
  // Get options with defaults
  const {
    autoStart = true,
    enableHapticFeedback = true
  } = options;
  
  // Get Ace context and localization
  const ace = useAce();
  const { t } = useLocalization();
  
  // State
  const [initialized, setInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [error, setError] = useState(null);
  
  // Refs
  const appStateRef = useRef(AppState.currentState);
  const listenerRef = useRef(null);
  
  // Initialize sync service
  const initialize = useCallback(async () => {
    try {
      setError(null);
      
      const success = await syncService.initialize();
      
      if (success) {
        setInitialized(true);
        
        // Get initial sync status
        const status = syncService.getSyncStatus();
        setIsOnline(status.isOnline);
        setIsSyncing(status.isSyncing);
        setSyncEnabled(status.syncEnabled);
        setLastSyncTimestamp(status.lastSyncTimestamp);
        setPendingChangesCount(status.pendingChangesCount);
        
        return true;
      } else {
        setError('Failed to initialize sync service');
        return false;
      }
    } catch (err) {
      console.error('Error initializing sync:', err);
      setError(err.message);
      return false;
    }
  }, []);
  
  // Start sync
  const startSync = useCallback(async () => {
    try {
      if (!initialized) {
        await initialize();
      }
      
      setError(null);
      
      const success = await syncService.startSync();
      
      if (success) {
        setSyncEnabled(true);
        
        // Provide haptic feedback
        if (enableHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        return true;
      } else {
        setError('Failed to start sync');
        return false;
      }
    } catch (err) {
      console.error('Error starting sync:', err);
      setError(err.message);
      return false;
    }
  }, [initialized, enableHapticFeedback, initialize]);
  
  // Stop sync
  const stopSync = useCallback(async () => {
    try {
      const success = await syncService.stopSync();
      
      if (success) {
        setSyncEnabled(false);
        
        // Provide haptic feedback
        if (enableHapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        return true;
      } else {
        setError('Failed to stop sync');
        return false;
      }
    } catch (err) {
      console.error('Error stopping sync:', err);
      setError(err.message);
      return false;
    }
  }, [enableHapticFeedback]);
  
  // Force sync
  const forceSync = useCallback(async () => {
    try {
      if (!initialized) {
        await initialize();
      }
      
      setError(null);
      
      // Provide haptic feedback
      if (enableHapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const result = await syncService.forceSync();
      
      if (result.success) {
        // Provide haptic feedback for success
        if (enableHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        return result;
      } else {
        setError(result.error);
        
        // Provide haptic feedback for error
        if (enableHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        return result;
      }
    } catch (err) {
      console.error('Error forcing sync:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return { success: false, error: err.message };
    }
  }, [initialized, enableHapticFeedback, initialize]);
  
  // Track change
  const trackChange = useCallback(async (entityType, action, entityId, data = null) => {
    try {
      if (!initialized) {
        await initialize();
      }
      
      const success = await syncService.trackChange(entityType, action, entityId, data);
      
      if (success) {
        // Update pending changes count
        const status = syncService.getSyncStatus();
        setPendingChangesCount(status.pendingChangesCount);
        
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error tracking change:', err);
      return false;
    }
  }, [initialized, initialize]);
  
  // Reset sync
  const resetSync = useCallback(async () => {
    try {
      const success = await syncService.resetSync();
      
      if (success) {
        // Update state
        setLastSyncTimestamp(0);
        setPendingChangesCount(0);
        
        // Provide haptic feedback
        if (enableHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        return true;
      } else {
        setError('Failed to reset sync');
        return false;
      }
    } catch (err) {
      console.error('Error resetting sync:', err);
      setError(err.message);
      return false;
    }
  }, [enableHapticFeedback]);
  
  // Handle sync events
  const handleSyncEvent = useCallback((event) => {
    switch (event.type) {
      case 'status':
        setIsSyncing(event.isSyncing);
        if (event.syncEnabled !== undefined) {
          setSyncEnabled(event.syncEnabled);
        }
        break;
        
      case 'sync':
        setIsSyncing(false);
        if (event.success) {
          setLastSyncTimestamp(event.timestamp);
          setPendingChangesCount(0);
        } else if (event.error) {
          setError(event.error);
        }
        break;
        
      case 'connectivity':
        setIsOnline(event.isOnline);
        break;
        
      case 'change':
        // Update pending changes count
        const status = syncService.getSyncStatus();
        setPendingChangesCount(status.pendingChangesCount);
        break;
        
      case 'reset':
        setLastSyncTimestamp(0);
        setPendingChangesCount(0);
        break;
        
      default:
        break;
    }
  }, []);
  
  // Initialize on mount if autoStart is true
  useEffect(() => {
    const initAndStart = async () => {
      await initialize();
      
      if (autoStart) {
        await startSync();
      }
    };
    
    initAndStart();
    
    // Set up event listener
    listenerRef.current = syncService.addListener(handleSyncEvent);
    
    // Clean up on unmount
    return () => {
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
      
      syncService.cleanup();
    };
  }, [autoStart, initialize, startSync, handleSyncEvent]);
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (initialized && syncEnabled) {
          // Force a sync when app becomes active
          forceSync();
        }
      }
      
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [initialized, syncEnabled, forceSync]);
  
  // Return hook value
  return {
    initialized,
    isOnline,
    isSyncing,
    syncEnabled,
    lastSyncTimestamp,
    pendingChangesCount,
    error,
    initialize,
    startSync,
    stopSync,
    forceSync,
    trackChange,
    resetSync,
    // Helper functions
    getLastSyncTime: () => {
      if (!lastSyncTimestamp) return t('sync.never');
      
      const now = new Date();
      const lastSync = new Date(lastSyncTimestamp);
      const diffMs = now - lastSync;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return t('sync.days_ago', { count: diffDay });
      } else if (diffHour > 0) {
        return t('sync.hours_ago', { count: diffHour });
      } else if (diffMin > 0) {
        return t('sync.minutes_ago', { count: diffMin });
      } else {
        return t('sync.just_now');
      }
    },
    getSyncStatus: () => syncService.getSyncStatus(),
    hasPendingChanges: () => pendingChangesCount > 0,
    toggleSync: () => syncEnabled ? stopSync() : startSync()
  };
};

export default useSync;

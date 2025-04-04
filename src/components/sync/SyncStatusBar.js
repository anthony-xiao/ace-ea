/**
 * SyncStatusBar Component for Ace Assistant
 * 
 * This component displays the current synchronization status and provides
 * controls for managing sync operations.
 */

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSync from '../../hooks/useSync';
import useLocalization from '../../hooks/useLocalization';

/**
 * SyncStatusBar component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const SyncStatusBar = ({ 
  showControls = true,
  compact = false,
  style
}) => {
  // Get sync and localization
  const { 
    isOnline,
    isSyncing,
    syncEnabled,
    lastSyncTimestamp,
    pendingChangesCount,
    error,
    forceSync,
    toggleSync,
    getLastSyncTime
  } = useSync();
  
  const { t } = useLocalization();
  
  // Handle sync button press
  const handleSyncPress = useCallback(() => {
    if (isSyncing) return;
    forceSync();
  }, [isSyncing, forceSync]);
  
  // Handle toggle sync press
  const handleTogglePress = useCallback(() => {
    toggleSync();
  }, [toggleSync]);
  
  // Render compact version
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <TouchableOpacity
            onPress={handleSyncPress}
            disabled={!isOnline}
          >
            <Ionicons 
              name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"} 
              size={20} 
              color={isOnline ? (syncEnabled ? "#34C759" : "#007AFF") : "#FF3B30"} 
            />
          </TouchableOpacity>
        )}
        
        {pendingChangesCount > 0 && (
          <View style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>{pendingChangesCount}</Text>
          </View>
        )}
      </View>
    );
  }
  
  // Render full version
  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusSection}>
        <View style={styles.statusIconContainer}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons 
              name={isOnline ? (syncEnabled ? "cloud-done-outline" : "cloud-outline") : "cloud-offline-outline"} 
              size={24} 
              color={isOnline ? (syncEnabled ? "#34C759" : "#007AFF") : "#FF3B30"} 
            />
          )}
        </View>
        
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>
            {isSyncing 
              ? t('sync.status.syncing')
              : !isOnline 
                ? t('sync.status.offline')
                : syncEnabled 
                  ? t('sync.status.enabled')
                  : t('sync.status.disabled')
            }
          </Text>
          
          <Text style={styles.lastSyncText}>
            {t('sync.last_sync')}: {getLastSyncTime()}
          </Text>
          
          {pendingChangesCount > 0 && (
            <Text style={styles.pendingText}>
              {t('sync.pending_changes', { count: pendingChangesCount })}
            </Text>
          )}
          
          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}
        </View>
      </View>
      
      {showControls && (
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[
              styles.syncButton,
              (!isOnline || isSyncing) && styles.disabledButton
            ]}
            onPress={handleSyncPress}
            disabled={!isOnline || isSyncing}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              syncEnabled ? styles.toggleButtonOn : styles.toggleButtonOff
            ]}
            onPress={handleTogglePress}
          >
            <Ionicons 
              name={syncEnabled ? "power" : "power-outline"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  statusTextContainer: {
    flex: 1
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2
  },
  lastSyncText: {
    fontSize: 14,
    color: '#8E8E93'
  },
  pendingText: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 2
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 2
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toggleButtonOn: {
    backgroundColor: '#34C759'
  },
  toggleButtonOff: {
    backgroundColor: '#8E8E93'
  },
  disabledButton: {
    opacity: 0.5
  },
  compactContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  compactBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default SyncStatusBar;

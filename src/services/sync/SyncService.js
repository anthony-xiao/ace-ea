/**
 * Sync Service for Ace Assistant
 * 
 * This service handles cross-device synchronization of data between iPhone and Mac
 * with support for both online and offline operation.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import appConfig from '../../constants/appConfig';

// Constants
const SYNC_INTERVAL = appConfig.sync.interval; // in milliseconds
const SYNC_ENDPOINT = appConfig.sync.endpoint;
const SYNC_STORAGE_KEY = '@ace_sync_data';
const SYNC_LAST_TIMESTAMP_KEY = '@ace_last_sync';
const SYNC_PENDING_CHANGES_KEY = '@ace_pending_changes';
const SYNC_DEVICE_ID_KEY = '@ace_device_id';

/**
 * Class representing the Sync Service
 */
class SyncService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.syncInterval = null;
    this.isOnline = true;
    this.isSyncing = false;
    this.deviceId = null;
    this.platform = Platform.OS;
    this.isIOS = this.platform === 'ios';
    this.isMacOS = this.platform === 'macos';
    this.lastSyncTimestamp = 0;
    this.pendingChanges = [];
    this.listeners = [];
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.startSync = this.startSync.bind(this);
    this.stopSync = this.stopSync.bind(this);
    this.syncData = this.syncData.bind(this);
    this.getDeviceId = this.getDeviceId.bind(this);
    this.trackChange = this.trackChange.bind(this);
    this.applyRemoteChanges = this.applyRemoteChanges.bind(this);
    this.resolveConflicts = this.resolveConflicts.bind(this);
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.notifyListeners = this.notifyListeners.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Sync Service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Sync Service...');
      
      // Get or generate device ID
      this.deviceId = await this.getDeviceId();
      
      // Get last sync timestamp
      const lastSyncStr = await AsyncStorage.getItem(SYNC_LAST_TIMESTAMP_KEY);
      this.lastSyncTimestamp = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
      
      // Get pending changes
      const pendingChangesStr = await AsyncStorage.getItem(SYNC_PENDING_CHANGES_KEY);
      this.pendingChanges = pendingChangesStr ? JSON.parse(pendingChangesStr) : [];
      
      // Set up network state listener
      this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;
        
        // If we just came online and have pending changes, trigger a sync
        if (!wasOnline && this.isOnline && this.pendingChanges.length > 0) {
          this.syncData();
        }
        
        // Notify listeners of connectivity change
        this.notifyListeners({
          type: 'connectivity',
          isOnline: this.isOnline
        });
      });
      
      // Check initial network state
      const netState = await NetInfo.fetch();
      this.isOnline = netState.isConnected && netState.isInternetReachable;
      
      // Set initialization flag
      this.initialized = true;
      console.log('Sync Service initialized successfully');
      console.log(`Device ID: ${this.deviceId}`);
      console.log(`Last sync: ${new Date(this.lastSyncTimestamp).toISOString()}`);
      console.log(`Pending changes: ${this.pendingChanges.length}`);
      
      return true;
    } catch (error) {
      console.error('Error initializing Sync Service:', error);
      return false;
    }
  }
  
  /**
   * Start periodic synchronization
   * @returns {Promise<boolean>} Success status
   */
  async startSync() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (this.syncInterval) {
        console.warn('Sync already started');
        return true;
      }
      
      // Perform initial sync
      await this.syncData();
      
      // Set up interval for periodic sync
      this.syncInterval = setInterval(() => {
        this.syncData();
      }, SYNC_INTERVAL);
      
      console.log(`Started periodic sync (interval: ${SYNC_INTERVAL}ms)`);
      
      // Notify listeners
      this.notifyListeners({
        type: 'status',
        isSyncing: false,
        syncEnabled: true
      });
      
      return true;
    } catch (error) {
      console.error('Error starting sync:', error);
      return false;
    }
  }
  
  /**
   * Stop periodic synchronization
   * @returns {Promise<boolean>} Success status
   */
  async stopSync() {
    try {
      if (!this.syncInterval) {
        console.warn('Sync not started');
        return true;
      }
      
      // Clear sync interval
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      
      console.log('Stopped periodic sync');
      
      // Notify listeners
      this.notifyListeners({
        type: 'status',
        isSyncing: false,
        syncEnabled: false
      });
      
      return true;
    } catch (error) {
      console.error('Error stopping sync:', error);
      return false;
    }
  }
  
  /**
   * Synchronize data with the server
   * @returns {Promise<Object>} Sync result
   */
  async syncData() {
    try {
      if (this.isSyncing) {
        console.warn('Sync already in progress');
        return { success: false, error: 'Sync already in progress' };
      }
      
      if (!this.isOnline) {
        console.warn('Cannot sync while offline');
        return { success: false, error: 'Device is offline' };
      }
      
      this.isSyncing = true;
      
      // Notify listeners that sync has started
      this.notifyListeners({
        type: 'status',
        isSyncing: true
      });
      
      console.log('Starting data sync...');
      
      // Prepare data to send to server
      const syncData = {
        deviceId: this.deviceId,
        platform: this.platform,
        lastSyncTimestamp: this.lastSyncTimestamp,
        changes: this.pendingChanges
      };
      
      try {
        // In a real implementation, this would be an API call to the sync server
        // For demo purposes, we'll simulate a successful sync
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate server response with remote changes
        const serverResponse = {
          success: true,
          timestamp: Date.now(),
          changes: [] // In a real implementation, this would contain changes from other devices
        };
        
        // Apply remote changes
        if (serverResponse.changes && serverResponse.changes.length > 0) {
          await this.applyRemoteChanges(serverResponse.changes);
        }
        
        // Update last sync timestamp
        this.lastSyncTimestamp = serverResponse.timestamp;
        await AsyncStorage.setItem(SYNC_LAST_TIMESTAMP_KEY, this.lastSyncTimestamp.toString());
        
        // Clear pending changes that were successfully synced
        this.pendingChanges = [];
        await AsyncStorage.setItem(SYNC_PENDING_CHANGES_KEY, JSON.stringify(this.pendingChanges));
        
        console.log('Sync completed successfully');
        console.log(`New last sync: ${new Date(this.lastSyncTimestamp).toISOString()}`);
        
        // Notify listeners that sync has completed
        this.notifyListeners({
          type: 'sync',
          success: true,
          timestamp: this.lastSyncTimestamp
        });
        
        this.isSyncing = false;
        return { 
          success: true, 
          timestamp: this.lastSyncTimestamp 
        };
      } catch (error) {
        console.error('Error during sync:', error);
        
        // Notify listeners of sync error
        this.notifyListeners({
          type: 'sync',
          success: false,
          error: error.message
        });
        
        this.isSyncing = false;
        return { 
          success: false, 
          error: error.message 
        };
      }
    } catch (error) {
      console.error('Error in syncData:', error);
      this.isSyncing = false;
      
      // Notify listeners of sync error
      this.notifyListeners({
        type: 'sync',
        success: false,
        error: error.message
      });
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  /**
   * Get or generate a unique device ID
   * @returns {Promise<string>} Device ID
   */
  async getDeviceId() {
    try {
      // Try to get existing device ID
      const storedDeviceId = await AsyncStorage.getItem(SYNC_DEVICE_ID_KEY);
      
      if (storedDeviceId) {
        return storedDeviceId;
      }
      
      // Generate a new device ID
      const newDeviceId = uuidv4();
      
      // Store the device ID
      await AsyncStorage.setItem(SYNC_DEVICE_ID_KEY, newDeviceId);
      
      return newDeviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a random ID if AsyncStorage fails
      return `${this.platform}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }
  
  /**
   * Track a data change for synchronization
   * @param {string} entityType - Type of entity (task, email, meeting, reminder)
   * @param {string} action - Action performed (create, update, delete)
   * @param {string} entityId - ID of the entity
   * @param {Object} data - Entity data
   * @returns {Promise<boolean>} Success status
   */
  async trackChange(entityType, action, entityId, data = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Create change record
      const change = {
        id: uuidv4(),
        timestamp: Date.now(),
        deviceId: this.deviceId,
        entityType,
        action,
        entityId,
        data
      };
      
      // Add to pending changes
      this.pendingChanges.push(change);
      
      // Save pending changes
      await AsyncStorage.setItem(SYNC_PENDING_CHANGES_KEY, JSON.stringify(this.pendingChanges));
      
      console.log(`Tracked change: ${action} ${entityType} ${entityId}`);
      
      // If online and not currently syncing, trigger a sync
      if (this.isOnline && !this.isSyncing && this.syncInterval) {
        // Debounce sync to avoid too many requests
        if (this.syncDebounceTimeout) {
          clearTimeout(this.syncDebounceTimeout);
        }
        
        this.syncDebounceTimeout = setTimeout(() => {
          this.syncData();
          this.syncDebounceTimeout = null;
        }, 2000); // Wait 2 seconds before syncing
      }
      
      return true;
    } catch (error) {
      console.error('Error tracking change:', error);
      return false;
    }
  }
  
  /**
   * Apply changes from other devices
   * @param {Array} changes - Array of change objects
   * @returns {Promise<boolean>} Success status
   */
  async applyRemoteChanges(changes) {
    try {
      if (!changes || changes.length === 0) {
        return true;
      }
      
      console.log(`Applying ${changes.length} remote changes`);
      
      // Sort changes by timestamp
      const sortedChanges = [...changes].sort((a, b) => a.timestamp - b.timestamp);
      
      // Group changes by entity type and ID
      const changesByEntity = {};
      
      for (const change of sortedChanges) {
        const key = `${change.entityType}:${change.entityId}`;
        
        if (!changesByEntity[key]) {
          changesByEntity[key] = [];
        }
        
        changesByEntity[key].push(change);
      }
      
      // Process changes by entity
      for (const key in changesByEntity) {
        const entityChanges = changesByEntity[key];
        
        // Check for conflicts with local changes
        const localChanges = this.pendingChanges.filter(change => 
          `${change.entityType}:${change.entityId}` === key
        );
        
        if (localChanges.length > 0) {
          // Resolve conflicts
          await this.resolveConflicts(entityChanges, localChanges);
        } else {
          // Apply changes directly
          for (const change of entityChanges) {
            // Notify listeners of the change
            this.notifyListeners({
              type: 'change',
              entityType: change.entityType,
              action: change.action,
              entityId: change.entityId,
              data: change.data,
              remote: true
            });
          }
        }
      }
      
      console.log('Remote changes applied successfully');
      return true;
    } catch (error) {
      console.error('Error applying remote changes:', error);
      return false;
    }
  }
  
  /**
   * Resolve conflicts between local and remote changes
   * @param {Array} remoteChanges - Array of remote change objects
   * @param {Array} localChanges - Array of local change objects
   * @returns {Promise<boolean>} Success status
   */
  async resolveConflicts(remoteChanges, localChanges) {
    try {
      console.log('Resolving conflicts between local and remote changes');
      
      // Get the entity type and ID
      const entityType = remoteChanges[0].entityType;
      const entityId = remoteChanges[0].entityId;
      
      // Get the latest remote and local changes
      const latestRemote = remoteChanges[remoteChanges.length - 1];
      const latestLocal = localChanges[localChanges.length - 1];
      
      // Determine which change is newer
      if (latestLocal.timestamp > latestRemote.timestamp) {
        console.log(`Local change is newer for ${entityType} ${entityId}`);
        // Local change wins, keep it in pending changes
        return true;
      } else {
        console.log(`Remote change is newer for ${entityType} ${entityId}`);
        // Remote change wins, remove local changes from pending
        this.pendingChanges = this.pendingChanges.filter(change => 
          !(change.entityType === entityType && change.entityId === entityId)
        );
        
        // Save updated pending changes
        await AsyncStorage.setItem(SYNC_PENDING_CHANGES_KEY, JSON.stringify(this.pendingChanges));
        
        // Notify listeners of the remote change
        this.notifyListeners({
          type: 'change',
          entityType: latestRemote.entityType,
          action: latestRemote.action,
          entityId: latestRemote.entityId,
          data: latestRemote.data,
          remote: true
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error resolving conflicts:', error);
      return false;
    }
  }
  
  /**
   * Add a listener for sync events
   * @param {Function} listener - Listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.warn('Listener must be a function');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    return () => this.removeListener(listener);
  }
  
  /**
   * Remove a listener
   * @param {Function} listener - Listener function to remove
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * Notify all listeners of an event
   * @param {Object} event - Event object
   */
  notifyListeners(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    }
  }
  
  /**
   * Clean up resources
   * @returns {Promise<boolean>} Success status
   */
  async cleanup() {
    try {
      // Stop sync
      await this.stopSync();
      
      // Remove network listener
      if (this.netInfoUnsubscribe) {
        this.netInfoUnsubscribe();
        this.netInfoUnsubscribe = null;
      }
      
      // Clear listeners
      this.listeners = [];
      
      console.log('Sync Service cleaned up');
      return true;
    } catch (error) {
      console.error('Error cleaning up Sync Service:', error);
      return false;
    }
  }
  
  /**
   * Force an immediate sync
   * @returns {Promise<Object>} Sync result
   */
  async forceSync() {
    return await this.syncData();
  }
  
  /**
   * Get sync status
   * @returns {Object} Sync status
   */
  getSyncStatus() {
    return {
      initialized: this.initialized,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTimestamp: this.lastSyncTimestamp,
      pendingChangesCount: this.pendingChanges.length,
      syncEnabled: !!this.syncInterval,
      deviceId: this.deviceId,
      platform: this.platform
    };
  }
  
  /**
   * Reset sync data (for testing or user account changes)
   * @returns {Promise<boolean>} Success status
   */
  async resetSync() {
    try {
      // Stop sync
      await this.stopSync();
      
      // Clear sync data
      await AsyncStorage.removeItem(SYNC_LAST_TIMESTAMP_KEY);
      await AsyncStorage.removeItem(SYNC_PENDING_CHANGES_KEY);
      
      // Reset properties
      this.lastSyncTimestamp = 0;
      this.pendingChanges = [];
      
      console.log('Sync data reset');
      
      // Notify listeners
      this.notifyListeners({
        type: 'reset'
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting sync data:', error);
      return false;
    }
  }
}

// Create a singleton instance
const syncService = new SyncService();

export default syncService;

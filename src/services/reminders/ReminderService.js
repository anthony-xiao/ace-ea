/**
 * Reminder Service for Ace Assistant
 * 
 * This service handles the creation, management, and notification of reminders
 * with support for both English and Chinese languages.
 */

import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../constants/appConfig';
import { v4 as uuidv4 } from 'uuid';

// Constants
const REMINDER_STORAGE_KEY = '@ace_reminders';
const REMINDER_CATEGORIES = {
  TASK: 'task',
  EVENT: 'event',
  MEETING: 'meeting',
  EMAIL: 'email',
  CUSTOM: 'custom'
};

const REMINDER_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const REMINDER_CONTEXTS = {
  WORK: 'work',
  PERSONAL: 'personal',
  FAMILY: 'family'
};

const DEFAULT_ADVANCE_NOTICE = {
  [REMINDER_CATEGORIES.TASK]: 30, // 30 minutes
  [REMINDER_CATEGORIES.EVENT]: 60, // 1 hour
  [REMINDER_CATEGORIES.MEETING]: 15, // 15 minutes
  [REMINDER_CATEGORIES.EMAIL]: 30, // 30 minutes
  [REMINDER_CATEGORIES.CUSTOM]: 30 // 30 minutes
};

/**
 * Class representing the Reminder Service
 */
class ReminderService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.reminders = [];
    this.platform = Platform.OS;
    this.isIOS = this.platform === 'ios';
    this.isMacOS = this.platform === 'macos';
    this.currentLanguage = appConfig.defaultLanguage;
    this.listeners = [];
    this.notificationEmitter = null;
    
    // Callbacks
    this.onReminderTriggered = null;
    this.onReminderAdded = null;
    this.onReminderUpdated = null;
    this.onReminderDeleted = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.loadReminders = this.loadReminders.bind(this);
    this.saveReminders = this.saveReminders.bind(this);
    this.createReminder = this.createReminder.bind(this);
    this.updateReminder = this.updateReminder.bind(this);
    this.deleteReminder = this.deleteReminder.bind(this);
    this.getReminders = this.getReminders.bind(this);
    this.getReminderById = this.getReminderById.bind(this);
    this.scheduleNotification = this.scheduleNotification.bind(this);
    this.cancelNotification = this.cancelNotification.bind(this);
    this.handleNotification = this.handleNotification.bind(this);
    this.setCallbacks = this.setCallbacks.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Reminder Service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Reminder Service...');
      
      // Configure notifications
      if (this.isIOS || Platform.OS === 'android') {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
        
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Notification permissions not granted');
        }
        
        // Add notification listener
        const subscription = Notifications.addNotificationReceivedListener(this.handleNotification);
        this.listeners.push(subscription);
      }
      
      // Request calendar permissions for iOS and Android
      if (this.isIOS || Platform.OS === 'android') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Calendar permissions not granted');
        }
      }
      
      // Load saved reminders
      await this.loadReminders();
      
      // Set initialization flag
      this.initialized = true;
      console.log('Reminder Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Reminder Service:', error);
      return false;
    }
  }
  
  /**
   * Load reminders from storage
   * @returns {Promise<boolean>} Success status
   */
  async loadReminders() {
    try {
      const remindersJson = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
      
      if (remindersJson) {
        this.reminders = JSON.parse(remindersJson);
        console.log(`Loaded ${this.reminders.length} reminders`);
      } else {
        this.reminders = [];
      }
      
      return true;
    } catch (error) {
      console.error('Error loading reminders:', error);
      this.reminders = [];
      return false;
    }
  }
  
  /**
   * Save reminders to storage
   * @returns {Promise<boolean>} Success status
   */
  async saveReminders() {
    try {
      await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(this.reminders));
      return true;
    } catch (error) {
      console.error('Error saving reminders:', error);
      return false;
    }
  }
  
  /**
   * Create a new reminder
   * @param {Object} reminderData - Reminder data
   * @returns {Promise<Object>} Created reminder
   */
  async createReminder(reminderData) {
    try {
      // Validate required fields
      if (!reminderData.title) {
        throw new Error('Reminder title is required');
      }
      
      if (!reminderData.dueDate) {
        throw new Error('Reminder due date is required');
      }
      
      // Create reminder object
      const reminder = {
        id: uuidv4(),
        title: reminderData.title,
        description: reminderData.description || '',
        dueDate: new Date(reminderData.dueDate).toISOString(),
        category: reminderData.category || REMINDER_CATEGORIES.CUSTOM,
        priority: reminderData.priority || REMINDER_PRIORITIES.MEDIUM,
        context: reminderData.context || REMINDER_CONTEXTS.WORK,
        completed: false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notificationId: null,
        calendarEventId: null,
        advanceNotice: reminderData.advanceNotice || DEFAULT_ADVANCE_NOTICE[reminderData.category || REMINDER_CATEGORIES.CUSTOM],
        recurrence: reminderData.recurrence || null,
        relatedItemId: reminderData.relatedItemId || null,
        relatedItemType: reminderData.relatedItemType || null,
        language: reminderData.language || this.currentLanguage
      };
      
      // Schedule notification
      const notificationId = await this.scheduleNotification(reminder);
      reminder.notificationId = notificationId;
      
      // Add to calendar if it's an event or meeting
      if (reminder.category === REMINDER_CATEGORIES.EVENT || reminder.category === REMINDER_CATEGORIES.MEETING) {
        try {
          if (this.isIOS || Platform.OS === 'android') {
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.allowsModifications);
            
            if (defaultCalendar) {
              const calendarEvent = {
                title: reminder.title,
                notes: reminder.description,
                startDate: new Date(reminder.dueDate),
                endDate: new Date(new Date(reminder.dueDate).getTime() + 60 * 60 * 1000), // 1 hour duration by default
                alarms: [{ relativeOffset: -reminder.advanceNotice }]
              };
              
              const eventId = await Calendar.createEventAsync(defaultCalendar.id, calendarEvent);
              reminder.calendarEventId = eventId;
            }
          }
        } catch (calendarError) {
          console.warn('Error adding to calendar:', calendarError);
          // Continue without calendar integration
        }
      }
      
      // Add to reminders array
      this.reminders.push(reminder);
      
      // Save reminders
      await this.saveReminders();
      
      // Call callback
      if (this.onReminderAdded) {
        this.onReminderAdded(reminder);
      }
      
      console.log('Reminder created:', reminder.id);
      
      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing reminder
   * @param {string} id - Reminder ID
   * @param {Object} reminderData - Updated reminder data
   * @returns {Promise<Object>} Updated reminder
   */
  async updateReminder(id, reminderData) {
    try {
      // Find reminder
      const reminderIndex = this.reminders.findIndex(r => r.id === id);
      
      if (reminderIndex === -1) {
        throw new Error(`Reminder with ID ${id} not found`);
      }
      
      const reminder = this.reminders[reminderIndex];
      
      // Update fields
      const updatedReminder = {
        ...reminder,
        ...reminderData,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure dates are in ISO format
      if (reminderData.dueDate) {
        updatedReminder.dueDate = new Date(reminderData.dueDate).toISOString();
      }
      
      // Reschedule notification if necessary
      if (reminderData.dueDate || reminderData.advanceNotice || 
          reminderData.active === false || reminderData.completed === true) {
        
        // Cancel existing notification
        if (reminder.notificationId) {
          await this.cancelNotification(reminder.notificationId);
        }
        
        // Schedule new notification if active and not completed
        if (updatedReminder.active && !updatedReminder.completed) {
          const notificationId = await this.scheduleNotification(updatedReminder);
          updatedReminder.notificationId = notificationId;
        } else {
          updatedReminder.notificationId = null;
        }
      }
      
      // Update calendar event if necessary
      if (reminder.calendarEventId && (reminderData.dueDate || reminderData.title || reminderData.description)) {
        try {
          if (this.isIOS || Platform.OS === 'android') {
            const calendarEvent = {
              title: updatedReminder.title,
              notes: updatedReminder.description,
              startDate: new Date(updatedReminder.dueDate),
              endDate: new Date(new Date(updatedReminder.dueDate).getTime() + 60 * 60 * 1000), // 1 hour duration by default
              alarms: [{ relativeOffset: -updatedReminder.advanceNotice }]
            };
            
            await Calendar.updateEventAsync(reminder.calendarEventId, calendarEvent);
          }
        } catch (calendarError) {
          console.warn('Error updating calendar event:', calendarError);
          // Continue without calendar update
        }
      }
      
      // Update reminders array
      this.reminders[reminderIndex] = updatedReminder;
      
      // Save reminders
      await this.saveReminders();
      
      // Call callback
      if (this.onReminderUpdated) {
        this.onReminderUpdated(updatedReminder);
      }
      
      console.log('Reminder updated:', updatedReminder.id);
      
      return updatedReminder;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }
  
  /**
   * Delete a reminder
   * @param {string} id - Reminder ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteReminder(id) {
    try {
      // Find reminder
      const reminderIndex = this.reminders.findIndex(r => r.id === id);
      
      if (reminderIndex === -1) {
        throw new Error(`Reminder with ID ${id} not found`);
      }
      
      const reminder = this.reminders[reminderIndex];
      
      // Cancel notification
      if (reminder.notificationId) {
        await this.cancelNotification(reminder.notificationId);
      }
      
      // Delete calendar event
      if (reminder.calendarEventId) {
        try {
          if (this.isIOS || Platform.OS === 'android') {
            await Calendar.deleteEventAsync(reminder.calendarEventId);
          }
        } catch (calendarError) {
          console.warn('Error deleting calendar event:', calendarError);
          // Continue without calendar deletion
        }
      }
      
      // Remove from reminders array
      this.reminders.splice(reminderIndex, 1);
      
      // Save reminders
      await this.saveReminders();
      
      // Call callback
      if (this.onReminderDeleted) {
        this.onReminderDeleted(id);
      }
      
      console.log('Reminder deleted:', id);
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }
  
  /**
   * Get all reminders with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered reminders
   */
  getReminders(filters = {}) {
    try {
      let filteredReminders = [...this.reminders];
      
      // Filter by category
      if (filters.category) {
        filteredReminders = filteredReminders.filter(r => r.category === filters.category);
      }
      
      // Filter by priority
      if (filters.priority) {
        filteredReminders = filteredReminders.filter(r => r.priority === filters.priority);
      }
      
      // Filter by context
      if (filters.context) {
        filteredReminders = filteredReminders.filter(r => r.context === filters.context);
      }
      
      // Filter by completion status
      if (filters.completed !== undefined) {
        filteredReminders = filteredReminders.filter(r => r.completed === filters.completed);
      }
      
      // Filter by active status
      if (filters.active !== undefined) {
        filteredReminders = filteredReminders.filter(r => r.active === filters.active);
      }
      
      // Filter by due date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredReminders = filteredReminders.filter(r => new Date(r.dueDate) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredReminders = filteredReminders.filter(r => new Date(r.dueDate) <= endDate);
      }
      
      // Filter by related item
      if (filters.relatedItemId) {
        filteredReminders = filteredReminders.filter(r => r.relatedItemId === filters.relatedItemId);
      }
      
      if (filters.relatedItemType) {
        filteredReminders = filteredReminders.filter(r => r.relatedItemType === filters.relatedItemType);
      }
      
      // Filter by language
      if (filters.language) {
        filteredReminders = filteredReminders.filter(r => r.language === filters.language);
      }
      
      // Sort by due date (ascending)
      filteredReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      return filteredReminders;
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }
  
  /**
   * Get a reminder by ID
   * @param {string} id - Reminder ID
   * @returns {Object} Reminder object
   */
  getReminderById(id) {
    return this.reminders.find(r => r.id === id);
  }
  
  /**
   * Schedule a notification for a reminder
   * @param {Object} reminder - Reminder object
   * @returns {Promise<string>} Notification ID
   */
  async scheduleNotification(reminder) {
    try {
      if (!this.isIOS && Platform.OS !== 'android') {
        // Skip notification scheduling on platforms that don't support it
        return null;
      }
      
      // Calculate notification time
      const dueDate = new Date(reminder.dueDate);
      const notificationTime = new Date(dueDate.getTime() - (reminder.advanceNotice * 60 * 1000));
      
      // Skip if notification time is in the past
      if (notificationTime <= new Date()) {
        console.log('Notification time is in the past, skipping');
        return null;
      }
      
      // Prepare notification content
      const title = reminder.language === 'zh' ? 
        `提醒: ${reminder.title}` : 
        `Reminder: ${reminder.title}`;
      
      const body = reminder.language === 'zh' ? 
        (reminder.description || `您有一个即将到来的${getCategoryNameChinese(reminder.category)}`) : 
        (reminder.description || `You have an upcoming ${reminder.category}`);
      
      // Schedule notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { reminderId: reminder.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH
        },
        trigger: {
          date: notificationTime
        }
      });
      
      console.log('Notification scheduled:', notificationId);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
  
  /**
   * Cancel a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async cancelNotification(notificationId) {
    try {
      if (!notificationId || (!this.isIOS && Platform.OS !== 'android')) {
        return true;
      }
      
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification canceled:', notificationId);
      
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }
  
  /**
   * Handle notification received
   * @param {Object} notification - Notification object
   */
  handleNotification(notification) {
    try {
      const { reminderId } = notification.request.content.data;
      
      if (reminderId) {
        const reminder = this.getReminderById(reminderId);
        
        if (reminder) {
          console.log('Reminder triggered:', reminder.id);
          
          // Call callback
          if (this.onReminderTriggered) {
            this.onReminderTriggered(reminder);
          }
        }
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  }
  
  /**
   * Set callback functions
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onReminderTriggered) {
      this.onReminderTriggered = callbacks.onReminderTriggered;
    }
    
    if (callbacks.onReminderAdded) {
      this.onReminderAdded = callbacks.onReminderAdded;
    }
    
    if (callbacks.onReminderUpdated) {
      this.onReminderUpdated = callbacks.onReminderUpdated;
    }
    
    if (callbacks.onReminderDeleted) {
      this.onReminderDeleted = callbacks.onReminderDeleted;
    }
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      // Remove event listeners
      if (this.listeners.length > 0) {
        this.listeners.forEach(listener => listener.remove());
        this.listeners = [];
      }
      
      console.log('Reminder Service cleaned up');
      
      return true;
    } catch (error) {
      console.error('Error cleaning up Reminder Service:', error);
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
   * Set the current language
   * @param {string} language - Language code ('en' or 'zh')
   */
  setLanguage(language) {
    if (appConfig.languages.includes(language)) {
      this.currentLanguage = language;
      console.log(`Reminder language set to: ${language}`);
    } else {
      console.warn(`Unsupported language: ${language}`);
    }
  }
  
  /**
   * Get the current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

/**
 * Get Chinese name for reminder category
 * @param {string} category - Category code
 * @returns {string} Chinese category name
 */
function getCategoryNameChinese(category) {
  switch (category) {
    case REMINDER_CATEGORIES.TASK:
      return '任务';
    case REMINDER_CATEGORIES.EVENT:
      return '事件';
    case REMINDER_CATEGORIES.MEETING:
      return '会议';
    case REMINDER_CATEGORIES.EMAIL:
      return '邮件';
    case REMINDER_CATEGORIES.CUSTOM:
      return '提醒';
    default:
      return '提醒';
  }
}

// Create a singleton instance
const reminderService = new ReminderService();

export default reminderService;
export { 
  REMINDER_CATEGORIES, 
  REMINDER_PRIORITIES, 
  REMINDER_CONTEXTS,
  DEFAULT_ADVANCE_NOTICE
};

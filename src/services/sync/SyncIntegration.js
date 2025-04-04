/**
 * SyncIntegration for Ace Assistant
 * 
 * This module integrates the sync service with the organization services
 * (tasks, emails, meetings, reminders) to enable cross-device synchronization.
 */

import syncService from '../services/sync/SyncService';
import taskService from '../services/organization/TaskService';
import emailService from '../services/organization/EmailService';
import meetingService from '../services/organization/MeetingService';
import reminderService from '../services/reminders/ReminderService';

/**
 * Class representing the Sync Integration
 */
class SyncIntegration {
  constructor() {
    // Initialize properties
    this.initialized = false;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.integrateTaskService = this.integrateTaskService.bind(this);
    this.integrateEmailService = this.integrateEmailService.bind(this);
    this.integrateMeetingService = this.integrateMeetingService.bind(this);
    this.integrateReminderService = this.integrateReminderService.bind(this);
    this.handleSyncEvent = this.handleSyncEvent.bind(this);
  }
  
  /**
   * Initialize the Sync Integration
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Sync Integration...');
      
      // Initialize sync service if not already initialized
      if (!syncService.getSyncStatus().initialized) {
        await syncService.initialize();
      }
      
      // Add sync event listener
      this.syncListener = syncService.addListener(this.handleSyncEvent);
      
      // Integrate with services
      await this.integrateTaskService();
      await this.integrateEmailService();
      await this.integrateMeetingService();
      await this.integrateReminderService();
      
      // Set initialization flag
      this.initialized = true;
      console.log('Sync Integration initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Sync Integration:', error);
      return false;
    }
  }
  
  /**
   * Integrate with Task Service
   * @returns {Promise<boolean>} Success status
   */
  async integrateTaskService() {
    try {
      console.log('Integrating Task Service with Sync...');
      
      // Override task service methods to track changes
      
      // Store original methods
      const originalCreateTask = taskService.createTask;
      const originalUpdateTask = taskService.updateTask;
      const originalDeleteTask = taskService.deleteTask;
      
      // Override createTask
      taskService.createTask = async (taskData) => {
        // Call original method
        const task = await originalCreateTask.call(taskService, taskData);
        
        // Track change
        await syncService.trackChange('task', 'create', task.id, task);
        
        return task;
      };
      
      // Override updateTask
      taskService.updateTask = async (taskId, updateData) => {
        // Call original method
        const task = await originalUpdateTask.call(taskService, taskId, updateData);
        
        // Track change
        await syncService.trackChange('task', 'update', taskId, task);
        
        return task;
      };
      
      // Override deleteTask
      taskService.deleteTask = async (taskId) => {
        // Call original method
        const result = await originalDeleteTask.call(taskService, taskId);
        
        // Track change
        await syncService.trackChange('task', 'delete', taskId);
        
        return result;
      };
      
      console.log('Task Service integrated with Sync');
      return true;
    } catch (error) {
      console.error('Error integrating Task Service with Sync:', error);
      return false;
    }
  }
  
  /**
   * Integrate with Email Service
   * @returns {Promise<boolean>} Success status
   */
  async integrateEmailService() {
    try {
      console.log('Integrating Email Service with Sync...');
      
      // Override email service methods to track changes
      
      // Store original methods
      const originalCreateEmail = emailService.createEmail;
      const originalUpdateEmail = emailService.updateEmail;
      const originalDeleteEmail = emailService.deleteEmail;
      const originalSendEmail = emailService.sendEmail;
      
      // Override createEmail
      emailService.createEmail = async (emailData) => {
        // Call original method
        const email = await originalCreateEmail.call(emailService, emailData);
        
        // Track change
        await syncService.trackChange('email', 'create', email.id, email);
        
        return email;
      };
      
      // Override updateEmail
      emailService.updateEmail = async (emailId, updateData) => {
        // Call original method
        const email = await originalUpdateEmail.call(emailService, emailId, updateData);
        
        // Track change
        await syncService.trackChange('email', 'update', emailId, email);
        
        return email;
      };
      
      // Override deleteEmail
      emailService.deleteEmail = async (emailId) => {
        // Call original method
        const result = await originalDeleteEmail.call(emailService, emailId);
        
        // Track change
        await syncService.trackChange('email', 'delete', emailId);
        
        return result;
      };
      
      // Override sendEmail
      emailService.sendEmail = async (emailId) => {
        // Call original method
        const email = await originalSendEmail.call(emailService, emailId);
        
        // Track change
        await syncService.trackChange('email', 'send', emailId, email);
        
        return email;
      };
      
      console.log('Email Service integrated with Sync');
      return true;
    } catch (error) {
      console.error('Error integrating Email Service with Sync:', error);
      return false;
    }
  }
  
  /**
   * Integrate with Meeting Service
   * @returns {Promise<boolean>} Success status
   */
  async integrateMeetingService() {
    try {
      console.log('Integrating Meeting Service with Sync...');
      
      // Override meeting service methods to track changes
      
      // Store original methods
      const originalCreateMeeting = meetingService.createMeeting;
      const originalUpdateMeeting = meetingService.updateMeeting;
      const originalDeleteMeeting = meetingService.deleteMeeting;
      const originalStartMeeting = meetingService.startMeeting;
      
      // Override createMeeting
      meetingService.createMeeting = async (meetingData) => {
        // Call original method
        const meeting = await originalCreateMeeting.call(meetingService, meetingData);
        
        // Track change
        await syncService.trackChange('meeting', 'create', meeting.id, meeting);
        
        return meeting;
      };
      
      // Override updateMeeting
      meetingService.updateMeeting = async (meetingId, updateData) => {
        // Call original method
        const meeting = await originalUpdateMeeting.call(meetingService, meetingId, updateData);
        
        // Track change
        await syncService.trackChange('meeting', 'update', meetingId, meeting);
        
        return meeting;
      };
      
      // Override deleteMeeting
      meetingService.deleteMeeting = async (meetingId) => {
        // Call original method
        const result = await originalDeleteMeeting.call(meetingService, meetingId);
        
        // Track change
        await syncService.trackChange('meeting', 'delete', meetingId);
        
        return result;
      };
      
      // Override startMeeting
      meetingService.startMeeting = async (meetingId) => {
        // Call original method
        const meeting = await originalStartMeeting.call(meetingService, meetingId);
        
        // Track change
        await syncService.trackChange('meeting', 'start', meetingId, meeting);
        
        return meeting;
      };
      
      console.log('Meeting Service integrated with Sync');
      return true;
    } catch (error) {
      console.error('Error integrating Meeting Service with Sync:', error);
      return false;
    }
  }
  
  /**
   * Integrate with Reminder Service
   * @returns {Promise<boolean>} Success status
   */
  async integrateReminderService() {
    try {
      console.log('Integrating Reminder Service with Sync...');
      
      // Override reminder service methods to track changes
      
      // Store original methods
      const originalCreateReminder = reminderService.createReminder;
      const originalUpdateReminder = reminderService.updateReminder;
      const originalDeleteReminder = reminderService.deleteReminder;
      
      // Override createReminder
      reminderService.createReminder = async (reminderData) => {
        // Call original method
        const reminder = await originalCreateReminder.call(reminderService, reminderData);
        
        // Track change
        await syncService.trackChange('reminder', 'create', reminder.id, reminder);
        
        return reminder;
      };
      
      // Override updateReminder
      reminderService.updateReminder = async (reminderId, updateData) => {
        // Call original method
        const reminder = await originalUpdateReminder.call(reminderService, reminderId, updateData);
        
        // Track change
        await syncService.trackChange('reminder', 'update', reminderId, reminder);
        
        return reminder;
      };
      
      // Override deleteReminder
      reminderService.deleteReminder = async (reminderId) => {
        // Call original method
        const result = await originalDeleteReminder.call(reminderService, reminderId);
        
        // Track change
        await syncService.trackChange('reminder', 'delete', reminderId);
        
        return result;
      };
      
      console.log('Reminder Service integrated with Sync');
      return true;
    } catch (error) {
      console.error('Error integrating Reminder Service with Sync:', error);
      return false;
    }
  }
  
  /**
   * Handle sync events
   * @param {Object} event - Sync event
   */
  handleSyncEvent(event) {
    // Handle remote changes
    if (event.type === 'change' && event.remote) {
      const { entityType, action, entityId, data } = event;
      
      // Apply changes to appropriate service
      switch (entityType) {
        case 'task':
          this.applyTaskChange(action, entityId, data);
          break;
          
        case 'email':
          this.applyEmailChange(action, entityId, data);
          break;
          
        case 'meeting':
          this.applyMeetingChange(action, entityId, data);
          break;
          
        case 'reminder':
          this.applyReminderChange(action, entityId, data);
          break;
          
        default:
          console.warn(`Unknown entity type: ${entityType}`);
          break;
      }
    }
  }
  
  /**
   * Apply task change from remote
   * @param {string} action - Action (create, update, delete)
   * @param {string} taskId - Task ID
   * @param {Object} data - Task data
   */
  async applyTaskChange(action, taskId, data) {
    try {
      switch (action) {
        case 'create':
          // Check if task already exists
          try {
            await taskService.getTaskById(taskId);
            // Task exists, update instead
            await taskService.updateTaskWithoutSync(taskId, data);
          } catch (err) {
            // Task doesn't exist, create it
            await taskService.createTaskWithoutSync(data);
          }
          break;
          
        case 'update':
          await taskService.updateTaskWithoutSync(taskId, data);
          break;
          
        case 'delete':
          await taskService.deleteTaskWithoutSync(taskId);
          break;
          
        default:
          console.warn(`Unknown task action: ${action}`);
          break;
      }
    } catch (error) {
      console.error(`Error applying remote task ${action}:`, error);
    }
  }
  
  /**
   * Apply email change from remote
   * @param {string} action - Action (create, update, delete, send)
   * @param {string} emailId - Email ID
   * @param {Object} data - Email data
   */
  async applyEmailChange(action, emailId, data) {
    try {
      switch (action) {
        case 'create':
          // Check if email already exists
          try {
            await emailService.getEmailById(emailId);
            // Email exists, update instead
            await emailService.updateEmailWithoutSync(emailId, data);
          } catch (err) {
            // Email doesn't exist, create it
            await emailService.createEmailWithoutSync(data);
          }
          break;
          
        case 'update':
          await emailService.updateEmailWithoutSync(emailId, data);
          break;
          
        case 'delete':
          await emailService.deleteEmailWithoutSync(emailId);
          break;
          
        case 'send':
          await emailService.updateEmailWithoutSync(emailId, {
            ...data,
            status: 'sent'
          });
          break;
          
        default:
          console.warn(`Unknown email action: ${action}`);
          break;
      }
    } catch (error) {
      console.error(`Error applying remote email ${action}:`, error);
    }
  }
  
  /**
   * Apply meeting change from remote
   * @param {string} action - Action (create, update, delete, start)
   * @param {string} meetingId - Meeting ID
   * @param {Object} data - Meeting data
   */
  async applyMeetingChange(action, meetingId, data) {
    try {
      switch (action) {
        case 'create':
          // Check if meeting already exists
          try {
            await meetingService.getMeetingById(meetingId);
            // Meeting exists, update instead
            await meetingService.updateMeetingWithoutSync(meetingId, data);
          } catch (err) {
            // Meeting doesn't exist, create it
            await meetingService.createMeetingWithoutSync(data);
          }
          break;
          
        case 'update':
          await meetingService.updateMeetingWithoutSync(meetingId, data);
          break;
          
        case 'delete':
          await meetingService.deleteMeetingWithoutSync(meetingId);
          break;
          
        case 'start':
          await meetingService.updateMeetingWithoutSync(meetingId, {
            ...data,
            status: 'in_progress'
          });
          break;
          
        default:
          console.warn(`Unknown meeting action: ${action}`);
          break;
      }
    } catch (error) {
      console.error(`Error applying remote meeting ${action}:`, error);
    }
  }
  
  /**
   * Apply reminder change from remote
   * @param {string} action - Action (create, update, delete)
   * @param {string} reminderId - Reminder ID
   * @param {Object} data - Reminder data
   */
  async applyReminderChange(action, reminderId, data) {
    try {
      switch (action) {
        case 'create':
          // Check if reminder already exists
          try {
            await reminderService.getReminderById(reminderId);
            // Reminder exists, update instead
            await reminderService.updateReminderWithoutSync(reminderId, data);
          } catch (err) {
            // Reminder doesn't exist, create it
            await reminderService.createReminderWithoutSync(data);
          }
          break;
          
        case 'update':
          await reminderService.updateReminderWithoutSync(reminderId, data);
          break;
          
        case 'delete':
          await reminderService.deleteReminderWithoutSync(reminderId);
          break;
          
        default:
          console.warn(`Unknown reminder action: ${action}`);
          break;
      }
    } catch (error) {
      console.error(`Error applying remote reminder ${action}:`, error);
    }
  }
  
  /**
   * Clean up resources
   * @returns {Promise<boolean>} Success status
   */
  async cleanup() {
    try {
      // Remove sync event listener
      if (this.syncListener) {
        this.syncListener();
        this.syncListener = null;
      }
      
      console.log('Sync Integration cleaned up');
      return true;
    } catch (error) {
      console.error('Error cleaning up Sync Integration:', error);
      return false;
    }
  }
}

// Create a singleton instance
const syncIntegration = new SyncIntegration();

// Initialize on import
syncIntegration.initialize().catch(error => {
  console.error('Error initializing Sync Integration on import:', error);
});

export default syncIntegration;

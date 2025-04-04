/**
 * Email Service for Ace Assistant
 * 
 * This service handles email management with integration capabilities for Superhuman
 * and support for both English and Chinese languages.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import reminderService from '../reminders/ReminderService';
import appConfig from '../../constants/appConfig';

// Constants
const EMAIL_STORAGE_KEY = '@ace_emails';
const EMAIL_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  RECEIVED: 'received',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
};

const EMAIL_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const EMAIL_CONTEXTS = {
  WORK: 'work',
  PERSONAL: 'personal',
  FAMILY: 'family'
};

/**
 * Class representing the Email Service
 */
class EmailService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.emails = [];
    this.currentLanguage = appConfig.defaultLanguage;
    this.superhuman = null;
    
    // Callbacks
    this.onEmailAdded = null;
    this.onEmailUpdated = null;
    this.onEmailDeleted = null;
    this.onEmailStatusChanged = null;
    this.onEmailSent = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.loadEmails = this.loadEmails.bind(this);
    this.saveEmails = this.saveEmails.bind(this);
    this.createEmail = this.createEmail.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.deleteEmail = this.deleteEmail.bind(this);
    this.getEmails = this.getEmails.bind(this);
    this.getEmailById = this.getEmailById.bind(this);
    this.changeEmailStatus = this.changeEmailStatus.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);
    this.setCallbacks = this.setCallbacks.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Email Service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Email Service...');
      
      // Load saved emails
      await this.loadEmails();
      
      // Initialize Superhuman integration (mock for now)
      this.superhuman = {
        isConnected: false,
        connect: async () => {
          console.log('Connecting to Superhuman (mock)...');
          this.superhuman.isConnected = true;
          return true;
        },
        disconnect: async () => {
          console.log('Disconnecting from Superhuman (mock)...');
          this.superhuman.isConnected = false;
          return true;
        },
        sendEmail: async (email) => {
          console.log('Sending email via Superhuman (mock):', email.subject);
          return { success: true, id: uuidv4() };
        },
        fetchEmails: async (count = 10) => {
          console.log(`Fetching ${count} emails from Superhuman (mock)...`);
          return [];
        }
      };
      
      // Set initialization flag
      this.initialized = true;
      console.log('Email Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Email Service:', error);
      return false;
    }
  }
  
  /**
   * Load emails from storage
   * @returns {Promise<boolean>} Success status
   */
  async loadEmails() {
    try {
      const emailsJson = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
      
      if (emailsJson) {
        this.emails = JSON.parse(emailsJson);
        console.log(`Loaded ${this.emails.length} emails`);
      } else {
        this.emails = [];
      }
      
      return true;
    } catch (error) {
      console.error('Error loading emails:', error);
      this.emails = [];
      return false;
    }
  }
  
  /**
   * Save emails to storage
   * @returns {Promise<boolean>} Success status
   */
  async saveEmails() {
    try {
      await AsyncStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(this.emails));
      return true;
    } catch (error) {
      console.error('Error saving emails:', error);
      return false;
    }
  }
  
  /**
   * Create a new email
   * @param {Object} emailData - Email data
   * @returns {Promise<Object>} Created email
   */
  async createEmail(emailData) {
    try {
      // Validate required fields
      if (!emailData.subject) {
        throw new Error('Email subject is required');
      }
      
      // Create email object
      const email = {
        id: uuidv4(),
        subject: emailData.subject,
        body: emailData.body || '',
        to: emailData.to || [],
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        from: emailData.from || 'user@example.com',
        status: emailData.status || EMAIL_STATUSES.DRAFT,
        priority: emailData.priority || EMAIL_PRIORITIES.MEDIUM,
        context: emailData.context || EMAIL_CONTEXTS.WORK,
        scheduledDate: emailData.scheduledDate ? new Date(emailData.scheduledDate).toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: emailData.attachments || [],
        tags: emailData.tags || [],
        reminderId: null,
        language: emailData.language || this.currentLanguage
      };
      
      // Create reminder if scheduled date is provided
      if (email.scheduledDate && emailData.createReminder !== false) {
        try {
          const reminder = await reminderService.createReminder({
            title: `Send email: ${email.subject}`,
            description: `To: ${email.to.join(', ')}`,
            dueDate: email.scheduledDate,
            category: 'email',
            priority: email.priority,
            context: email.context,
            relatedItemId: email.id,
            relatedItemType: 'email',
            language: email.language
          });
          
          email.reminderId = reminder.id;
        } catch (reminderError) {
          console.warn('Error creating reminder for email:', reminderError);
          // Continue without reminder
        }
      }
      
      // Add to emails array
      this.emails.push(email);
      
      // Save emails
      await this.saveEmails();
      
      // Call callback
      if (this.onEmailAdded) {
        this.onEmailAdded(email);
      }
      
      console.log('Email created:', email.id);
      
      return email;
    } catch (error) {
      console.error('Error creating email:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing email
   * @param {string} id - Email ID
   * @param {Object} emailData - Updated email data
   * @returns {Promise<Object>} Updated email
   */
  async updateEmail(id, emailData) {
    try {
      // Find email
      const emailIndex = this.emails.findIndex(e => e.id === id);
      
      if (emailIndex === -1) {
        throw new Error(`Email with ID ${id} not found`);
      }
      
      const email = this.emails[emailIndex];
      
      // Update fields
      const updatedEmail = {
        ...email,
        ...emailData,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure dates are in ISO format
      if (emailData.scheduledDate) {
        updatedEmail.scheduledDate = new Date(emailData.scheduledDate).toISOString();
      }
      
      // Update reminder if scheduled date changed
      if (email.reminderId && emailData.scheduledDate) {
        try {
          await reminderService.updateReminder(email.reminderId, {
            title: `Send email: ${updatedEmail.subject}`,
            description: `To: ${updatedEmail.to.join(', ')}`,
            dueDate: updatedEmail.scheduledDate,
            priority: updatedEmail.priority,
            context: updatedEmail.context
          });
        } catch (reminderError) {
          console.warn('Error updating reminder for email:', reminderError);
          // Continue without reminder update
        }
      }
      
      // Create reminder if scheduled date is added and no reminder exists
      if (!email.reminderId && updatedEmail.scheduledDate && emailData.createReminder !== false) {
        try {
          const reminder = await reminderService.createReminder({
            title: `Send email: ${updatedEmail.subject}`,
            description: `To: ${updatedEmail.to.join(', ')}`,
            dueDate: updatedEmail.scheduledDate,
            category: 'email',
            priority: updatedEmail.priority,
            context: updatedEmail.context,
            relatedItemId: updatedEmail.id,
            relatedItemType: 'email',
            language: updatedEmail.language
          });
          
          updatedEmail.reminderId = reminder.id;
        } catch (reminderError) {
          console.warn('Error creating reminder for email:', reminderError);
          // Continue without reminder
        }
      }
      
      // Update emails array
      this.emails[emailIndex] = updatedEmail;
      
      // Save emails
      await this.saveEmails();
      
      // Call callback
      if (this.onEmailUpdated) {
        this.onEmailUpdated(updatedEmail);
      }
      
      // Call status change callback if status changed
      if (emailData.status && emailData.status !== email.status && this.onEmailStatusChanged) {
        this.onEmailStatusChanged(updatedEmail, email.status);
      }
      
      console.log('Email updated:', updatedEmail.id);
      
      return updatedEmail;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }
  
  /**
   * Delete an email
   * @param {string} id - Email ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteEmail(id) {
    try {
      // Find email
      const emailIndex = this.emails.findIndex(e => e.id === id);
      
      if (emailIndex === -1) {
        throw new Error(`Email with ID ${id} not found`);
      }
      
      const email = this.emails[emailIndex];
      
      // Delete associated reminder if exists
      if (email.reminderId) {
        try {
          await reminderService.deleteReminder(email.reminderId);
        } catch (reminderError) {
          console.warn('Error deleting reminder for email:', reminderError);
          // Continue with email deletion
        }
      }
      
      // Remove from emails array
      this.emails.splice(emailIndex, 1);
      
      // Save emails
      await this.saveEmails();
      
      // Call callback
      if (this.onEmailDeleted) {
        this.onEmailDeleted(email);
      }
      
      console.log('Email deleted:', id);
      
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  }
  
  /**
   * Get emails with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered emails
   */
  getEmails(filters = {}) {
    try {
      let filteredEmails = [...this.emails];
      
      // Apply filters
      if (filters.status) {
        filteredEmails = filteredEmails.filter(e => e.status === filters.status);
      }
      
      if (filters.priority) {
        filteredEmails = filteredEmails.filter(e => e.priority === filters.priority);
      }
      
      if (filters.context) {
        filteredEmails = filteredEmails.filter(e => e.context === filters.context);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEmails = filteredEmails.filter(e => 
          e.subject.toLowerCase().includes(searchLower) || 
          e.body.toLowerCase().includes(searchLower) ||
          e.to.some(recipient => recipient.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.from) {
        filteredEmails = filteredEmails.filter(e => e.from.toLowerCase().includes(filters.from.toLowerCase()));
      }
      
      if (filters.to) {
        filteredEmails = filteredEmails.filter(e => 
          e.to.some(recipient => recipient.toLowerCase().includes(filters.to.toLowerCase()))
        );
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredEmails = filteredEmails.filter(e => new Date(e.createdAt) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredEmails = filteredEmails.filter(e => new Date(e.createdAt) <= endDate);
      }
      
      if (filters.hasAttachments) {
        filteredEmails = filteredEmails.filter(e => e.attachments.length > 0);
      }
      
      if (filters.tag) {
        filteredEmails = filteredEmails.filter(e => e.tags.includes(filters.tag));
      }
      
      // Sort emails
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'date':
            filteredEmails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'priority':
            const priorityOrder = { [EMAIL_PRIORITIES.HIGH]: 0, [EMAIL_PRIORITIES.MEDIUM]: 1, [EMAIL_PRIORITIES.LOW]: 2 };
            filteredEmails.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
          case 'subject':
            filteredEmails.sort((a, b) => a.subject.localeCompare(b.subject));
            break;
          default:
            filteredEmails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } else {
        // Default sort by date (newest first)
        filteredEmails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      return filteredEmails;
    } catch (error) {
      console.error('Error getting emails:', error);
      return [];
    }
  }
  
  /**
   * Get email by ID
   * @param {string} id - Email ID
   * @returns {Object|null} Email object or null if not found
   */
  getEmailById(id) {
    try {
      return this.emails.find(e => e.id === id) || null;
    } catch (error) {
      console.error('Error getting email by ID:', error);
      return null;
    }
  }
  
  /**
   * Change email status
   * @param {string} id - Email ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated email
   */
  async changeEmailStatus(id, status) {
    try {
      // Validate status
      if (!Object.values(EMAIL_STATUSES).includes(status)) {
        throw new Error(`Invalid email status: ${status}`);
      }
      
      // Update email
      const updatedEmail = await this.updateEmail(id, { status });
      
      // If email is sent, call the onEmailSent callback
      if (status === EMAIL_STATUSES.SENT && this.onEmailSent) {
        this.onEmailSent(updatedEmail);
      }
      
      return updatedEmail;
    } catch (error) {
      console.error('Error changing email status:', error);
      throw error;
    }
  }
  
  /**
   * Send an email
   * @param {string} id - Email ID
   * @returns {Promise<Object>} Sent email
   */
  async sendEmail(id) {
    try {
      // Find email
      const email = this.getEmailById(id);
      
      if (!email) {
        throw new Error(`Email with ID ${id} not found`);
      }
      
      // Validate email
      if (!email.to || email.to.length === 0) {
        throw new Error('Email must have at least one recipient');
      }
      
      if (!email.subject) {
        throw new Error('Email subject is required');
      }
      
      // Send email via Superhuman if connected
      if (this.superhuman && this.superhuman.isConnected) {
        const result = await this.superhuman.sendEmail(email);
        
        if (!result.success) {
          throw new Error('Failed to send email via Superhuman');
        }
      }
      
      // Update email status to sent
      const sentEmail = await this.changeEmailStatus(id, EMAIL_STATUSES.SENT);
      
      // Complete reminder if exists
      if (email.reminderId) {
        try {
          await reminderService.updateReminder(email.reminderId, {
            completed: true
          });
        } catch (reminderError) {
          console.warn('Error completing reminder for sent email:', reminderError);
          // Continue without reminder update
        }
      }
      
      return sentEmail;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  /**
   * Add attachment to email
   * @param {string} id - Email ID
   * @param {Object} attachment - Attachment object
   * @returns {Promise<Object>} Updated email
   */
  async addAttachment(id, attachment) {
    try {
      // Find email
      const email = this.getEmailById(id);
      
      if (!email) {
        throw new Error(`Email with ID ${id} not found`);
      }
      
      // Validate attachment
      if (!attachment.name || !attachment.uri) {
        throw new Error('Attachment must have name and uri properties');
      }
      
      // Create attachment object
      const newAttachment = {
        id: uuidv4(),
        name: attachment.name,
        uri: attachment.uri,
        type: attachment.type || 'application/octet-stream',
        size: attachment.size || 0,
        addedAt: new Date().toISOString()
      };
      
      // Update email
      const updatedEmail = await this.updateEmail(id, {
        attachments: [...email.attachments, newAttachment]
      });
      
      return updatedEmail;
    } catch (error) {
      console.error('Error adding attachment to email:', error);
      throw error;
    }
  }
  
  /**
   * Remove attachment from email
   * @param {string} id - Email ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<Object>} Updated email
   */
  async removeAttachment(id, attachmentId) {
    try {
      // Find email
      const email = this.getEmailById(id);
      
      if (!email) {
        throw new Error(`Email with ID ${id} not found`);
      }
      
      // Find attachment
      const attachmentIndex = email.attachments.findIndex(a => a.id === attachmentId);
      
      if (attachmentIndex === -1) {
        throw new Error(`Attachment with ID ${attachmentId} not found in email ${id}`);
      }
      
      // Remove attachment
      const updatedAttachments = [...email.attachments];
      updatedAttachments.splice(attachmentIndex, 1);
      
      // Update email
      const updatedEmail = await this.updateEmail(id, {
        attachments: updatedAttachments
      });
      
      return updatedEmail;
    } catch (error) {
      console.error('Error removing attachment from email:', error);
      throw error;
    }
  }
  
  /**
   * Set callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onEmailAdded) {
      this.onEmailAdded = callbacks.onEmailAdded;
    }
    
    if (callbacks.onEmailUpdated) {
      this.onEmailUpdated = callbacks.onEmailUpdated;
    }
    
    if (callbacks.onEmailDeleted) {
      this.onEmailDeleted = callbacks.onEmailDeleted;
    }
    
    if (callbacks.onEmailStatusChanged) {
      this.onEmailStatusChanged = callbacks.onEmailStatusChanged;
    }
    
    if (callbacks.onEmailSent) {
      this.onEmailSent = callbacks.onEmailSent;
    }
  }
  
  /**
   * Set language
   * @param {string} language - Language code
   */
  setLanguage(language) {
    this.currentLanguage = language;
  }
  
  /**
   * Clean up resources
   * @returns {Promise<boolean>} Success status
   */
  async cleanup() {
    try {
      // Disconnect from Superhuman if connected
      if (this.superhuman && this.superhuman.isConnected) {
        await this.superhuman.disconnect();
      }
      
      // Reset properties
      this.initialized = false;
      this.onEmailAdded = null;
      this.onEmailUpdated = null;
      this.onEmailDeleted = null;
      this.onEmailStatusChanged = null;
      this.onEmailSent = null;
      
      return true;
    } catch (error) {
      console.error('Error cleaning up Email Service:', error);
      return false;
    }
  }
}

// Create a singleton instance
const emailService = new EmailService();

// Export constants and service
export {
  EMAIL_STATUSES,
  EMAIL_PRIORITIES,
  EMAIL_CONTEXTS
};

export default emailService;

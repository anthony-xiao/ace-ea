/**
 * Meeting Service for Ace Assistant
 * 
 * This service handles meeting management with integration capabilities for Google Meet
 * and support for both English and Chinese languages.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import reminderService from '../reminders/ReminderService';
import appConfig from '../../constants/appConfig';

// Constants
const MEETING_STORAGE_KEY = '@ace_meetings';
const MEETING_STATUSES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const MEETING_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const MEETING_CONTEXTS = {
  WORK: 'work',
  PERSONAL: 'personal',
  FAMILY: 'family'
};

/**
 * Class representing the Meeting Service
 */
class MeetingService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.meetings = [];
    this.currentLanguage = appConfig.defaultLanguage;
    this.googleMeet = null;
    
    // Callbacks
    this.onMeetingAdded = null;
    this.onMeetingUpdated = null;
    this.onMeetingDeleted = null;
    this.onMeetingStatusChanged = null;
    this.onMeetingStarted = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.loadMeetings = this.loadMeetings.bind(this);
    this.saveMeetings = this.saveMeetings.bind(this);
    this.createMeeting = this.createMeeting.bind(this);
    this.updateMeeting = this.updateMeeting.bind(this);
    this.deleteMeeting = this.deleteMeeting.bind(this);
    this.getMeetings = this.getMeetings.bind(this);
    this.getMeetingById = this.getMeetingById.bind(this);
    this.changeMeetingStatus = this.changeMeetingStatus.bind(this);
    this.startMeeting = this.startMeeting.bind(this);
    this.addParticipant = this.addParticipant.bind(this);
    this.removeParticipant = this.removeParticipant.bind(this);
    this.addAttachment = this.addAttachment.bind(this);
    this.removeAttachment = this.removeAttachment.bind(this);
    this.setCallbacks = this.setCallbacks.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Meeting Service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Meeting Service...');
      
      // Load saved meetings
      await this.loadMeetings();
      
      // Initialize Google Meet integration (mock for now)
      this.googleMeet = {
        isConnected: false,
        connect: async () => {
          console.log('Connecting to Google Meet (mock)...');
          this.googleMeet.isConnected = true;
          return true;
        },
        disconnect: async () => {
          console.log('Disconnecting from Google Meet (mock)...');
          this.googleMeet.isConnected = false;
          return true;
        },
        createMeeting: async (meeting) => {
          console.log('Creating meeting via Google Meet (mock):', meeting.title);
          return { 
            success: true, 
            id: uuidv4(),
            meetUrl: `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`
          };
        },
        startMeeting: async (meetingId) => {
          console.log('Starting meeting via Google Meet (mock):', meetingId);
          return { success: true };
        },
        fetchMeetings: async (count = 10) => {
          console.log(`Fetching ${count} meetings from Google Meet (mock)...`);
          return [];
        }
      };
      
      // Set initialization flag
      this.initialized = true;
      console.log('Meeting Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Meeting Service:', error);
      return false;
    }
  }
  
  /**
   * Load meetings from storage
   * @returns {Promise<boolean>} Success status
   */
  async loadMeetings() {
    try {
      const meetingsJson = await AsyncStorage.getItem(MEETING_STORAGE_KEY);
      
      if (meetingsJson) {
        this.meetings = JSON.parse(meetingsJson);
        console.log(`Loaded ${this.meetings.length} meetings`);
      } else {
        this.meetings = [];
      }
      
      return true;
    } catch (error) {
      console.error('Error loading meetings:', error);
      this.meetings = [];
      return false;
    }
  }
  
  /**
   * Save meetings to storage
   * @returns {Promise<boolean>} Success status
   */
  async saveMeetings() {
    try {
      await AsyncStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(this.meetings));
      return true;
    } catch (error) {
      console.error('Error saving meetings:', error);
      return false;
    }
  }
  
  /**
   * Create a new meeting
   * @param {Object} meetingData - Meeting data
   * @returns {Promise<Object>} Created meeting
   */
  async createMeeting(meetingData) {
    try {
      // Validate required fields
      if (!meetingData.title) {
        throw new Error('Meeting title is required');
      }
      
      if (!meetingData.startTime) {
        throw new Error('Meeting start time is required');
      }
      
      // Create meeting object
      const meeting = {
        id: uuidv4(),
        title: meetingData.title,
        description: meetingData.description || '',
        location: meetingData.location || '',
        startTime: new Date(meetingData.startTime).toISOString(),
        endTime: meetingData.endTime ? new Date(meetingData.endTime).toISOString() : null,
        participants: meetingData.participants || [],
        organizer: meetingData.organizer || 'user@example.com',
        status: meetingData.status || MEETING_STATUSES.SCHEDULED,
        priority: meetingData.priority || MEETING_PRIORITIES.MEDIUM,
        context: meetingData.context || MEETING_CONTEXTS.WORK,
        meetUrl: meetingData.meetUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: meetingData.attachments || [],
        notes: meetingData.notes || '',
        agenda: meetingData.agenda || [],
        reminderId: null,
        language: meetingData.language || this.currentLanguage
      };
      
      // Create Google Meet meeting if requested
      if (meetingData.createGoogleMeet && this.googleMeet && this.googleMeet.isConnected) {
        try {
          const result = await this.googleMeet.createMeeting({
            title: meeting.title,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            participants: meeting.participants
          });
          
          if (result.success) {
            meeting.meetUrl = result.meetUrl;
          }
        } catch (googleMeetError) {
          console.warn('Error creating Google Meet meeting:', googleMeetError);
          // Continue without Google Meet integration
        }
      }
      
      // Create reminder
      try {
        const reminder = await reminderService.createReminder({
          title: `Meeting: ${meeting.title}`,
          description: meeting.description,
          dueDate: meeting.startTime,
          category: 'meeting',
          priority: meeting.priority,
          context: meeting.context,
          relatedItemId: meeting.id,
          relatedItemType: 'meeting',
          language: meeting.language
        });
        
        meeting.reminderId = reminder.id;
      } catch (reminderError) {
        console.warn('Error creating reminder for meeting:', reminderError);
        // Continue without reminder
      }
      
      // Add to meetings array
      this.meetings.push(meeting);
      
      // Save meetings
      await this.saveMeetings();
      
      // Call callback
      if (this.onMeetingAdded) {
        this.onMeetingAdded(meeting);
      }
      
      console.log('Meeting created:', meeting.id);
      
      return meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing meeting
   * @param {string} id - Meeting ID
   * @param {Object} meetingData - Updated meeting data
   * @returns {Promise<Object>} Updated meeting
   */
  async updateMeeting(id, meetingData) {
    try {
      // Find meeting
      const meetingIndex = this.meetings.findIndex(m => m.id === id);
      
      if (meetingIndex === -1) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      const meeting = this.meetings[meetingIndex];
      
      // Update fields
      const updatedMeeting = {
        ...meeting,
        ...meetingData,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure dates are in ISO format
      if (meetingData.startTime) {
        updatedMeeting.startTime = new Date(meetingData.startTime).toISOString();
      }
      
      if (meetingData.endTime) {
        updatedMeeting.endTime = new Date(meetingData.endTime).toISOString();
      }
      
      // Update reminder if start time changed
      if (meeting.reminderId && meetingData.startTime) {
        try {
          await reminderService.updateReminder(meeting.reminderId, {
            title: `Meeting: ${updatedMeeting.title}`,
            description: updatedMeeting.description,
            dueDate: updatedMeeting.startTime,
            priority: updatedMeeting.priority,
            context: updatedMeeting.context
          });
        } catch (reminderError) {
          console.warn('Error updating reminder for meeting:', reminderError);
          // Continue without reminder update
        }
      }
      
      // Update meetings array
      this.meetings[meetingIndex] = updatedMeeting;
      
      // Save meetings
      await this.saveMeetings();
      
      // Call callback
      if (this.onMeetingUpdated) {
        this.onMeetingUpdated(updatedMeeting);
      }
      
      // Call status change callback if status changed
      if (meetingData.status && meetingData.status !== meeting.status && this.onMeetingStatusChanged) {
        this.onMeetingStatusChanged(updatedMeeting, meeting.status);
      }
      
      console.log('Meeting updated:', updatedMeeting.id);
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }
  
  /**
   * Delete a meeting
   * @param {string} id - Meeting ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMeeting(id) {
    try {
      // Find meeting
      const meetingIndex = this.meetings.findIndex(m => m.id === id);
      
      if (meetingIndex === -1) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      const meeting = this.meetings[meetingIndex];
      
      // Delete associated reminder if exists
      if (meeting.reminderId) {
        try {
          await reminderService.deleteReminder(meeting.reminderId);
        } catch (reminderError) {
          console.warn('Error deleting reminder for meeting:', reminderError);
          // Continue with meeting deletion
        }
      }
      
      // Remove from meetings array
      this.meetings.splice(meetingIndex, 1);
      
      // Save meetings
      await this.saveMeetings();
      
      // Call callback
      if (this.onMeetingDeleted) {
        this.onMeetingDeleted(meeting);
      }
      
      console.log('Meeting deleted:', id);
      
      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return false;
    }
  }
  
  /**
   * Get meetings with optional filtering
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered meetings
   */
  getMeetings(filters = {}) {
    try {
      let filteredMeetings = [...this.meetings];
      
      // Apply filters
      if (filters.status) {
        filteredMeetings = filteredMeetings.filter(m => m.status === filters.status);
      }
      
      if (filters.priority) {
        filteredMeetings = filteredMeetings.filter(m => m.priority === filters.priority);
      }
      
      if (filters.context) {
        filteredMeetings = filteredMeetings.filter(m => m.context === filters.context);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMeetings = filteredMeetings.filter(m => 
          m.title.toLowerCase().includes(searchLower) || 
          m.description.toLowerCase().includes(searchLower) ||
          m.location.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.participant) {
        filteredMeetings = filteredMeetings.filter(m => 
          m.participants.some(p => p.toLowerCase().includes(filters.participant.toLowerCase()))
        );
      }
      
      if (filters.organizer) {
        filteredMeetings = filteredMeetings.filter(m => 
          m.organizer.toLowerCase().includes(filters.organizer.toLowerCase())
        );
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredMeetings = filteredMeetings.filter(m => new Date(m.startTime) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredMeetings = filteredMeetings.filter(m => new Date(m.startTime) <= endDate);
      }
      
      if (filters.hasAttachments) {
        filteredMeetings = filteredMeetings.filter(m => m.attachments.length > 0);
      }
      
      // Sort meetings
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'startTime':
            filteredMeetings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            break;
          case 'priority':
            const priorityOrder = { [MEETING_PRIORITIES.HIGH]: 0, [MEETING_PRIORITIES.MEDIUM]: 1, [MEETING_PRIORITIES.LOW]: 2 };
            filteredMeetings.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
          case 'title':
            filteredMeetings.sort((a, b) => a.title.localeCompare(b.title));
            break;
          default:
            filteredMeetings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        }
      } else {
        // Default sort by start time (soonest first)
        filteredMeetings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      }
      
      return filteredMeetings;
    } catch (error) {
      console.error('Error getting meetings:', error);
      return [];
    }
  }
  
  /**
   * Get meeting by ID
   * @param {string} id - Meeting ID
   * @returns {Object|null} Meeting object or null if not found
   */
  getMeetingById(id) {
    try {
      return this.meetings.find(m => m.id === id) || null;
    } catch (error) {
      console.error('Error getting meeting by ID:', error);
      return null;
    }
  }
  
  /**
   * Change meeting status
   * @param {string} id - Meeting ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated meeting
   */
  async changeMeetingStatus(id, status) {
    try {
      // Validate status
      if (!Object.values(MEETING_STATUSES).includes(status)) {
        throw new Error(`Invalid meeting status: ${status}`);
      }
      
      // Update meeting
      const updatedMeeting = await this.updateMeeting(id, { status });
      
      // If meeting is completed, mark reminder as completed
      if (status === MEETING_STATUSES.COMPLETED && updatedMeeting.reminderId) {
        try {
          await reminderService.updateReminder(updatedMeeting.reminderId, {
            completed: true
          });
        } catch (reminderError) {
          console.warn('Error completing reminder for meeting:', reminderError);
          // Continue without reminder update
        }
      }
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error changing meeting status:', error);
      throw error;
    }
  }
  
  /**
   * Start a meeting
   * @param {string} id - Meeting ID
   * @returns {Promise<Object>} Updated meeting with meetUrl
   */
  async startMeeting(id) {
    try {
      // Find meeting
      const meeting = this.getMeetingById(id);
      
      if (!meeting) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      // Create Google Meet meeting if not already created
      if (!meeting.meetUrl && this.googleMeet && this.googleMeet.isConnected) {
        try {
          const result = await this.googleMeet.createMeeting({
            title: meeting.title,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            participants: meeting.participants
          });
          
          if (result.success) {
            meeting.meetUrl = result.meetUrl;
          }
        } catch (googleMeetError) {
          console.warn('Error creating Google Meet meeting:', googleMeetError);
          // Continue without Google Meet integration
        }
      }
      
      // Start Google Meet meeting if available
      if (meeting.meetUrl && this.googleMeet && this.googleMeet.isConnected) {
        try {
          await this.googleMeet.startMeeting(meeting.id);
        } catch (googleMeetError) {
          console.warn('Error starting Google Meet meeting:', googleMeetError);
          // Continue without Google Meet integration
        }
      }
      
      // Update meeting status to in progress
      const updatedMeeting = await this.changeMeetingStatus(id, MEETING_STATUSES.IN_PROGRESS);
      
      // Call callback
      if (this.onMeetingStarted) {
        this.onMeetingStarted(updatedMeeting);
      }
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error starting meeting:', error);
      throw error;
    }
  }
  
  /**
   * Add participant to meeting
   * @param {string} id - Meeting ID
   * @param {string} participant - Participant email
   * @returns {Promise<Object>} Updated meeting
   */
  async addParticipant(id, participant) {
    try {
      // Find meeting
      const meeting = this.getMeetingById(id);
      
      if (!meeting) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      // Check if participant already exists
      if (meeting.participants.includes(participant)) {
        return meeting;
      }
      
      // Update meeting
      const updatedMeeting = await this.updateMeeting(id, {
        participants: [...meeting.participants, participant]
      });
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error adding participant to meeting:', error);
      throw error;
    }
  }
  
  /**
   * Remove participant from meeting
   * @param {string} id - Meeting ID
   * @param {string} participant - Participant email
   * @returns {Promise<Object>} Updated meeting
   */
  async removeParticipant(id, participant) {
    try {
      // Find meeting
      const meeting = this.getMeetingById(id);
      
      if (!meeting) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      // Check if participant exists
      const participantIndex = meeting.participants.indexOf(participant);
      
      if (participantIndex === -1) {
        return meeting;
      }
      
      // Update meeting
      const updatedParticipants = [...meeting.participants];
      updatedParticipants.splice(participantIndex, 1);
      
      const updatedMeeting = await this.updateMeeting(id, {
        participants: updatedParticipants
      });
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error removing participant from meeting:', error);
      throw error;
    }
  }
  
  /**
   * Add attachment to meeting
   * @param {string} id - Meeting ID
   * @param {Object} attachment - Attachment object
   * @returns {Promise<Object>} Updated meeting
   */
  async addAttachment(id, attachment) {
    try {
      // Find meeting
      const meeting = this.getMeetingById(id);
      
      if (!meeting) {
        throw new Error(`Meeting with ID ${id} not found`);
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
      
      // Update meeting
      const updatedMeeting = await this.updateMeeting(id, {
        attachments: [...meeting.attachments, newAttachment]
      });
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error adding attachment to meeting:', error);
      throw error;
    }
  }
  
  /**
   * Remove attachment from meeting
   * @param {string} id - Meeting ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<Object>} Updated meeting
   */
  async removeAttachment(id, attachmentId) {
    try {
      // Find meeting
      const meeting = this.getMeetingById(id);
      
      if (!meeting) {
        throw new Error(`Meeting with ID ${id} not found`);
      }
      
      // Find attachment
      const attachmentIndex = meeting.attachments.findIndex(a => a.id === attachmentId);
      
      if (attachmentIndex === -1) {
        throw new Error(`Attachment with ID ${attachmentId} not found in meeting ${id}`);
      }
      
      // Remove attachment
      const updatedAttachments = [...meeting.attachments];
      updatedAttachments.splice(attachmentIndex, 1);
      
      // Update meeting
      const updatedMeeting = await this.updateMeeting(id, {
        attachments: updatedAttachments
      });
      
      return updatedMeeting;
    } catch (error) {
      console.error('Error removing attachment from meeting:', error);
      throw error;
    }
  }
  
  /**
   * Set callbacks
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onMeetingAdded) {
      this.onMeetingAdded = callbacks.onMeetingAdded;
    }
    
    if (callbacks.onMeetingUpdated) {
      this.onMeetingUpdated = callbacks.onMeetingUpdated;
    }
    
    if (callbacks.onMeetingDeleted) {
      this.onMeetingDeleted = callbacks.onMeetingDeleted;
    }
    
    if (callbacks.onMeetingStatusChanged) {
      this.onMeetingStatusChanged = callbacks.onMeetingStatusChanged;
    }
    
    if (callbacks.onMeetingStarted) {
      this.onMeetingStarted = callbacks.onMeetingStarted;
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
      // Disconnect from Google Meet if connected
      if (this.googleMeet && this.googleMeet.isConnected) {
        await this.googleMeet.disconnect();
      }
      
      // Reset properties
      this.initialized = false;
      this.onMeetingAdded = null;
      this.onMeetingUpdated = null;
      this.onMeetingDeleted = null;
      this.onMeetingStatusChanged = null;
      this.onMeetingStarted = null;
      
      return true;
    } catch (error) {
      console.error('Error cleaning up Meeting Service:', error);
      return false;
    }
  }
}

// Create a singleton instance
const meetingService = new MeetingService();

// Export constants and service
export {
  MEETING_STATUSES,
  MEETING_PRIORITIES,
  MEETING_CONTEXTS
};

export default meetingService;

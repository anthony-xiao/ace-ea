/**
 * Organization Features Test Suite for Ace Assistant
 * 
 * This file contains tests for the organization features including
 * tasks, emails, meetings, and their integration with voice commands
 * and cross-device synchronization.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AceProvider } from '../../src/core/providers/AceProvider';
import TaskService from '../../src/services/organization/TaskService';
import EmailService from '../../src/services/organization/EmailService';
import MeetingService from '../../src/services/organization/MeetingService';
import ReminderService from '../../src/services/reminders/ReminderService';
import SyncService from '../../src/services/sync/SyncService';
import VoiceCommandProcessor from '../../src/components/voice/VoiceCommandProcessor';
import TaskDashboard from '../../src/components/tasks/TaskDashboard';
import EmailDashboard from '../../src/components/email/EmailDashboard';
import MeetingDashboard from '../../src/components/meetings/MeetingDashboard';
import SyncStatusBar from '../../src/components/sync/SyncStatusBar';

// Mock services
jest.mock('../../src/services/organization/TaskService');
jest.mock('../../src/services/organization/EmailService');
jest.mock('../../src/services/organization/MeetingService');
jest.mock('../../src/services/reminders/ReminderService');
jest.mock('../../src/services/sync/SyncService');

// Test wrapper component
const TestWrapper = ({ children }) => (
  <AceProvider>
    {children}
  </AceProvider>
);

describe('Task Organization Features', () => {
  beforeEach(() => {
    // Reset mocks
    TaskService.mockClear();
    
    // Setup mock implementations
    TaskService.getTasks.mockResolvedValue([
      { id: '1', title: 'Test Task 1', priority: 'high', status: 'pending' },
      { id: '2', title: 'Test Task 2', priority: 'medium', status: 'completed' }
    ]);
    
    TaskService.createTask.mockImplementation(async (taskData) => {
      return { id: '3', ...taskData };
    });
    
    TaskService.updateTask.mockImplementation(async (id, updateData) => {
      return { id, ...updateData };
    });
    
    TaskService.deleteTask.mockResolvedValue(true);
  });
  
  test('TaskDashboard renders tasks correctly', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>
    );
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(TaskService.getTasks).toHaveBeenCalled();
    });
    
    // Check if tasks are rendered
    expect(getByText('Test Task 1')).toBeTruthy();
    expect(getByText('Test Task 2')).toBeTruthy();
    
    // Check if task items are rendered
    const taskItems = queryAllByTestId('task-item');
    expect(taskItems.length).toBe(2);
  });
  
  test('Creating a new task works', async () => {
    const { getByText, getByPlaceholderText, queryAllByTestId } = render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>
    );
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(TaskService.getTasks).toHaveBeenCalled();
    });
    
    // Open task form
    fireEvent.press(getByText('Add Task'));
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('Task title'), 'New Test Task');
    
    // Submit form
    fireEvent.press(getByText('Save'));
    
    // Check if createTask was called
    await waitFor(() => {
      expect(TaskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task'
        })
      );
    });
  });
  
  test('Completing a task works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>
    );
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(TaskService.getTasks).toHaveBeenCalled();
    });
    
    // Get first task
    const taskItems = queryAllByTestId('task-item');
    const completeButton = taskItems[0].querySelector('[data-testid="complete-button"]');
    
    // Complete task
    fireEvent.press(completeButton);
    
    // Check if updateTask was called
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'completed'
        })
      );
    });
  });
  
  test('Deleting a task works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>
    );
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(TaskService.getTasks).toHaveBeenCalled();
    });
    
    // Get first task
    const taskItems = queryAllByTestId('task-item');
    const deleteButton = taskItems[0].querySelector('[data-testid="delete-button"]');
    
    // Delete task
    fireEvent.press(deleteButton);
    
    // Confirm deletion
    fireEvent.press(getByText('Delete'));
    
    // Check if deleteTask was called
    await waitFor(() => {
      expect(TaskService.deleteTask).toHaveBeenCalledWith('1');
    });
  });
});

describe('Email Management Features', () => {
  beforeEach(() => {
    // Reset mocks
    EmailService.mockClear();
    
    // Setup mock implementations
    EmailService.getEmails.mockResolvedValue([
      { id: '1', subject: 'Test Email 1', priority: 'high', status: 'draft' },
      { id: '2', subject: 'Test Email 2', priority: 'medium', status: 'sent' }
    ]);
    
    EmailService.createEmail.mockImplementation(async (emailData) => {
      return { id: '3', ...emailData };
    });
    
    EmailService.updateEmail.mockImplementation(async (id, updateData) => {
      return { id, ...updateData };
    });
    
    EmailService.deleteEmail.mockResolvedValue(true);
    
    EmailService.sendEmail.mockImplementation(async (id) => {
      return { id, status: 'sent' };
    });
  });
  
  test('EmailDashboard renders emails correctly', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <EmailDashboard />
      </TestWrapper>
    );
    
    // Wait for emails to load
    await waitFor(() => {
      expect(EmailService.getEmails).toHaveBeenCalled();
    });
    
    // Check if emails are rendered
    expect(getByText('Test Email 1')).toBeTruthy();
    expect(getByText('Test Email 2')).toBeTruthy();
    
    // Check if email items are rendered
    const emailItems = queryAllByTestId('email-item');
    expect(emailItems.length).toBe(2);
  });
  
  test('Creating a new email works', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <EmailDashboard />
      </TestWrapper>
    );
    
    // Wait for emails to load
    await waitFor(() => {
      expect(EmailService.getEmails).toHaveBeenCalled();
    });
    
    // Open email form
    fireEvent.press(getByText('Compose'));
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('Subject'), 'New Test Email');
    fireEvent.changeText(getByPlaceholderText('To'), 'test@example.com');
    
    // Submit form
    fireEvent.press(getByText('Save Draft'));
    
    // Check if createEmail was called
    await waitFor(() => {
      expect(EmailService.createEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'New Test Email',
          recipients: [{ email: 'test@example.com', type: 'to' }]
        })
      );
    });
  });
  
  test('Sending an email works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <EmailDashboard />
      </TestWrapper>
    );
    
    // Wait for emails to load
    await waitFor(() => {
      expect(EmailService.getEmails).toHaveBeenCalled();
    });
    
    // Get first email
    const emailItems = queryAllByTestId('email-item');
    const sendButton = emailItems[0].querySelector('[data-testid="send-button"]');
    
    // Send email
    fireEvent.press(sendButton);
    
    // Check if sendEmail was called
    await waitFor(() => {
      expect(EmailService.sendEmail).toHaveBeenCalledWith('1');
    });
  });
  
  test('Deleting an email works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <EmailDashboard />
      </TestWrapper>
    );
    
    // Wait for emails to load
    await waitFor(() => {
      expect(EmailService.getEmails).toHaveBeenCalled();
    });
    
    // Get first email
    const emailItems = queryAllByTestId('email-item');
    const deleteButton = emailItems[0].querySelector('[data-testid="delete-button"]');
    
    // Delete email
    fireEvent.press(deleteButton);
    
    // Confirm deletion
    fireEvent.press(getByText('Delete'));
    
    // Check if deleteEmail was called
    await waitFor(() => {
      expect(EmailService.deleteEmail).toHaveBeenCalledWith('1');
    });
  });
});

describe('Meeting Scheduling Features', () => {
  beforeEach(() => {
    // Reset mocks
    MeetingService.mockClear();
    
    // Setup mock implementations
    MeetingService.getMeetings.mockResolvedValue([
      { 
        id: '1', 
        title: 'Test Meeting 1', 
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled' 
      },
      { 
        id: '2', 
        title: 'Test Meeting 2', 
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        status: 'scheduled' 
      }
    ]);
    
    MeetingService.createMeeting.mockImplementation(async (meetingData) => {
      return { id: '3', ...meetingData };
    });
    
    MeetingService.updateMeeting.mockImplementation(async (id, updateData) => {
      return { id, ...updateData };
    });
    
    MeetingService.deleteMeeting.mockResolvedValue(true);
    
    MeetingService.startMeeting.mockImplementation(async (id) => {
      return { id, status: 'in_progress' };
    });
  });
  
  test('MeetingDashboard renders meetings correctly', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <MeetingDashboard />
      </TestWrapper>
    );
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(MeetingService.getMeetings).toHaveBeenCalled();
    });
    
    // Check if meetings are rendered
    expect(getByText('Test Meeting 1')).toBeTruthy();
    expect(getByText('Test Meeting 2')).toBeTruthy();
    
    // Check if meeting items are rendered
    const meetingItems = queryAllByTestId('meeting-item');
    expect(meetingItems.length).toBe(2);
  });
  
  test('Creating a new meeting works', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <MeetingDashboard />
      </TestWrapper>
    );
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(MeetingService.getMeetings).toHaveBeenCalled();
    });
    
    // Open meeting form
    fireEvent.press(getByText('Schedule Meeting'));
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('Meeting title'), 'New Test Meeting');
    
    // Submit form
    fireEvent.press(getByText('Save'));
    
    // Check if createMeeting was called
    await waitFor(() => {
      expect(MeetingService.createMeeting).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Meeting'
        })
      );
    });
  });
  
  test('Starting a meeting works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <MeetingDashboard />
      </TestWrapper>
    );
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(MeetingService.getMeetings).toHaveBeenCalled();
    });
    
    // Get first meeting
    const meetingItems = queryAllByTestId('meeting-item');
    const startButton = meetingItems[0].querySelector('[data-testid="start-button"]');
    
    // Start meeting
    fireEvent.press(startButton);
    
    // Check if startMeeting was called
    await waitFor(() => {
      expect(MeetingService.startMeeting).toHaveBeenCalledWith('1');
    });
  });
  
  test('Canceling a meeting works', async () => {
    const { getByText, queryAllByTestId } = render(
      <TestWrapper>
        <MeetingDashboard />
      </TestWrapper>
    );
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(MeetingService.getMeetings).toHaveBeenCalled();
    });
    
    // Get first meeting
    const meetingItems = queryAllByTestId('meeting-item');
    const cancelButton = meetingItems[0].querySelector('[data-testid="cancel-button"]');
    
    // Cancel meeting
    fireEvent.press(cancelButton);
    
    // Confirm cancellation
    fireEvent.press(getByText('Cancel Meeting'));
    
    // Check if deleteMeeting was called
    await waitFor(() => {
      expect(MeetingService.deleteMeeting).toHaveBeenCalledWith('1');
    });
  });
});

describe('Voice Command Integration', () => {
  beforeEach(() => {
    // Reset mocks
    TaskService.mockClear();
    EmailService.mockClear();
    MeetingService.mockClear();
    ReminderService.mockClear();
  });
  
  test('Voice command for creating a task works', async () => {
    // Setup task creation mock
    TaskService.createTask.mockImplementation(async (taskData) => {
      return { id: '1', ...taskData };
    });
    
    // Process voice command
    const result = await VoiceCommandProcessor.processCommand(
      'create a task called Prepare quarterly report',
      'en',
      {
        tasks: TaskService,
        email: EmailService,
        meetings: MeetingService,
        reminders: ReminderService
      },
      (key, params) => key // Mock translation function
    );
    
    // Check result
    expect(result.success).toBe(true);
    expect(result.commandType).toBe('task');
    expect(result.action).toBe('create');
    
    // Check if createTask was called with correct data
    expect(TaskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Prepare quarterly report'
      })
    );
  });
  
  test('Voice command for listing emails works', async () => {
    // Setup email listing mock
    EmailService.getEmails.mockResolvedValue([
      { id: '1', subject: 'Test Email 1' },
      { id: '2', subject: 'Test Email 2' }
    ]);
    
    // Process voice command
    const result = await VoiceCommandProcessor.processCommand(
      'show my emails',
      'en',
      {
        tasks: TaskService,
        email: EmailService,
        meetings: MeetingService,
        reminders: ReminderService
      },
      (key, params) => key // Mock translation function
    );
    
    // Check result
    expect(result.success).toBe(true);
    expect(result.commandType).toBe('email');
    expect(result.action).toBe('list');
    
    // Check if getEmails was called
    expect(EmailService.getEmails).toHaveBeenCalled();
    
    // Check if data contains emails
    expect(result.data.length).toBe(2);
  });
  
  test('Voice command for scheduling a meeting works', async () => {
    // Setup meeting creation mock
    MeetingService.createMeeting.mockImplementation(async (meetingData) => {
      return { id: '1', ...meetingData };
    });
    
    // Process voice command
    const result = await VoiceCommandProcessor.processCommand(
      'schedule a meeting called Team Sync for tomorrow',
      'en',
      {
        tasks: TaskService,
        email: EmailService,
        meetings: MeetingService,
        reminders: ReminderService
      },
      (key, params) => key // Mock translation function
    );
    
    // Check result
    expect(result.success).toBe(true);
    expect(result.commandType).toBe('meeting');
    expect(result.action).toBe('create');
    
    // Check if createMeeting was called with correct data
    expect(MeetingService.createMeeting).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Team Sync'
      })
    );
  });
  
  test('Voice command in Chinese for creating a reminder works', async () => {
    // Setup reminder creation mock
    ReminderService.createReminder.mockImplementation(async (reminderData) => {
      return { id: '1', ...reminderData };
    });
    
    // Process voice command
    const result = await VoiceCommandProcessor.processCommand(
      '提醒我明天打电话给客户',
      'zh',
      {
        tasks: TaskService,
        email: EmailService,
        meetings: MeetingService,
        reminders: ReminderService
      },
      (key, params) => key // Mock translation function
    );
    
    // Check result
    expect(result.success).toBe(true);
    expect(result.commandType).toBe('reminder');
    expect(result.action).toBe('create');
    
    // Check if createReminder was called with correct data
    expect(ReminderService.createReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '打电话给客户'
      })
    );
  });
});

describe('Sync Integration', () => {
  beforeEach(() => {
    // Reset mocks
    SyncService.mockClear();
    TaskService.mockClear();
    EmailService.mockClear();
    MeetingService.mockClear();
    
    // Setup mock implementations
    SyncService.getSyncStatus.mockReturnValue({
      initialized: true,
      isOnline: true,
      isSyncing: false,
      lastSyncTimestamp: Date.now() - 300000, // 5 minutes ago
      pendingChangesCount: 2,
      syncEnabled: true
    });
    
    SyncService.forceSync.mockResolvedValue({
      success: true,
      timestamp: Date.now()
    });
    
    SyncService.trackChange.mockResolvedValue(true);
  });
  
  test('SyncStatusBar renders sync status correctly', async () => {
    const { getByText, queryByTestId } = render(
      <TestWrapper>
        <SyncStatusBar />
      </TestWrapper>
    );
    
    // Check if sync status is rendered
    expect(getByText(/enabled/i)).toBeTruthy();
    
    // Check if pending changes are shown
    expect(getByText(/2 pending/i)).toBeTruthy();
    
    // Check if sync button is enabled
    const syncButton = queryByTestId('sync-button');
    expect(syncButton).not.toBeDisabled();
  });
  
  test('Forcing sync works', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <SyncStatusBar />
      </TestWrapper>
    );
    
    // Press sync button
    const syncButton = getByTestId('sync-button');
    fireEvent.press(syncButton);
    
    // Check if forceSync was called
    await waitFor(() => {
      expect(SyncService.forceSync).toHaveBeenCalled();
    });
  });
  
  test('Task changes are tracked for sync', async () => {
    // Setup task creation mock
    TaskService.createTask.mockImplementation(async (taskData) => {
      const task = { id: '1', ...taskData };
      
      // Check if trackChange is called after task creation
      await waitFor(() => {
        expect(SyncService.trackChange).toHaveBeenCalledWith(
          'task',
          'create',
          '1',
          task
        );
      });
      
      return task;
    });
    
    // Create a task
    await TaskService.createTask({ title: 'Sync Test Task' });
  });
  
  test('Email changes are tracked for sync', async () => {
    // Setup email update mock
    EmailService.updateEmail.mockImplementation(async (id, updateData) => {
      const email = { id, ...updateData };
      
      // Check if trackChange is called after email update
      await waitFor(() => {
        expect(SyncService.trackChange).toHaveBeenCalledWith(
          'email',
          'update',
          id,
          email
        );
      });
      
      return email;
    });
    
    // Update an email
    await EmailService.updateEmail('1', { subject: 'Updated Subject' });
  });
  
  test('Meeting changes are tracked for sync', async () => {
    // Setup meeting deletion mock
    MeetingService.deleteMeeting.mockImplementation(async (id) => {
      // Check if trackChange is called after meeting deletion
      await waitFor(() => {
        expect(SyncService.trackChange).toHaveBeenCalledWith(
          'meeting',
          'delete',
          id
        );
      });
      
      return true;
    });
    
    // Delete a meeting
    await MeetingService.deleteMeeting('1');
  });
});

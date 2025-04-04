/**
 * Task Service for Ace Assistant
 * 
 * This service handles task management with prioritization capabilities
 * and support for both English and Chinese languages.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import reminderService from '../reminders/ReminderService';
import appConfig from '../../constants/appConfig';

// Constants
const TASK_STORAGE_KEY = '@ace_tasks';
const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const TASK_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const TASK_CONTEXTS = {
  WORK: 'work',
  PERSONAL: 'personal',
  FAMILY: 'family'
};

/**
 * Class representing the Task Service
 */
class TaskService {
  constructor() {
    // Initialize properties
    this.initialized = false;
    this.tasks = [];
    this.currentLanguage = appConfig.defaultLanguage;
    
    // Callbacks
    this.onTaskAdded = null;
    this.onTaskUpdated = null;
    this.onTaskDeleted = null;
    this.onTaskStatusChanged = null;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.loadTasks = this.loadTasks.bind(this);
    this.saveTasks = this.saveTasks.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
    this.changeTaskStatus = this.changeTaskStatus.bind(this);
    this.addSubtask = this.addSubtask.bind(this);
    this.updateSubtask = this.updateSubtask.bind(this);
    this.deleteSubtask = this.deleteSubtask.bind(this);
    this.setCallbacks = this.setCallbacks.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }
  
  /**
   * Initialize the Task Service
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      console.log('Initializing Task Service...');
      
      // Load saved tasks
      await this.loadTasks();
      
      // Set initialization flag
      this.initialized = true;
      console.log('Task Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Task Service:', error);
      return false;
    }
  }
  
  /**
   * Load tasks from storage
   * @returns {Promise<boolean>} Success status
   */
  async loadTasks() {
    try {
      const tasksJson = await AsyncStorage.getItem(TASK_STORAGE_KEY);
      
      if (tasksJson) {
        this.tasks = JSON.parse(tasksJson);
        console.log(`Loaded ${this.tasks.length} tasks`);
      } else {
        this.tasks = [];
      }
      
      return true;
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
      return false;
    }
  }
  
  /**
   * Save tasks to storage
   * @returns {Promise<boolean>} Success status
   */
  async saveTasks() {
    try {
      await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(this.tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      return false;
    }
  }
  
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    try {
      // Validate required fields
      if (!taskData.title) {
        throw new Error('Task title is required');
      }
      
      // Create task object
      const task = {
        id: uuidv4(),
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || TASK_STATUSES.TODO,
        priority: taskData.priority || TASK_PRIORITIES.MEDIUM,
        context: taskData.context || TASK_CONTEXTS.WORK,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        attachments: taskData.attachments || [],
        notes: taskData.notes || '',
        reminderId: null,
        language: taskData.language || this.currentLanguage
      };
      
      // Create reminder if due date is provided
      if (task.dueDate && taskData.createReminder !== false) {
        try {
          const reminder = await reminderService.createReminder({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            category: 'task',
            priority: task.priority,
            context: task.context,
            relatedItemId: task.id,
            relatedItemType: 'task',
            language: task.language
          });
          
          task.reminderId = reminder.id;
        } catch (reminderError) {
          console.warn('Error creating reminder for task:', reminderError);
          // Continue without reminder
        }
      }
      
      // Add to tasks array
      this.tasks.push(task);
      
      // Save tasks
      await this.saveTasks();
      
      // Call callback
      if (this.onTaskAdded) {
        this.onTaskAdded(task);
      }
      
      console.log('Task created:', task.id);
      
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(id, taskData) {
    try {
      // Find task
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      const task = this.tasks[taskIndex];
      
      // Update fields
      const updatedTask = {
        ...task,
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure dates are in ISO format
      if (taskData.dueDate) {
        updatedTask.dueDate = new Date(taskData.dueDate).toISOString();
      }
      
      // Update reminder if due date changed or task completed
      if (task.reminderId && (taskData.dueDate || taskData.status === TASK_STATUSES.COMPLETED)) {
        try {
          if (taskData.status === TASK_STATUSES.COMPLETED) {
            // Mark reminder as completed
            await reminderService.updateReminder(task.reminderId, {
              completed: true
            });
          } else if (taskData.dueDate) {
            // Update reminder due date
            await reminderService.updateReminder(task.reminderId, {
              dueDate: updatedTask.dueDate,
              title: updatedTask.title,
              description: updatedTask.description,
              priority: updatedTask.priority,
              context: updatedTask.context
            });
          }
        } catch (reminderError) {
          console.warn('Error updating reminder for task:', reminderError);
          // Continue without reminder update
        }
      }
      
      // Create reminder if due date is added and no reminder exists
      if (!task.reminderId && updatedTask.dueDate && taskData.createReminder !== false) {
        try {
          const reminder = await reminderService.createReminder({
            title: updatedTask.title,
            description: updatedTask.description,
            dueDate: updatedTask.dueDate,
            category: 'task',
            priority: updatedTask.priority,
            context: updatedTask.context,
            relatedItemId: updatedTask.id,
            relatedItemType: 'task',
            language: updatedTask.language
          });
          
          updatedTask.reminderId = reminder.id;
        } catch (reminderError) {
          console.warn('Error creating reminder for task:', reminderError);
          // Continue without reminder
        }
      }
      
      // Update tasks array
      this.tasks[taskIndex] = updatedTask;
      
      // Save tasks
      await this.saveTasks();
      
      // Call callback
      if (this.onTaskUpdated) {
        this.onTaskUpdated(updatedTask);
      }
      
      // Call status change callback if status changed
      if (taskData.status && taskData.status !== task.status && this.onTaskStatusChanged) {
        this.onTaskStatusChanged(updatedTask, task.status);
      }
      
      console.log('Task updated:', updatedTask.id);
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
  
  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(id) {
    try {
      // Find task
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      const task = this.tasks[taskIndex];
      
      // Delete reminder if exists
      if (task.reminderId) {
        try {
          await reminderService.deleteReminder(task.reminderId);
        } catch (reminderError) {
          console.warn('Error deleting reminder for task:', reminderError);
          // Continue without reminder deletion
        }
      }
      
      // Remove from tasks array
      this.tasks.splice(taskIndex, 1);
      
      // Save tasks
      await this.saveTasks();
      
      // Call callback
      if (this.onTaskDeleted) {
        this.onTaskDeleted(id);
      }
      
      console.log('Task deleted:', id);
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }
  
  /**
   * Get all tasks with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered tasks
   */
  getTasks(filters = {}) {
    try {
      let filteredTasks = [...this.tasks];
      
      // Filter by status
      if (filters.status) {
        filteredTasks = filteredTasks.filter(t => t.status === filters.status);
      }
      
      // Filter by priority
      if (filters.priority) {
        filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
      }
      
      // Filter by context
      if (filters.context) {
        filteredTasks = filteredTasks.filter(t => t.context === filters.context);
      }
      
      // Filter by due date range
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredTasks = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredTasks = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) <= endDate);
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filteredTasks = filteredTasks.filter(t => 
          filters.tags.some(tag => t.tags.includes(tag))
        );
      }
      
      // Filter by search term
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredTasks = filteredTasks.filter(t => 
          t.title.toLowerCase().includes(searchTerm) || 
          t.description.toLowerCase().includes(searchTerm) ||
          t.notes.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filter by language
      if (filters.language) {
        filteredTasks = filteredTasks.filter(t => t.language === filters.language);
      }
      
      // Sort by due date, priority, or creation date
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'dueDate':
            filteredTasks.sort((a, b) => {
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
          case 'priority':
            const priorityOrder = {
              [TASK_PRIORITIES.HIGH]: 0,
              [TASK_PRIORITIES.MEDIUM]: 1,
              [TASK_PRIORITIES.LOW]: 2
            };
            filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
          case 'createdAt':
            filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case 'updatedAt':
            filteredTasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            break;
          default:
            // Default sort by creation date (newest first)
            filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } else {
        // Default sort by creation date (newest first)
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Reverse order if specified
      if (filters.sortOrder === 'desc') {
        filteredTasks.reverse();
      }
      
      return filteredTasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }
  
  /**
   * Get a task by ID
   * @param {string} id - Task ID
   * @returns {Object} Task object
   */
  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }
  
  /**
   * Change task status
   * @param {string} id - Task ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated task
   */
  async changeTaskStatus(id, status) {
    try {
      if (!Object.values(TASK_STATUSES).includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      
      return await this.updateTask(id, { status });
    } catch (error) {
      console.error('Error changing task status:', error);
      throw error;
    }
  }
  
  /**
   * Add a subtask to a task
   * @param {string} taskId - Parent task ID
   * @param {Object} subtaskData - Subtask data
   * @returns {Promise<Object>} Updated task
   */
  async addSubtask(taskId, subtaskData) {
    try {
      // Find task
      const task = this.getTaskById(taskId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Validate required fields
      if (!subtaskData.title) {
        throw new Error('Subtask title is required');
      }
      
      // Create subtask object
      const subtask = {
        id: uuidv4(),
        title: subtaskData.title,
        completed: subtaskData.completed || false,
        createdAt: new Date().toISOString()
      };
      
      // Add to subtasks array
      const updatedTask = {
        ...task,
        subtasks: [...task.subtasks, subtask],
        updatedAt: new Date().toISOString()
      };
      
      // Update task
      return await this.updateTask(taskId, { subtasks: updatedTask.subtasks });
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  }
  
  /**
   * Update a subtask
   * @param {string} taskId - Parent task ID
   * @param {string} subtaskId - Subtask ID
   * @param {Object} subtaskData - Updated subtask data
   * @returns {Promise<Object>} Updated task
   */
  async updateSubtask(taskId, subtaskId, subtaskData) {
    try {
      // Find task
      const task = this.getTaskById(taskId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Find subtask
      const subtaskIndex = task.subtasks.findIndex(s => s.id === subtaskId);
      
      if (subtaskIndex === -1) {
        throw new Error(`Subtask with ID ${subtaskId} not found`);
      }
      
      // Update subtask
      const updatedSubtasks = [...task.subtasks];
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        ...subtaskData
      };
      
      // Update task
      return await this.updateTask(taskId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  }
  
  /**
   * Delete a subtask
   * @param {string} taskId - Parent task ID
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<Object>} Updated task
   */
  async deleteSubtask(taskId, subtaskId) {
    try {
      // Find task
      const task = this.getTaskById(taskId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Filter out subtask
      const updatedSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
      
      // Update task
      return await this.updateTask(taskId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  }
  
  /**
   * Set callback functions
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    if (callbacks.onTaskAdded) {
      this.onTaskAdded = callbacks.onTaskAdded;
    }
    
    if (callbacks.onTaskUpdated) {
      this.onTaskUpdated = callbacks.onTaskUpdated;
    }
    
    if (callbacks.onTaskDeleted) {
      this.onTaskDeleted = callbacks.onTaskDeleted;
    }
    
    if (callbacks.onTaskStatusChanged) {
      this.onTaskStatusChanged = callbacks.onTaskStatusChanged;
    }
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    try {
      console.log('Task Service cleaned up');
      
      return true;
    } catch (error) {
      console.error('Error cleaning up Task Service:', error);
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
      console.log(`Task language set to: ${language}`);
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

// Create a singleton instance
const taskService = new TaskService();

export default taskService;
export { TASK_STATUSES, TASK_PRIORITIES, TASK_CONTEXTS };

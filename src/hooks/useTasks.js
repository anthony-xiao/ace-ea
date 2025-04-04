/**
 * useTasks Hook for Ace Assistant
 * 
 * This hook provides access to the task management functionality throughout the application,
 * with support for both English and Chinese languages.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import taskService, { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  TASK_CONTEXTS 
} from '../services/organization/TaskService';
import { useAce } from '../core/providers/AceProvider';
import useLocalization from './useLocalization';

/**
 * Hook for using tasks
 * @param {Object} options - Hook options
 * @returns {Object} Task utilities
 */
const useTasks = (options = {}) => {
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  
  // Initialize task service
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await taskService.initialize();
      
      if (success) {
        setInitialized(true);
        
        // Set callbacks
        taskService.setCallbacks({
          onTaskAdded: (task) => {
            // Refresh tasks
            refreshTasks();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          onTaskUpdated: () => {
            // Refresh tasks
            refreshTasks();
          },
          onTaskDeleted: () => {
            // Refresh tasks
            refreshTasks();
          },
          onTaskStatusChanged: (task, previousStatus) => {
            // Refresh tasks
            refreshTasks();
            
            // Provide haptic feedback
            if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        });
        
        // Set language
        taskService.setLanguage(language);
        
        // Load tasks
        refreshTasks();
        
        setLoading(false);
        return true;
      } else {
        setError('Failed to initialize task service');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error initializing tasks:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [language, enableHapticFeedback]);
  
  // Refresh tasks
  const refreshTasks = useCallback(() => {
    try {
      const filteredTasks = taskService.getTasks(filters);
      setTasks(filteredTasks);
      return filteredTasks;
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError(err.message);
      return [];
    }
  }, [filters]);
  
  // Create a task
  const createTask = useCallback(async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set language if not provided
      if (!taskData.language) {
        taskData.language = language;
      }
      
      const task = await taskService.createTask(taskData);
      
      // Refresh tasks
      refreshTasks();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setLoading(false);
      return task;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [language, refreshTasks, enableHapticFeedback]);
  
  // Update a task
  const updateTask = useCallback(async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      const task = await taskService.updateTask(id, taskData);
      
      // Refresh tasks
      refreshTasks();
      
      setLoading(false);
      return task;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
  // Delete a task
  const deleteTask = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await taskService.deleteTask(id);
      
      // Refresh tasks
      refreshTasks();
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
      setLoading(false);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return false;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
  // Change task status
  const changeTaskStatus = useCallback(async (id, status) => {
    try {
      const task = await taskService.changeTaskStatus(id, status);
      
      // Refresh tasks
      refreshTasks();
      
      // Provide haptic feedback
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      return task;
    } catch (err) {
      console.error('Error changing task status:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
  // Add subtask
  const addSubtask = useCallback(async (taskId, subtaskData) => {
    try {
      const subtask = await taskService.addSubtask(taskId, subtaskData);
      
      // Refresh tasks
      refreshTasks();
      
      return subtask;
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
  // Update subtask
  const updateSubtask = useCallback(async (taskId, subtaskId, subtaskData) => {
    try {
      const subtask = await taskService.updateSubtask(taskId, subtaskId, subtaskData);
      
      // Refresh tasks
      refreshTasks();
      
      return subtask;
    } catch (err) {
      console.error('Error updating subtask:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      throw err;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
  // Delete subtask
  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    try {
      const success = await taskService.deleteSubtask(taskId, subtaskId);
      
      // Refresh tasks
      refreshTasks();
      
      return success;
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setError(err.message);
      
      // Provide haptic feedback for error
      if (enableHapticFeedback && (Platform.OS === 'ios' || Platform.OS === 'android')) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return false;
    }
  }, [refreshTasks, enableHapticFeedback]);
  
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
      const success = await taskService.cleanup();
      
      if (success) {
        setInitialized(false);
        setTasks([]);
        setError(null);
        
        return true;
      } else {
        setError('Failed to clean up task service');
        return false;
      }
    } catch (err) {
      console.error('Error cleaning up tasks:', err);
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
  
  // Refresh tasks when filters change
  useEffect(() => {
    if (initialized) {
      refreshTasks();
    }
  }, [initialized, filters, refreshTasks]);
  
  // Update language when UI language changes
  useEffect(() => {
    if (initialized) {
      taskService.setLanguage(language);
    }
  }, [language, initialized]);
  
  // Helper functions
  const getUpcomingTasks = useCallback((count = 5) => {
    const now = new Date();
    return tasks
      .filter(t => t.status !== TASK_STATUSES.COMPLETED && t.dueDate && new Date(t.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, count);
  }, [tasks]);
  
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks
      .filter(t => t.status !== TASK_STATUSES.COMPLETED && t.dueDate && new Date(t.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);
  
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);
  
  const getTasksByContext = useCallback((context) => {
    return tasks.filter(t => t.context === context);
  }, [tasks]);
  
  const getTasksByPriority = useCallback((priority) => {
    return tasks.filter(t => t.priority === priority);
  }, [tasks]);
  
  // Return hook value
  return {
    // State
    initialized,
    tasks,
    loading,
    error,
    filters,
    
    // Constants
    statuses: TASK_STATUSES,
    priorities: TASK_PRIORITIES,
    contexts: TASK_CONTEXTS,
    
    // Core functions
    initialize,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    updateFilters,
    resetFilters,
    cleanup,
    
    // Helper functions
    getUpcomingTasks,
    getOverdueTasks,
    getTasksByStatus,
    getTasksByContext,
    getTasksByPriority,
    getTaskById: taskService.getTaskById,
    
    // Status checks
    isInitialized: () => initialized,
    isLoading: () => loading,
    hasError: () => error !== null
  };
};

export default useTasks;

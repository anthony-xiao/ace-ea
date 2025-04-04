/**
 * TaskList Component for Ace Assistant
 * 
 * This component displays a list of tasks with filtering, sorting, and action capabilities.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTasks from '../../hooks/useTasks';
import useLocalization from '../../hooks/useLocalization';
import TaskItem from './TaskItem';
import EmptyState from '../common/EmptyState';
import FilterBar from '../common/FilterBar';
import SortMenu from '../common/SortMenu';

/**
 * TaskList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TaskList = ({ 
  initialFilters = {},
  showHeader = true,
  showActions = true,
  showFilters = true,
  maxItems = null,
  onTaskPress,
  onCreateTask,
  style
}) => {
  // Get tasks and localization
  const { 
    tasks, 
    loading, 
    error,
    filters,
    statuses,
    priorities,
    contexts,
    updateFilters,
    resetFilters,
    refreshTasks,
    changeTaskStatus,
    deleteTask
  } = useTasks({ defaultFilters: initialFilters });
  
  const { t, language } = useLocalization();
  
  // State
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Filter options
  const filterOptions = useMemo(() => [
    {
      id: 'status',
      label: t('tasks.filters.status'),
      options: [
        { value: null, label: t('common.all') },
        { value: statuses.TODO, label: t('tasks.status.todo') },
        { value: statuses.IN_PROGRESS, label: t('tasks.status.in_progress') },
        { value: statuses.COMPLETED, label: t('tasks.status.completed') }
      ]
    },
    {
      id: 'priority',
      label: t('tasks.filters.priority'),
      options: [
        { value: null, label: t('common.all') },
        { value: priorities.HIGH, label: t('tasks.priority.high') },
        { value: priorities.MEDIUM, label: t('tasks.priority.medium') },
        { value: priorities.LOW, label: t('tasks.priority.low') }
      ]
    },
    {
      id: 'context',
      label: t('tasks.filters.context'),
      options: [
        { value: null, label: t('common.all') },
        { value: contexts.WORK, label: t('tasks.context.work') },
        { value: contexts.PERSONAL, label: t('tasks.context.personal') },
        { value: contexts.FAMILY, label: t('tasks.context.family') }
      ]
    }
  ], [t, statuses, priorities, contexts]);
  
  // Sort options
  const sortOptions = useMemo(() => [
    { value: 'dueDate', label: t('tasks.sort.due_date') },
    { value: 'priority', label: t('tasks.sort.priority') },
    { value: 'title', label: t('tasks.sort.title') },
    { value: 'createdAt', label: t('tasks.sort.created_at') }
  ], [t]);
  
  // Handle sort change
  const handleSortChange = useCallback((option) => {
    setSortBy(option.value);
  }, []);
  
  // Handle sort direction change
  const handleSortDirectionChange = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);
  
  // Handle filter change
  const handleFilterChange = useCallback((filterId, value) => {
    updateFilters({ [filterId]: value });
  }, [updateFilters]);
  
  // Handle task status change
  const handleTaskStatusChange = useCallback(async (taskId, newStatus) => {
    try {
      await changeTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error changing task status:', error);
    }
  }, [changeTaskStatus]);
  
  // Handle task deletion
  const handleTaskDelete = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [deleteTask]);
  
  // Handle task press
  const handleTaskPress = useCallback((task) => {
    if (onTaskPress) {
      onTaskPress(task);
    }
  }, [onTaskPress]);
  
  // Handle create task
  const handleCreateTask = useCallback(() => {
    if (onCreateTask) {
      onCreateTask();
    }
  }, [onCreateTask]);
  
  // Sort tasks
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    let sorted = [...tasks];
    
    switch (sortBy) {
      case 'dueDate':
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case 'priority':
        const priorityOrder = { 
          [priorities.HIGH]: 0, 
          [priorities.MEDIUM]: 1, 
          [priorities.LOW]: 2 
        };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'createdAt':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        // Default sort by due date
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }
    
    // Apply sort direction
    if (sortDirection === 'desc') {
      sorted.reverse();
    }
    
    // Apply max items limit if specified
    if (maxItems && maxItems > 0) {
      sorted = sorted.slice(0, maxItems);
    }
    
    return sorted;
  }, [tasks, sortBy, sortDirection, priorities, maxItems]);
  
  // Render task item
  const renderTaskItem = useCallback(({ item }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onStatusChange={handleTaskStatusChange}
      onDelete={handleTaskDelete}
      showActions={showActions}
    />
  ), [handleTaskPress, handleTaskStatusChange, handleTaskDelete, showActions]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <EmptyState
      icon="checkmark-circle-outline"
      title={t('tasks.empty.title')}
      message={t('tasks.empty.message')}
      actionLabel={t('tasks.empty.action')}
      onAction={handleCreateTask}
    />
  ), [t, handleCreateTask]);
  
  // Render list header
  const renderHeader = useCallback(() => {
    if (!showHeader) return null;
    
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tasks.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={refreshTasks}
          >
            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={handleCreateTask}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [showHeader, t, refreshTasks, handleCreateTask]);
  
  // Render filter bar
  const renderFilterBar = useCallback(() => {
    if (!showFilters) return null;
    
    return (
      <View style={styles.filterContainer}>
        <FilterBar
          options={filterOptions}
          selectedValues={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
        <SortMenu
          options={sortOptions}
          selectedValue={sortBy}
          sortDirection={sortDirection}
          onChange={handleSortChange}
          onDirectionChange={handleSortDirectionChange}
        />
      </View>
    );
  }, [
    showFilters, 
    filterOptions, 
    filters, 
    handleFilterChange, 
    resetFilters, 
    sortOptions, 
    sortBy, 
    sortDirection, 
    handleSortChange, 
    handleSortDirectionChange
  ]);
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{t('common.error')}</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshTasks}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render task list
  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {renderFilterBar()}
      <FlatList
        data={sortedTasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAction: {
    marginLeft: 16
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30'
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default TaskList;

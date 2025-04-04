/**
 * TaskDashboard Component for Ace Assistant
 * 
 * This component provides a dashboard view of tasks with different sections
 * for upcoming, overdue, and in-progress tasks.
 * It supports both English and Chinese languages.
 */

import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTasks from '../../hooks/useTasks';
import useLocalization from '../../hooks/useLocalization';
import TaskItem from './TaskItem';
import EmptyState from '../common/EmptyState';

/**
 * TaskDashboard component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TaskDashboard = ({ 
  onTaskPress,
  onCreateTask,
  onViewAllTasks,
  style
}) => {
  // Get tasks and localization
  const { 
    tasks, 
    loading, 
    error,
    statuses,
    refreshTasks,
    getUpcomingTasks,
    getOverdueTasks,
    getTasksByStatus
  } = useTasks();
  
  const { t } = useLocalization();
  
  // Get task sections
  const upcomingTasks = useMemo(() => getUpcomingTasks(3), [getUpcomingTasks]);
  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks]);
  const inProgressTasks = useMemo(() => 
    getTasksByStatus(statuses.IN_PROGRESS).slice(0, 3), 
    [getTasksByStatus, statuses.IN_PROGRESS]
  );
  
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
  
  // Handle view all tasks
  const handleViewAllTasks = useCallback(() => {
    if (onViewAllTasks) {
      onViewAllTasks();
    }
  }, [onViewAllTasks]);
  
  // Render section header
  const renderSectionHeader = useCallback((title, count, actionLabel, onAction) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.sectionAction}
        onPress={onAction}
      >
        <Text style={styles.sectionActionText}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
  ), []);
  
  // Render task items
  const renderTaskItems = useCallback((taskList, emptyMessage) => {
    if (taskList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }
    
    return taskList.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        onPress={() => handleTaskPress(task)}
        showActions={false}
        style={styles.taskItem}
      />
    ));
  }, [handleTaskPress]);
  
  // Render loading state
  if (loading && tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Ionicons name="hourglass-outline" size={48} color="#8E8E93" />
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
  
  // Render dashboard
  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tasks.dashboard.title')}</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateTask}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader(
            t('tasks.dashboard.overdue'), 
            overdueTasks.length,
            t('common.view_all'),
            handleViewAllTasks
          )}
          <View style={styles.sectionContent}>
            {renderTaskItems(
              overdueTasks.slice(0, 3), 
              t('tasks.dashboard.no_overdue')
            )}
          </View>
        </View>
      )}
      
      {/* In Progress Tasks Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('tasks.dashboard.in_progress'), 
          inProgressTasks.length,
          t('common.view_all'),
          handleViewAllTasks
        )}
        <View style={styles.sectionContent}>
          {renderTaskItems(
            inProgressTasks, 
            t('tasks.dashboard.no_in_progress')
          )}
        </View>
      </View>
      
      {/* Upcoming Tasks Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('tasks.dashboard.upcoming'), 
          upcomingTasks.length,
          t('common.view_all'),
          handleViewAllTasks
        )}
        <View style={styles.sectionContent}>
          {renderTaskItems(
            upcomingTasks, 
            t('tasks.dashboard.no_upcoming')
          )}
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCreateTask}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('tasks.dashboard.create_task')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleViewAllTasks}
        >
          <Ionicons name="list-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('tasks.dashboard.view_all_tasks')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  contentContainer: {
    padding: 16
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
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000'
  },
  createButton: {
    padding: 4
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  countBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionActionText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 4
  },
  sectionContent: {
    padding: 8
  },
  taskItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8
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

export default TaskDashboard;

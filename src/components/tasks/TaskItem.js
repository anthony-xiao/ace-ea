/**
 * TaskItem Component for Ace Assistant
 * 
 * This component displays a single task item with status, priority, and action capabilities.
 * It supports both English and Chinese languages.
 */

import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import useLocalization from '../../hooks/useLocalization';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

/**
 * TaskItem component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TaskItem = ({ 
  task,
  onPress,
  onStatusChange,
  onDelete,
  showActions = true,
  style
}) => {
  // Get localization
  const { t, language } = useLocalization();
  
  // Date formatting locale
  const dateLocale = useMemo(() => language === 'zh' ? zhCN : enUS, [language]);
  
  // Format due date
  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return '';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if due date is today
    if (dueDate.toDateString() === today.toDateString()) {
      return t('tasks.due_date.today');
    }
    
    // Check if due date is tomorrow
    if (dueDate.toDateString() === tomorrow.toDateString()) {
      return t('tasks.due_date.tomorrow');
    }
    
    // Format date based on language
    return format(dueDate, language === 'zh' ? 'MM月dd日' : 'MMM d', { locale: dateLocale });
  }, [task.dueDate, t, language, dateLocale]);
  
  // Get priority color
  const priorityColor = useMemo(() => {
    switch (task.priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  }, [task.priority]);
  
  // Get context icon
  const contextIcon = useMemo(() => {
    switch (task.context) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      case 'family':
        return 'people-outline';
      default:
        return 'list-outline';
    }
  }, [task.context]);
  
  // Get status icon
  const statusIcon = useMemo(() => {
    switch (task.status) {
      case 'todo':
        return 'ellipse-outline';
      case 'in_progress':
        return 'time-outline';
      case 'completed':
        return 'checkmark-circle';
      default:
        return 'ellipse-outline';
    }
  }, [task.status]);
  
  // Handle status change
  const handleStatusChange = useCallback(() => {
    if (!onStatusChange) return;
    
    let newStatus;
    switch (task.status) {
      case 'todo':
        newStatus = 'in_progress';
        break;
      case 'in_progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'todo';
        break;
      default:
        newStatus = 'todo';
    }
    
    onStatusChange(task.id, newStatus);
  }, [task.id, task.status, onStatusChange]);
  
  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(task.id);
    }
  }, [task.id, onDelete]);
  
  // Render right actions (swipe actions)
  const renderRightActions = useCallback((progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [handleDelete]);
  
  // Determine if task is overdue
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  }, [task.dueDate, task.status]);
  
  // Render task item
  return (
    <Swipeable
      renderRightActions={showActions ? renderRightActions : null}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => onPress && onPress(task)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.statusButton}
          onPress={handleStatusChange}
          disabled={!onStatusChange}
        >
          <Ionicons 
            name={statusIcon} 
            size={24} 
            color={task.status === 'completed' ? '#34C759' : '#8E8E93'} 
          />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text 
              style={[
                styles.title, 
                task.status === 'completed' && styles.completedTitle
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <Ionicons name={contextIcon} size={16} color="#8E8E93" />
          </View>
          
          {task.description ? (
            <Text 
              style={[
                styles.description, 
                task.status === 'completed' && styles.completedText
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}
          
          <View style={styles.metaRow}>
            {task.dueDate ? (
              <View style={[styles.dueDateContainer, isOverdue && styles.overdueDateContainer]}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color={isOverdue ? '#FF3B30' : '#8E8E93'} 
                />
                <Text 
                  style={[
                    styles.dueDate, 
                    isOverdue && styles.overdueDate,
                    task.status === 'completed' && styles.completedText
                  ]}
                >
                  {formattedDueDate}
                </Text>
              </View>
            ) : null}
            
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>
                {t(`tasks.priority.${task.priority}`)}
              </Text>
            </View>
            
            {task.subtasks && task.subtasks.length > 0 ? (
              <View style={styles.subtaskIndicator}>
                <Ionicons name="list-outline" size={14} color="#8E8E93" />
                <Text style={styles.subtaskCount}>
                  {task.subtasks.length}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        
        {showActions ? (
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  statusButton: {
    marginRight: 12
  },
  content: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginRight: 8
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93'
  },
  description: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 8
  },
  completedText: {
    color: '#8E8E93'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  overdueDateContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  dueDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4
  },
  overdueDate: {
    color: '#FF3B30',
    fontWeight: '500'
  },
  priorityIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500'
  },
  subtaskIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  subtaskCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4
  },
  moreButton: {
    padding: 8
  },
  rightActions: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  actionButton: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    backgroundColor: '#FF3B30'
  }
});

export default TaskItem;

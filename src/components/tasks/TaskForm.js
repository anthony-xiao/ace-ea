/**
 * TaskForm Component for Ace Assistant
 * 
 * This component provides a form for creating and editing tasks.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import useTasks from '../../hooks/useTasks';
import useLocalization from '../../hooks/useLocalization';
import Button from '../common/Button';
import SegmentedControl from '../common/SegmentedControl';
import SubtaskList from './SubtaskList';

/**
 * TaskForm component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TaskForm = ({ 
  task = null,
  onSave,
  onCancel,
  style
}) => {
  // Get tasks and localization
  const { 
    statuses,
    priorities,
    contexts,
    createTask,
    updateTask
  } = useTasks();
  
  const { t, language } = useLocalization();
  
  // Form state
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [status, setStatus] = useState(task ? task.status : statuses.TODO);
  const [priority, setPriority] = useState(task ? task.priority : priorities.MEDIUM);
  const [context, setContext] = useState(task ? task.context : contexts.WORK);
  const [dueDate, setDueDate] = useState(task && task.dueDate ? new Date(task.dueDate) : null);
  const [hasDueDate, setHasDueDate] = useState(task && task.dueDate ? true : false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState(task && task.subtasks ? [...task.subtasks] : []);
  const [createReminder, setCreateReminder] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Status options
  const statusOptions = [
    { value: statuses.TODO, label: t('tasks.status.todo') },
    { value: statuses.IN_PROGRESS, label: t('tasks.status.in_progress') },
    { value: statuses.COMPLETED, label: t('tasks.status.completed') }
  ];
  
  // Priority options
  const priorityOptions = [
    { value: priorities.HIGH, label: t('tasks.priority.high') },
    { value: priorities.MEDIUM, label: t('tasks.priority.medium') },
    { value: priorities.LOW, label: t('tasks.priority.low') }
  ];
  
  // Context options
  const contextOptions = [
    { value: contexts.WORK, label: t('tasks.context.work') },
    { value: contexts.PERSONAL, label: t('tasks.context.personal') },
    { value: contexts.FAMILY, label: t('tasks.context.family') }
  ];
  
  // Handle date change
  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);
  
  // Handle due date toggle
  const handleDueDateToggle = useCallback((value) => {
    setHasDueDate(value);
    
    if (value && !dueDate) {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      setDueDate(tomorrow);
    }
  }, [dueDate]);
  
  // Handle add subtask
  const handleAddSubtask = useCallback((subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
    
    const newSubtask = {
      id: Date.now().toString(),
      title: subtaskTitle,
      completed: false
    };
    
    setSubtasks(prev => [...prev, newSubtask]);
  }, []);
  
  // Handle update subtask
  const handleUpdateSubtask = useCallback((subtaskId, updates) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
      )
    );
  }, []);
  
  // Handle delete subtask
  const handleDeleteSubtask = useCallback((subtaskId) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
  }, []);
  
  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // Validate form
      if (!title.trim()) {
        setError(t('tasks.form.error.title_required'));
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Prepare task data
      const taskData = {
        title,
        description,
        status,
        priority,
        context,
        dueDate: hasDueDate ? dueDate.toISOString() : null,
        subtasks,
        createReminder: hasDueDate ? createReminder : false,
        language
      };
      
      let savedTask;
      
      if (task) {
        // Update existing task
        savedTask = await updateTask(task.id, taskData);
      } else {
        // Create new task
        savedTask = await createTask(taskData);
      }
      
      setLoading(false);
      
      // Call onSave callback
      if (onSave) {
        onSave(savedTask);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [
    title, 
    description, 
    status, 
    priority, 
    context, 
    hasDueDate, 
    dueDate, 
    subtasks, 
    createReminder, 
    language, 
    task, 
    updateTask, 
    createTask, 
    onSave,
    t
  ]);
  
  // Render date picker
  const renderDatePicker = useCallback(() => {
    if (!hasDueDate) return null;
    
    return (
      <View style={styles.datePickerContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <Text style={styles.datePickerButtonText}>
            {dueDate ? dueDate.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US') : t('tasks.form.select_date')}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderLabel}>{t('tasks.form.create_reminder')}</Text>
          <Switch
            value={createReminder}
            onValueChange={setCreateReminder}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : createReminder ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
      </View>
    );
  }, [hasDueDate, dueDate, showDatePicker, handleDateChange, createReminder, language, t]);
  
  // Render form
  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {task ? t('tasks.form.edit_title') : t('tasks.form.create_title')}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onCancel}
        >
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.title')}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t('tasks.form.title_placeholder')}
          placeholderTextColor="#C7C7CC"
          autoCapitalize="sentences"
          autoFocus
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('tasks.form.description_placeholder')}
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.status')}</Text>
        <SegmentedControl
          options={statusOptions}
          selectedValue={status}
          onChange={setStatus}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.priority')}</Text>
        <SegmentedControl
          options={priorityOptions}
          selectedValue={priority}
          onChange={setPriority}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.context')}</Text>
        <SegmentedControl
          options={contextOptions}
          selectedValue={context}
          onChange={setContext}
        />
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.dueDateHeader}>
          <Text style={styles.label}>{t('tasks.form.due_date')}</Text>
          <Switch
            value={hasDueDate}
            onValueChange={handleDueDateToggle}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : hasDueDate ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
        {renderDatePicker()}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('tasks.form.subtasks')}</Text>
        <SubtaskList
          subtasks={subtasks}
          onAdd={handleAddSubtask}
          onUpdate={handleUpdateSubtask}
          onDelete={handleDeleteSubtask}
        />
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      <View style={styles.buttonContainer}>
        <Button
          title={task ? t('common.update') : t('common.create')}
          onPress={handleSave}
          loading={loading}
          disabled={!title.trim() || loading}
          primary
          style={styles.saveButton}
        />
        <Button
          title={t('common.cancel')}
          onPress={onCancel}
          disabled={loading}
          style={styles.cancelButton}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000'
  },
  closeButton: {
    padding: 4
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F9F9F9'
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12
  },
  dueDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  datePickerContainer: {
    marginTop: 8
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9'
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  reminderLabel: {
    fontSize: 16,
    color: '#000000'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  saveButton: {
    flex: 1,
    marginRight: 8
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8
  }
});

export default TaskForm;

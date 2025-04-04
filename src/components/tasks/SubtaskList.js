/**
 * SubtaskList Component for Ace Assistant
 * 
 * This component displays and manages a list of subtasks for a task.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLocalization from '../../hooks/useLocalization';

/**
 * SubtaskList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const SubtaskList = ({ 
  subtasks = [],
  onAdd,
  onUpdate,
  onDelete,
  style
}) => {
  // Get localization
  const { t } = useLocalization();
  
  // State
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Handle add subtask
  const handleAddSubtask = useCallback(() => {
    if (!newSubtaskTitle.trim()) return;
    
    onAdd(newSubtaskTitle);
    setNewSubtaskTitle('');
  }, [newSubtaskTitle, onAdd]);
  
  // Handle toggle subtask completion
  const handleToggleCompletion = useCallback((subtaskId, completed) => {
    onUpdate(subtaskId, { completed: !completed });
  }, [onUpdate]);
  
  // Handle update subtask title
  const handleUpdateTitle = useCallback((subtaskId, title) => {
    onUpdate(subtaskId, { title });
  }, [onUpdate]);
  
  // Handle delete subtask
  const handleDeleteSubtask = useCallback((subtaskId) => {
    onDelete(subtaskId);
  }, [onDelete]);
  
  // Render subtask item
  const renderSubtaskItem = useCallback(({ item }) => (
    <View style={styles.subtaskItem}>
      <TouchableOpacity
        style={styles.subtaskCheckbox}
        onPress={() => handleToggleCompletion(item.id, item.completed)}
      >
        <Ionicons 
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'} 
          size={20} 
          color={item.completed ? '#34C759' : '#8E8E93'} 
        />
      </TouchableOpacity>
      
      <TextInput
        style={[
          styles.subtaskTitle,
          item.completed && styles.completedSubtaskTitle
        ]}
        value={item.title}
        onChangeText={(text) => handleUpdateTitle(item.id, text)}
        placeholder={t('tasks.form.subtask_placeholder')}
        placeholderTextColor="#C7C7CC"
      />
      
      <TouchableOpacity
        style={styles.subtaskDeleteButton}
        onPress={() => handleDeleteSubtask(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [handleToggleCompletion, handleUpdateTitle, handleDeleteSubtask, t]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{t('tasks.form.no_subtasks')}</Text>
    </View>
  ), [t]);
  
  // Render component
  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={subtasks}
        renderItem={renderSubtaskItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        style={styles.subtaskList}
      />
      
      <View style={styles.addSubtaskContainer}>
        <TextInput
          style={styles.addSubtaskInput}
          value={newSubtaskTitle}
          onChangeText={setNewSubtaskTitle}
          placeholder={t('tasks.form.add_subtask_placeholder')}
          placeholderTextColor="#C7C7CC"
          returnKeyType="done"
          onSubmitEditing={handleAddSubtask}
        />
        
        <TouchableOpacity
          style={[
            styles.addSubtaskButton,
            !newSubtaskTitle.trim() && styles.disabledButton
          ]}
          onPress={handleAddSubtask}
          disabled={!newSubtaskTitle.trim()}
        >
          <Ionicons name="add-circle" size={24} color={newSubtaskTitle.trim() ? '#007AFF' : '#C7C7CC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden'
  },
  subtaskList: {
    maxHeight: 200
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  subtaskCheckbox: {
    marginRight: 8
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#000000'
  },
  completedSubtaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93'
  },
  subtaskDeleteButton: {
    padding: 4
  },
  emptyState: {
    padding: 16,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic'
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addSubtaskInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000'
  },
  addSubtaskButton: {
    padding: 4
  },
  disabledButton: {
    opacity: 0.5
  }
});

export default SubtaskList;

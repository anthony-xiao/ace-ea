/**
 * ParticipantList Component for Ace Assistant
 * 
 * This component displays and manages a list of meeting participants.
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
 * ParticipantList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ParticipantList = ({ 
  participants = [],
  onAdd,
  onRemove,
  style
}) => {
  // Get localization
  const { t } = useLocalization();
  
  // State
  const [newParticipant, setNewParticipant] = useState('');
  
  // Handle add participant
  const handleAddParticipant = useCallback(() => {
    if (!newParticipant.trim()) return;
    
    onAdd(newParticipant);
    setNewParticipant('');
  }, [newParticipant, onAdd]);
  
  // Handle remove participant
  const handleRemoveParticipant = useCallback((index) => {
    onRemove(index);
  }, [onRemove]);
  
  // Render participant item
  const renderParticipantItem = useCallback(({ item, index }) => (
    <View style={styles.participantItem}>
      <Ionicons name="person-outline" size={16} color="#8E8E93" />
      <Text style={styles.participantName}>{item}</Text>
      <TouchableOpacity
        style={styles.participantRemoveButton}
        onPress={() => handleRemoveParticipant(index)}
      >
        <Ionicons name="close-circle" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [handleRemoveParticipant]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {t('meetings.form.no_participants')}
      </Text>
    </View>
  ), [t]);
  
  // Render component
  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={participants}
        renderItem={renderParticipantItem}
        keyExtractor={(item, index) => `participant-${index}`}
        ListEmptyComponent={renderEmptyState}
        style={styles.participantList}
      />
      
      <View style={styles.addParticipantContainer}>
        <TextInput
          style={styles.addParticipantInput}
          value={newParticipant}
          onChangeText={setNewParticipant}
          placeholder={t('meetings.form.participant_placeholder')}
          placeholderTextColor="#C7C7CC"
          returnKeyType="done"
          onSubmitEditing={handleAddParticipant}
        />
        
        <TouchableOpacity
          style={[
            styles.addParticipantButton,
            !newParticipant.trim() && styles.disabledButton
          ]}
          onPress={handleAddParticipant}
          disabled={!newParticipant.trim()}
        >
          <Ionicons 
            name="add-circle" 
            size={24} 
            color={newParticipant.trim() ? '#007AFF' : '#C7C7CC'} 
          />
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
  participantList: {
    maxHeight: 150,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4
  },
  participantName: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    marginLeft: 8
  },
  participantRemoveButton: {
    padding: 2
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
  addParticipantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addParticipantInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000'
  },
  addParticipantButton: {
    padding: 4
  },
  disabledButton: {
    opacity: 0.5
  }
});

export default ParticipantList;

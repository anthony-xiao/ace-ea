/**
 * RecipientList Component for Ace Assistant
 * 
 * This component displays and manages a list of email recipients.
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
 * RecipientList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const RecipientList = ({ 
  type = 'to',
  recipients = [],
  onAdd,
  onRemove,
  style
}) => {
  // Get localization
  const { t } = useLocalization();
  
  // State
  const [newRecipient, setNewRecipient] = useState('');
  
  // Handle add recipient
  const handleAddRecipient = useCallback(() => {
    if (!newRecipient.trim() || !newRecipient.includes('@')) return;
    
    onAdd(newRecipient);
    setNewRecipient('');
  }, [newRecipient, onAdd]);
  
  // Handle remove recipient
  const handleRemoveRecipient = useCallback((index) => {
    onRemove(index);
  }, [onRemove]);
  
  // Render recipient item
  const renderRecipientItem = useCallback(({ item, index }) => (
    <View style={styles.recipientItem}>
      <Text style={styles.recipientEmail}>{item}</Text>
      <TouchableOpacity
        style={styles.recipientRemoveButton}
        onPress={() => handleRemoveRecipient(index)}
      >
        <Ionicons name="close-circle" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [handleRemoveRecipient]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {t(`emails.form.${type}_empty`)}
      </Text>
    </View>
  ), [t, type]);
  
  // Render component
  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={recipients}
        renderItem={renderRecipientItem}
        keyExtractor={(item, index) => `${type}-${index}`}
        ListEmptyComponent={renderEmptyState}
        style={styles.recipientList}
        horizontal={false}
        numColumns={2}
      />
      
      <View style={styles.addRecipientContainer}>
        <TextInput
          style={styles.addRecipientInput}
          value={newRecipient}
          onChangeText={setNewRecipient}
          placeholder={t(`emails.form.${type}_placeholder`)}
          placeholderTextColor="#C7C7CC"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleAddRecipient}
        />
        
        <TouchableOpacity
          style={[
            styles.addRecipientButton,
            (!newRecipient.trim() || !newRecipient.includes('@')) && styles.disabledButton
          ]}
          onPress={handleAddRecipient}
          disabled={!newRecipient.trim() || !newRecipient.includes('@')}
        >
          <Ionicons 
            name="add-circle" 
            size={24} 
            color={(newRecipient.trim() && newRecipient.includes('@')) ? '#007AFF' : '#C7C7CC'} 
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
  recipientList: {
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    flex: 1,
    maxWidth: '48%'
  },
  recipientEmail: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
    marginRight: 4
  },
  recipientRemoveButton: {
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
  addRecipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addRecipientInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000'
  },
  addRecipientButton: {
    padding: 4
  },
  disabledButton: {
    opacity: 0.5
  }
});

export default RecipientList;

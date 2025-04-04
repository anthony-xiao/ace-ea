/**
 * AttachmentList Component for Ace Assistant
 * 
 * This component displays and manages a list of email attachments.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import useLocalization from '../../hooks/useLocalization';

/**
 * AttachmentList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const AttachmentList = ({ 
  attachments = [],
  onAdd,
  onRemove,
  style
}) => {
  // Get localization
  const { t } = useLocalization();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle pick document
  const handlePickDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        
        // Create attachment object
        const attachment = {
          name: result.name,
          uri: result.uri,
          type: result.mimeType || 'application/octet-stream',
          size: fileInfo.size || 0
        };
        
        // Add attachment
        onAdd(attachment);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error picking document:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [onAdd]);
  
  // Handle remove attachment
  const handleRemoveAttachment = useCallback((attachmentId) => {
    onRemove(attachmentId);
  }, [onRemove]);
  
  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);
  
  // Get file icon
  const getFileIcon = useCallback((fileType) => {
    if (!fileType) return 'document-outline';
    
    if (fileType.includes('image')) {
      return 'image-outline';
    } else if (fileType.includes('pdf')) {
      return 'document-text-outline';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'document-outline';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return 'grid-outline';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return 'easel-outline';
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return 'archive-outline';
    } else if (fileType.includes('audio')) {
      return 'musical-note-outline';
    } else if (fileType.includes('video')) {
      return 'videocam-outline';
    } else {
      return 'document-outline';
    }
  }, []);
  
  // Render attachment item
  const renderAttachmentItem = useCallback(({ item }) => (
    <View style={styles.attachmentItem}>
      <View style={styles.attachmentIconContainer}>
        <Ionicons 
          name={getFileIcon(item.type)} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      
      <View style={styles.attachmentInfo}>
        <Text 
          style={styles.attachmentName}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={styles.attachmentSize}>
          {formatFileSize(item.size)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.attachmentRemoveButton}
        onPress={() => handleRemoveAttachment(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [getFileIcon, formatFileSize, handleRemoveAttachment]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{t('emails.form.no_attachments')}</Text>
    </View>
  ), [t]);
  
  // Render component
  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={attachments}
        renderItem={renderAttachmentItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        style={styles.attachmentList}
      />
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      <TouchableOpacity
        style={styles.addAttachmentButton}
        onPress={handlePickDocument}
        disabled={loading}
      >
        <Ionicons name="attach-outline" size={20} color="#007AFF" />
        <Text style={styles.addAttachmentButtonText}>
          {loading ? t('common.loading') : t('emails.form.add_attachment')}
        </Text>
      </TouchableOpacity>
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
  attachmentList: {
    maxHeight: 200
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  attachmentInfo: {
    flex: 1
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2
  },
  attachmentSize: {
    fontSize: 12,
    color: '#8E8E93'
  },
  attachmentRemoveButton: {
    padding: 8
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: 12
  },
  addAttachmentButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8
  }
});

export default AttachmentList;

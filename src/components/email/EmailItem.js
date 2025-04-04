/**
 * EmailItem Component for Ace Assistant
 * 
 * This component displays a single email item with subject, recipients, and action capabilities.
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
 * EmailItem component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EmailItem = ({ 
  email,
  onPress,
  onDelete,
  onSend,
  showActions = true,
  style
}) => {
  // Get localization
  const { t, language } = useLocalization();
  
  // Date formatting locale
  const dateLocale = useMemo(() => language === 'zh' ? zhCN : enUS, [language]);
  
  // Format date
  const formattedDate = useMemo(() => {
    if (!email.createdAt) return '';
    
    const date = new Date(email.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm');
    }
    
    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return t('emails.date.yesterday');
    }
    
    // Format date based on language
    return format(date, language === 'zh' ? 'MM月dd日' : 'MMM d', { locale: dateLocale });
  }, [email.createdAt, t, language, dateLocale]);
  
  // Get priority color
  const priorityColor = useMemo(() => {
    switch (email.priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  }, [email.priority]);
  
  // Get context icon
  const contextIcon = useMemo(() => {
    switch (email.context) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      case 'family':
        return 'people-outline';
      default:
        return 'mail-outline';
    }
  }, [email.context]);
  
  // Get status icon
  const statusIcon = useMemo(() => {
    switch (email.status) {
      case 'draft':
        return 'document-text-outline';
      case 'sent':
        return 'paper-plane-outline';
      case 'received':
        return 'mail-open-outline';
      case 'archived':
        return 'archive-outline';
      case 'deleted':
        return 'trash-outline';
      default:
        return 'mail-outline';
    }
  }, [email.status]);
  
  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(email.id);
    }
  }, [email.id, onDelete]);
  
  // Handle send
  const handleSend = useCallback(() => {
    if (onSend && email.status === 'draft') {
      onSend(email.id);
    }
  }, [email.id, email.status, onSend]);
  
  // Render right actions (swipe actions)
  const renderRightActions = useCallback((progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActions}>
        {email.status === 'draft' && (
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.sendButton]}
              onPress={handleSend}
            >
              <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
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
  }, [email.status, handleSend, handleDelete]);
  
  // Format recipients
  const recipients = useMemo(() => {
    if (!email.to || email.to.length === 0) return '';
    
    if (email.to.length === 1) {
      return email.to[0];
    }
    
    return `${email.to[0]} ${t('emails.and_others', { count: email.to.length - 1 })}`;
  }, [email.to, t]);
  
  // Determine if email has attachments
  const hasAttachments = useMemo(() => {
    return email.attachments && email.attachments.length > 0;
  }, [email.attachments]);
  
  // Determine if email is scheduled
  const isScheduled = useMemo(() => {
    return email.status === 'draft' && email.scheduledDate;
  }, [email.status, email.scheduledDate]);
  
  // Render email item
  return (
    <Swipeable
      renderRightActions={showActions ? renderRightActions : null}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => onPress && onPress(email)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={statusIcon} 
            size={24} 
            color="#8E8E93" 
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text 
              style={styles.subject}
              numberOfLines={1}
            >
              {email.subject}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          
          <View style={styles.recipientRow}>
            <Text 
              style={styles.recipients}
              numberOfLines={1}
            >
              {recipients}
            </Text>
            <Ionicons name={contextIcon} size={16} color="#8E8E93" />
          </View>
          
          {email.body ? (
            <Text 
              style={styles.preview}
              numberOfLines={2}
            >
              {email.body}
            </Text>
          ) : null}
          
          <View style={styles.metaRow}>
            {isScheduled ? (
              <View style={styles.scheduledContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color="#8E8E93" 
                />
                <Text style={styles.scheduledText}>
                  {t('emails.scheduled')}
                </Text>
              </View>
            ) : null}
            
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>
                {t(`emails.priority.${email.priority}`)}
              </Text>
            </View>
            
            {hasAttachments ? (
              <View style={styles.attachmentIndicator}>
                <Ionicons name="attach-outline" size={14} color="#8E8E93" />
                <Text style={styles.attachmentCount}>
                  {email.attachments.length}
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
  iconContainer: {
    marginRight: 12
  },
  content: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  subject: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginRight: 8
  },
  date: {
    fontSize: 12,
    color: '#8E8E93'
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  recipients: {
    flex: 1,
    fontSize: 14,
    color: '#3C3C43',
    marginRight: 8
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  scheduledText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4
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
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  attachmentCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4
  },
  moreButton: {
    padding: 8
  },
  rightActions: {
    width: 160,
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
  sendButton: {
    backgroundColor: '#34C759'
  },
  deleteButton: {
    backgroundColor: '#FF3B30'
  }
});

export default EmailItem;

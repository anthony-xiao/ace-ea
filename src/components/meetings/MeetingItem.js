/**
 * MeetingItem Component for Ace Assistant
 * 
 * This component displays a single meeting item with title, time, and action capabilities.
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
 * MeetingItem component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const MeetingItem = ({ 
  meeting,
  onPress,
  onDelete,
  onStart,
  showActions = true,
  style
}) => {
  // Get localization
  const { t, language } = useLocalization();
  
  // Date formatting locale
  const dateLocale = useMemo(() => language === 'zh' ? zhCN : enUS, [language]);
  
  // Format start time
  const formattedStartTime = useMemo(() => {
    if (!meeting.startTime) return '';
    
    const startTime = new Date(meeting.startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if meeting is today
    if (startTime.toDateString() === today.toDateString()) {
      return `${t('meetings.time.today')} ${format(startTime, 'HH:mm')}`;
    }
    
    // Check if meeting is tomorrow
    if (startTime.toDateString() === tomorrow.toDateString()) {
      return `${t('meetings.time.tomorrow')} ${format(startTime, 'HH:mm')}`;
    }
    
    // Format date based on language
    return format(
      startTime, 
      language === 'zh' ? 'MM月dd日 HH:mm' : 'MMM d, HH:mm', 
      { locale: dateLocale }
    );
  }, [meeting.startTime, t, language, dateLocale]);
  
  // Format duration
  const formattedDuration = useMemo(() => {
    if (!meeting.startTime || !meeting.endTime) return '';
    
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    const durationMinutes = Math.round((endTime - startTime) / 60000);
    
    if (durationMinutes < 60) {
      return t('meetings.duration.minutes', { minutes: durationMinutes });
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      if (minutes === 0) {
        return t('meetings.duration.hours', { hours });
      } else {
        return t('meetings.duration.hours_minutes', { hours, minutes });
      }
    }
  }, [meeting.startTime, meeting.endTime, t]);
  
  // Get priority color
  const priorityColor = useMemo(() => {
    switch (meeting.priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  }, [meeting.priority]);
  
  // Get context icon
  const contextIcon = useMemo(() => {
    switch (meeting.context) {
      case 'work':
        return 'briefcase-outline';
      case 'personal':
        return 'person-outline';
      case 'family':
        return 'people-outline';
      default:
        return 'calendar-outline';
    }
  }, [meeting.context]);
  
  // Get status icon and color
  const statusInfo = useMemo(() => {
    switch (meeting.status) {
      case 'scheduled':
        return { icon: 'time-outline', color: '#007AFF' };
      case 'in_progress':
        return { icon: 'play-circle-outline', color: '#34C759' };
      case 'completed':
        return { icon: 'checkmark-circle-outline', color: '#8E8E93' };
      case 'cancelled':
        return { icon: 'close-circle-outline', color: '#FF3B30' };
      default:
        return { icon: 'calendar-outline', color: '#8E8E93' };
    }
  }, [meeting.status]);
  
  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(meeting.id);
    }
  }, [meeting.id, onDelete]);
  
  // Handle start
  const handleStart = useCallback(() => {
    if (onStart && meeting.status === 'scheduled') {
      onStart(meeting.id);
    }
  }, [meeting.id, meeting.status, onStart]);
  
  // Render right actions (swipe actions)
  const renderRightActions = useCallback((progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActions}>
        {meeting.status === 'scheduled' && (
          <Animated.View style={{ transform: [{ translateX: trans }] }}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStart}
            >
              <Ionicons name="play-outline" size={24} color="#FFFFFF" />
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
  }, [meeting.status, handleStart, handleDelete]);
  
  // Format participants
  const participants = useMemo(() => {
    if (!meeting.participants || meeting.participants.length === 0) return '';
    
    if (meeting.participants.length === 1) {
      return meeting.participants[0];
    }
    
    return `${meeting.participants[0]} ${t('meetings.and_others', { count: meeting.participants.length - 1 })}`;
  }, [meeting.participants, t]);
  
  // Determine if meeting has attachments
  const hasAttachments = useMemo(() => {
    return meeting.attachments && meeting.attachments.length > 0;
  }, [meeting.attachments]);
  
  // Determine if meeting is happening now
  const isHappeningNow = useMemo(() => {
    if (meeting.status !== 'scheduled' && meeting.status !== 'in_progress') return false;
    
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    return now >= startTime && now <= endTime;
  }, [meeting.status, meeting.startTime, meeting.endTime]);
  
  // Determine if meeting is upcoming soon (within next hour)
  const isUpcomingSoon = useMemo(() => {
    if (meeting.status !== 'scheduled') return false;
    
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const diffMs = startTime - now;
    const diffMinutes = diffMs / 60000;
    
    return diffMinutes > 0 && diffMinutes <= 60;
  }, [meeting.status, meeting.startTime]);
  
  // Render meeting item
  return (
    <Swipeable
      renderRightActions={showActions ? renderRightActions : null}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={[
          styles.container, 
          isHappeningNow && styles.happeningNowContainer,
          isUpcomingSoon && styles.upcomingSoonContainer,
          style
        ]}
        onPress={() => onPress && onPress(meeting)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text 
              style={styles.title}
              numberOfLines={1}
            >
              {meeting.title}
            </Text>
            <Ionicons name={contextIcon} size={16} color="#8E8E93" />
          </View>
          
          <View style={styles.timeRow}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.time}>{formattedStartTime}</Text>
            </View>
            
            <View style={styles.durationContainer}>
              <Ionicons name="hourglass-outline" size={14} color="#8E8E93" />
              <Text style={styles.duration}>{formattedDuration}</Text>
            </View>
          </View>
          
          {meeting.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#8E8E93" />
              <Text 
                style={styles.location}
                numberOfLines={1}
              >
                {meeting.location}
              </Text>
            </View>
          ) : null}
          
          {participants ? (
            <View style={styles.participantsRow}>
              <Ionicons name="people-outline" size={14} color="#8E8E93" />
              <Text 
                style={styles.participants}
                numberOfLines={1}
              >
                {participants}
              </Text>
            </View>
          ) : null}
          
          <View style={styles.metaRow}>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>
                {t(`meetings.priority.${meeting.priority}`)}
              </Text>
            </View>
            
            {hasAttachments ? (
              <View style={styles.attachmentIndicator}>
                <Ionicons name="attach-outline" size={14} color="#8E8E93" />
                <Text style={styles.attachmentCount}>
                  {meeting.attachments.length}
                </Text>
              </View>
            ) : null}
            
            {isHappeningNow ? (
              <View style={styles.nowIndicator}>
                <Text style={styles.nowText}>{t('meetings.happening_now')}</Text>
              </View>
            ) : isUpcomingSoon ? (
              <View style={styles.soonIndicator}>
                <Text style={styles.soonText}>{t('meetings.starting_soon')}</Text>
              </View>
            ) : null}
          </View>
        </View>
        
        {showActions ? (
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => onPress && onPress(meeting)}
          >
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  happeningNowContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)'
  },
  upcomingSoonContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)'
  },
  statusIndicator: {
    width: 4,
    borderRadius: 2,
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
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  time: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 4
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  duration: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 4
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  location: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 4
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  participants: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
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
    alignItems: 'center',
    marginRight: 12
  },
  attachmentCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4
  },
  nowIndicator: {
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  nowText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500'
  },
  soonIndicator: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  soonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500'
  },
  moreButton: {
    justifyContent: 'center',
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
  startButton: {
    backgroundColor: '#34C759'
  },
  deleteButton: {
    backgroundColor: '#FF3B30'
  }
});

export default MeetingItem;

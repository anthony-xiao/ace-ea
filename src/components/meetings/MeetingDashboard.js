/**
 * MeetingDashboard Component for Ace Assistant
 * 
 * This component provides a dashboard view of meetings with different sections
 * for upcoming, in-progress, and today's meetings.
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
import useMeetings from '../../hooks/useMeetings';
import useLocalization from '../../hooks/useLocalization';
import MeetingItem from './MeetingItem';
import EmptyState from '../common/EmptyState';

/**
 * MeetingDashboard component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const MeetingDashboard = ({ 
  onMeetingPress,
  onCreateMeeting,
  onViewAllMeetings,
  style
}) => {
  // Get meetings and localization
  const { 
    meetings, 
    loading, 
    error,
    refreshMeetings,
    getUpcomingMeetings,
    getTodayMeetings,
    getInProgressMeetings
  } = useMeetings();
  
  const { t } = useLocalization();
  
  // Get meeting sections
  const upcomingMeetings = useMemo(() => getUpcomingMeetings(3), [getUpcomingMeetings]);
  const todayMeetings = useMemo(() => getTodayMeetings(), [getTodayMeetings]);
  const inProgressMeetings = useMemo(() => getInProgressMeetings(), [getInProgressMeetings]);
  
  // Handle meeting press
  const handleMeetingPress = useCallback((meeting) => {
    if (onMeetingPress) {
      onMeetingPress(meeting);
    }
  }, [onMeetingPress]);
  
  // Handle create meeting
  const handleCreateMeeting = useCallback(() => {
    if (onCreateMeeting) {
      onCreateMeeting();
    }
  }, [onCreateMeeting]);
  
  // Handle view all meetings
  const handleViewAllMeetings = useCallback(() => {
    if (onViewAllMeetings) {
      onViewAllMeetings();
    }
  }, [onViewAllMeetings]);
  
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
  
  // Render meeting items
  const renderMeetingItems = useCallback((meetingList, emptyMessage) => {
    if (meetingList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }
    
    return meetingList.map(meeting => (
      <MeetingItem
        key={meeting.id}
        meeting={meeting}
        onPress={() => handleMeetingPress(meeting)}
        showActions={false}
        style={styles.meetingItem}
      />
    ));
  }, [handleMeetingPress]);
  
  // Render loading state
  if (loading && meetings.length === 0) {
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
        <TouchableOpacity style={styles.retryButton} onPress={refreshMeetings}>
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
        <Text style={styles.headerTitle}>{t('meetings.dashboard.title')}</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateMeeting}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* In Progress Meetings Section */}
      {inProgressMeetings.length > 0 && (
        <View style={[styles.section, styles.highlightedSection]}>
          {renderSectionHeader(
            t('meetings.dashboard.in_progress'), 
            inProgressMeetings.length,
            t('common.view_all'),
            handleViewAllMeetings
          )}
          <View style={styles.sectionContent}>
            {renderMeetingItems(
              inProgressMeetings, 
              t('meetings.dashboard.no_in_progress')
            )}
          </View>
        </View>
      )}
      
      {/* Today's Meetings Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('meetings.dashboard.today'), 
          todayMeetings.length,
          t('common.view_all'),
          handleViewAllMeetings
        )}
        <View style={styles.sectionContent}>
          {renderMeetingItems(
            todayMeetings, 
            t('meetings.dashboard.no_today')
          )}
        </View>
      </View>
      
      {/* Upcoming Meetings Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('meetings.dashboard.upcoming'), 
          upcomingMeetings.length,
          t('common.view_all'),
          handleViewAllMeetings
        )}
        <View style={styles.sectionContent}>
          {renderMeetingItems(
            upcomingMeetings, 
            t('meetings.dashboard.no_upcoming')
          )}
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCreateMeeting}
        >
          <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('meetings.dashboard.schedule_meeting')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleViewAllMeetings}
        >
          <Ionicons name="list-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('meetings.dashboard.view_all_meetings')}</Text>
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
  highlightedSection: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.05)'
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
  meetingItem: {
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

export default MeetingDashboard;

/**
 * MeetingList Component for Ace Assistant
 * 
 * This component displays a list of meetings with filtering, sorting, and action capabilities.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useMeetings from '../../hooks/useMeetings';
import useLocalization from '../../hooks/useLocalization';
import MeetingItem from './MeetingItem';
import EmptyState from '../common/EmptyState';
import FilterBar from '../common/FilterBar';
import SortMenu from '../common/SortMenu';

/**
 * MeetingList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const MeetingList = ({ 
  initialFilters = {},
  showHeader = true,
  showActions = true,
  showFilters = true,
  maxItems = null,
  onMeetingPress,
  onCreateMeeting,
  style
}) => {
  // Get meetings and localization
  const { 
    meetings, 
    loading, 
    error,
    filters,
    statuses,
    priorities,
    contexts,
    updateFilters,
    resetFilters,
    refreshMeetings,
    deleteMeeting,
    startMeeting
  } = useMeetings({ defaultFilters: initialFilters });
  
  const { t, language } = useLocalization();
  
  // State
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Filter options
  const filterOptions = useMemo(() => [
    {
      id: 'status',
      label: t('meetings.filters.status'),
      options: [
        { value: null, label: t('common.all') },
        { value: statuses.SCHEDULED, label: t('meetings.status.scheduled') },
        { value: statuses.IN_PROGRESS, label: t('meetings.status.in_progress') },
        { value: statuses.COMPLETED, label: t('meetings.status.completed') },
        { value: statuses.CANCELLED, label: t('meetings.status.cancelled') }
      ]
    },
    {
      id: 'priority',
      label: t('meetings.filters.priority'),
      options: [
        { value: null, label: t('common.all') },
        { value: priorities.HIGH, label: t('meetings.priority.high') },
        { value: priorities.MEDIUM, label: t('meetings.priority.medium') },
        { value: priorities.LOW, label: t('meetings.priority.low') }
      ]
    },
    {
      id: 'context',
      label: t('meetings.filters.context'),
      options: [
        { value: null, label: t('common.all') },
        { value: contexts.WORK, label: t('meetings.context.work') },
        { value: contexts.PERSONAL, label: t('meetings.context.personal') },
        { value: contexts.FAMILY, label: t('meetings.context.family') }
      ]
    }
  ], [t, statuses, priorities, contexts]);
  
  // Sort options
  const sortOptions = useMemo(() => [
    { value: 'startTime', label: t('meetings.sort.start_time') },
    { value: 'duration', label: t('meetings.sort.duration') },
    { value: 'title', label: t('meetings.sort.title') },
    { value: 'priority', label: t('meetings.sort.priority') }
  ], [t]);
  
  // Handle sort change
  const handleSortChange = useCallback((option) => {
    setSortBy(option.value);
  }, []);
  
  // Handle sort direction change
  const handleSortDirectionChange = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);
  
  // Handle filter change
  const handleFilterChange = useCallback((filterId, value) => {
    updateFilters({ [filterId]: value });
  }, [updateFilters]);
  
  // Handle meeting deletion
  const handleMeetingDelete = useCallback(async (meetingId) => {
    try {
      await deleteMeeting(meetingId);
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  }, [deleteMeeting]);
  
  // Handle meeting start
  const handleMeetingStart = useCallback(async (meetingId) => {
    try {
      await startMeeting(meetingId);
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  }, [startMeeting]);
  
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
  
  // Sort meetings
  const sortedMeetings = useMemo(() => {
    if (!meetings) return [];
    
    let sorted = [...meetings];
    
    switch (sortBy) {
      case 'startTime':
        sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      case 'duration':
        sorted.sort((a, b) => {
          const durationA = (new Date(a.endTime) - new Date(a.startTime)) / 60000; // in minutes
          const durationB = (new Date(b.endTime) - new Date(b.startTime)) / 60000; // in minutes
          return durationA - durationB;
        });
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'priority':
        const priorityOrder = { 
          [priorities.HIGH]: 0, 
          [priorities.MEDIUM]: 1, 
          [priorities.LOW]: 2 
        };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      default:
        // Default sort by start time
        sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
    
    // Apply sort direction
    if (sortDirection === 'desc') {
      sorted.reverse();
    }
    
    // Apply max items limit if specified
    if (maxItems && maxItems > 0) {
      sorted = sorted.slice(0, maxItems);
    }
    
    return sorted;
  }, [meetings, sortBy, sortDirection, priorities, maxItems]);
  
  // Render meeting item
  const renderMeetingItem = useCallback(({ item }) => (
    <MeetingItem
      meeting={item}
      onPress={() => handleMeetingPress(item)}
      onDelete={handleMeetingDelete}
      onStart={handleMeetingStart}
      showActions={showActions}
    />
  ), [handleMeetingPress, handleMeetingDelete, handleMeetingStart, showActions]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <EmptyState
      icon="calendar-outline"
      title={t('meetings.empty.title')}
      message={t('meetings.empty.message')}
      actionLabel={t('meetings.empty.action')}
      onAction={handleCreateMeeting}
    />
  ), [t, handleCreateMeeting]);
  
  // Render list header
  const renderHeader = useCallback(() => {
    if (!showHeader) return null;
    
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('meetings.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={refreshMeetings}
          >
            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={handleCreateMeeting}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [showHeader, t, refreshMeetings, handleCreateMeeting]);
  
  // Render filter bar
  const renderFilterBar = useCallback(() => {
    if (!showFilters) return null;
    
    return (
      <View style={styles.filterContainer}>
        <FilterBar
          options={filterOptions}
          selectedValues={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
        <SortMenu
          options={sortOptions}
          selectedValue={sortBy}
          sortDirection={sortDirection}
          onChange={handleSortChange}
          onDirectionChange={handleSortDirectionChange}
        />
      </View>
    );
  }, [
    showFilters, 
    filterOptions, 
    filters, 
    handleFilterChange, 
    resetFilters, 
    sortOptions, 
    sortBy, 
    sortDirection, 
    handleSortChange, 
    handleSortDirectionChange
  ]);
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="large" color="#007AFF" />
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
  
  // Render meeting list
  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {renderFilterBar()}
      <FlatList
        data={sortedMeetings}
        renderItem={renderMeetingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAction: {
    marginLeft: 16
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20
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

export default MeetingList;

/**
 * EmailList Component for Ace Assistant
 * 
 * This component displays a list of emails with filtering, sorting, and action capabilities.
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
import useEmail from '../../hooks/useEmail';
import useLocalization from '../../hooks/useLocalization';
import EmailItem from './EmailItem';
import EmptyState from '../common/EmptyState';
import FilterBar from '../common/FilterBar';
import SortMenu from '../common/SortMenu';

/**
 * EmailList component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EmailList = ({ 
  initialFilters = {},
  showHeader = true,
  showActions = true,
  showFilters = true,
  maxItems = null,
  onEmailPress,
  onCreateEmail,
  style
}) => {
  // Get emails and localization
  const { 
    emails, 
    loading, 
    error,
    filters,
    statuses,
    priorities,
    contexts,
    updateFilters,
    resetFilters,
    refreshEmails,
    deleteEmail,
    sendEmail
  } = useEmail({ defaultFilters: initialFilters });
  
  const { t, language } = useLocalization();
  
  // State
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Filter options
  const filterOptions = useMemo(() => [
    {
      id: 'status',
      label: t('emails.filters.status'),
      options: [
        { value: null, label: t('common.all') },
        { value: statuses.DRAFT, label: t('emails.status.draft') },
        { value: statuses.SENT, label: t('emails.status.sent') },
        { value: statuses.RECEIVED, label: t('emails.status.received') },
        { value: statuses.ARCHIVED, label: t('emails.status.archived') }
      ]
    },
    {
      id: 'priority',
      label: t('emails.filters.priority'),
      options: [
        { value: null, label: t('common.all') },
        { value: priorities.HIGH, label: t('emails.priority.high') },
        { value: priorities.MEDIUM, label: t('emails.priority.medium') },
        { value: priorities.LOW, label: t('emails.priority.low') }
      ]
    },
    {
      id: 'context',
      label: t('emails.filters.context'),
      options: [
        { value: null, label: t('common.all') },
        { value: contexts.WORK, label: t('emails.context.work') },
        { value: contexts.PERSONAL, label: t('emails.context.personal') },
        { value: contexts.FAMILY, label: t('emails.context.family') }
      ]
    }
  ], [t, statuses, priorities, contexts]);
  
  // Sort options
  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: t('emails.sort.date') },
    { value: 'subject', label: t('emails.sort.subject') },
    { value: 'priority', label: t('emails.sort.priority') }
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
  
  // Handle email deletion
  const handleEmailDelete = useCallback(async (emailId) => {
    try {
      await deleteEmail(emailId);
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  }, [deleteEmail]);
  
  // Handle email send
  const handleEmailSend = useCallback(async (emailId) => {
    try {
      await sendEmail(emailId);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }, [sendEmail]);
  
  // Handle email press
  const handleEmailPress = useCallback((email) => {
    if (onEmailPress) {
      onEmailPress(email);
    }
  }, [onEmailPress]);
  
  // Handle create email
  const handleCreateEmail = useCallback(() => {
    if (onCreateEmail) {
      onCreateEmail();
    }
  }, [onCreateEmail]);
  
  // Sort emails
  const sortedEmails = useMemo(() => {
    if (!emails) return [];
    
    let sorted = [...emails];
    
    switch (sortBy) {
      case 'createdAt':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'subject':
        sorted.sort((a, b) => a.subject.localeCompare(b.subject));
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
        // Default sort by date
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
  }, [emails, sortBy, sortDirection, priorities, maxItems]);
  
  // Render email item
  const renderEmailItem = useCallback(({ item }) => (
    <EmailItem
      email={item}
      onPress={() => handleEmailPress(item)}
      onDelete={handleEmailDelete}
      onSend={handleEmailSend}
      showActions={showActions}
    />
  ), [handleEmailPress, handleEmailDelete, handleEmailSend, showActions]);
  
  // Render empty state
  const renderEmptyState = useCallback(() => (
    <EmptyState
      icon="mail-outline"
      title={t('emails.empty.title')}
      message={t('emails.empty.message')}
      actionLabel={t('emails.empty.action')}
      onAction={handleCreateEmail}
    />
  ), [t, handleCreateEmail]);
  
  // Render list header
  const renderHeader = useCallback(() => {
    if (!showHeader) return null;
    
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('emails.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={refreshEmails}
          >
            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={handleCreateEmail}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [showHeader, t, refreshEmails, handleCreateEmail]);
  
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
        <TouchableOpacity style={styles.retryButton} onPress={refreshEmails}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Render email list
  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {renderFilterBar()}
      <FlatList
        data={sortedEmails}
        renderItem={renderEmailItem}
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

export default EmailList;

/**
 * EmailDashboard Component for Ace Assistant
 * 
 * This component provides a dashboard view of emails with different sections
 * for drafts, received, and important emails.
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
import useEmail from '../../hooks/useEmail';
import useLocalization from '../../hooks/useLocalization';
import EmailItem from './EmailItem';
import EmptyState from '../common/EmptyState';

/**
 * EmailDashboard component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EmailDashboard = ({ 
  onEmailPress,
  onCreateEmail,
  onViewAllEmails,
  style
}) => {
  // Get emails and localization
  const { 
    emails, 
    loading, 
    error,
    priorities,
    refreshEmails,
    getDraftEmails,
    getReceivedEmails,
    getEmailsByPriority
  } = useEmail();
  
  const { t } = useLocalization();
  
  // Get email sections
  const draftEmails = useMemo(() => getDraftEmails().slice(0, 3), [getDraftEmails]);
  const receivedEmails = useMemo(() => getReceivedEmails().slice(0, 3), [getReceivedEmails]);
  const importantEmails = useMemo(() => 
    getEmailsByPriority(priorities.HIGH).slice(0, 3), 
    [getEmailsByPriority, priorities.HIGH]
  );
  
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
  
  // Handle view all emails
  const handleViewAllEmails = useCallback(() => {
    if (onViewAllEmails) {
      onViewAllEmails();
    }
  }, [onViewAllEmails]);
  
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
  
  // Render email items
  const renderEmailItems = useCallback((emailList, emptyMessage) => {
    if (emailList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }
    
    return emailList.map(email => (
      <EmailItem
        key={email.id}
        email={email}
        onPress={() => handleEmailPress(email)}
        showActions={false}
        style={styles.emailItem}
      />
    ));
  }, [handleEmailPress]);
  
  // Render loading state
  if (loading && emails.length === 0) {
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
        <TouchableOpacity style={styles.retryButton} onPress={refreshEmails}>
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
        <Text style={styles.headerTitle}>{t('emails.dashboard.title')}</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateEmail}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Important Emails Section */}
      {importantEmails.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader(
            t('emails.dashboard.important'), 
            importantEmails.length,
            t('common.view_all'),
            handleViewAllEmails
          )}
          <View style={styles.sectionContent}>
            {renderEmailItems(
              importantEmails, 
              t('emails.dashboard.no_important')
            )}
          </View>
        </View>
      )}
      
      {/* Received Emails Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('emails.dashboard.received'), 
          receivedEmails.length,
          t('common.view_all'),
          handleViewAllEmails
        )}
        <View style={styles.sectionContent}>
          {renderEmailItems(
            receivedEmails, 
            t('emails.dashboard.no_received')
          )}
        </View>
      </View>
      
      {/* Draft Emails Section */}
      <View style={styles.section}>
        {renderSectionHeader(
          t('emails.dashboard.drafts'), 
          draftEmails.length,
          t('common.view_all'),
          handleViewAllEmails
        )}
        <View style={styles.sectionContent}>
          {renderEmailItems(
            draftEmails, 
            t('emails.dashboard.no_drafts')
          )}
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleCreateEmail}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('emails.dashboard.compose_email')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleViewAllEmails}
        >
          <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
          <Text style={styles.quickActionText}>{t('emails.dashboard.view_all_emails')}</Text>
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
  emailItem: {
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

export default EmailDashboard;

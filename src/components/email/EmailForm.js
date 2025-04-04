/**
 * EmailForm Component for Ace Assistant
 * 
 * This component provides a form for creating and editing emails.
 * It supports both English and Chinese languages.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import useEmail from '../../hooks/useEmail';
import useLocalization from '../../hooks/useLocalization';
import Button from '../common/Button';
import SegmentedControl from '../common/SegmentedControl';
import RecipientList from './RecipientList';
import AttachmentList from './AttachmentList';

/**
 * EmailForm component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const EmailForm = ({ 
  email = null,
  onSave,
  onCancel,
  onSend,
  style
}) => {
  // Get emails and localization
  const { 
    statuses,
    priorities,
    contexts,
    createEmail,
    updateEmail,
    sendEmail
  } = useEmail();
  
  const { t, language } = useLocalization();
  
  // Form state
  const [subject, setSubject] = useState(email ? email.subject : '');
  const [body, setBody] = useState(email ? email.body : '');
  const [to, setTo] = useState(email && email.to ? [...email.to] : []);
  const [cc, setCc] = useState(email && email.cc ? [...email.cc] : []);
  const [bcc, setBcc] = useState(email && email.bcc ? [...email.bcc] : []);
  const [from, setFrom] = useState(email ? email.from : 'user@example.com');
  const [priority, setPriority] = useState(email ? email.priority : priorities.MEDIUM);
  const [context, setContext] = useState(email ? email.context : contexts.WORK);
  const [scheduledDate, setScheduledDate] = useState(email && email.scheduledDate ? new Date(email.scheduledDate) : null);
  const [isScheduled, setIsScheduled] = useState(email && email.scheduledDate ? true : false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachments, setAttachments] = useState(email && email.attachments ? [...email.attachments] : []);
  const [createReminder, setCreateReminder] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Priority options
  const priorityOptions = [
    { value: priorities.HIGH, label: t('emails.priority.high') },
    { value: priorities.MEDIUM, label: t('emails.priority.medium') },
    { value: priorities.LOW, label: t('emails.priority.low') }
  ];
  
  // Context options
  const contextOptions = [
    { value: contexts.WORK, label: t('emails.context.work') },
    { value: contexts.PERSONAL, label: t('emails.context.personal') },
    { value: contexts.FAMILY, label: t('emails.context.family') }
  ];
  
  // Handle date change
  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  }, []);
  
  // Handle scheduled toggle
  const handleScheduledToggle = useCallback((value) => {
    setIsScheduled(value);
    
    if (value && !scheduledDate) {
      // Set default scheduled date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setScheduledDate(tomorrow);
    }
  }, [scheduledDate]);
  
  // Handle add recipient
  const handleAddRecipient = useCallback((type, email) => {
    if (!email.trim() || !email.includes('@')) return;
    
    switch (type) {
      case 'to':
        setTo(prev => [...prev, email]);
        break;
      case 'cc':
        setCc(prev => [...prev, email]);
        break;
      case 'bcc':
        setBcc(prev => [...prev, email]);
        break;
    }
  }, []);
  
  // Handle remove recipient
  const handleRemoveRecipient = useCallback((type, index) => {
    switch (type) {
      case 'to':
        setTo(prev => prev.filter((_, i) => i !== index));
        break;
      case 'cc':
        setCc(prev => prev.filter((_, i) => i !== index));
        break;
      case 'bcc':
        setBcc(prev => prev.filter((_, i) => i !== index));
        break;
    }
  }, []);
  
  // Handle add attachment
  const handleAddAttachment = useCallback((attachment) => {
    if (!attachment.name || !attachment.uri) return;
    
    const newAttachment = {
      id: Date.now().toString(),
      name: attachment.name,
      uri: attachment.uri,
      type: attachment.type || 'application/octet-stream',
      size: attachment.size || 0,
      addedAt: new Date().toISOString()
    };
    
    setAttachments(prev => [...prev, newAttachment]);
  }, []);
  
  // Handle remove attachment
  const handleRemoveAttachment = useCallback((attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);
  
  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // Validate form
      if (!subject.trim()) {
        setError(t('emails.form.error.subject_required'));
        return;
      }
      
      if (to.length === 0) {
        setError(t('emails.form.error.recipient_required'));
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Prepare email data
      const emailData = {
        subject,
        body,
        to,
        cc,
        bcc,
        from,
        priority,
        context,
        scheduledDate: isScheduled ? scheduledDate.toISOString() : null,
        attachments,
        createReminder: isScheduled ? createReminder : false,
        language
      };
      
      let savedEmail;
      
      if (email) {
        // Update existing email
        savedEmail = await updateEmail(email.id, emailData);
      } else {
        // Create new email
        savedEmail = await createEmail(emailData);
      }
      
      setLoading(false);
      
      // Call onSave callback
      if (onSave) {
        onSave(savedEmail);
      }
    } catch (err) {
      console.error('Error saving email:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [
    subject, 
    body, 
    to, 
    cc, 
    bcc, 
    from, 
    priority, 
    context, 
    isScheduled, 
    scheduledDate, 
    attachments, 
    createReminder, 
    language, 
    email, 
    updateEmail, 
    createEmail, 
    onSave,
    t
  ]);
  
  // Handle send
  const handleSend = useCallback(async () => {
    try {
      // Validate form
      if (!subject.trim()) {
        setError(t('emails.form.error.subject_required'));
        return;
      }
      
      if (to.length === 0) {
        setError(t('emails.form.error.recipient_required'));
        return;
      }
      
      setLoading(true);
      setError(null);
      
      let emailId;
      
      if (email) {
        // Update existing email first
        const updatedEmail = await updateEmail(email.id, {
          subject,
          body,
          to,
          cc,
          bcc,
          from,
          priority,
          context,
          scheduledDate: isScheduled ? scheduledDate.toISOString() : null,
          attachments,
          language
        });
        
        emailId = updatedEmail.id;
      } else {
        // Create new email first
        const newEmail = await createEmail({
          subject,
          body,
          to,
          cc,
          bcc,
          from,
          priority,
          context,
          scheduledDate: isScheduled ? scheduledDate.toISOString() : null,
          attachments,
          language
        });
        
        emailId = newEmail.id;
      }
      
      // Send the email
      const sentEmail = await sendEmail(emailId);
      
      setLoading(false);
      
      // Call onSend callback
      if (onSend) {
        onSend(sentEmail);
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [
    subject, 
    body, 
    to, 
    cc, 
    bcc, 
    from, 
    priority, 
    context, 
    isScheduled, 
    scheduledDate, 
    attachments, 
    language, 
    email, 
    updateEmail, 
    createEmail, 
    sendEmail,
    onSend,
    t
  ]);
  
  // Render date picker
  const renderDatePicker = useCallback(() => {
    if (!isScheduled) return null;
    
    return (
      <View style={styles.datePickerContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <Text style={styles.datePickerButtonText}>
            {scheduledDate ? scheduledDate.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US') : t('emails.form.select_date')}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate || new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderLabel}>{t('emails.form.create_reminder')}</Text>
          <Switch
            value={createReminder}
            onValueChange={setCreateReminder}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : createReminder ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
      </View>
    );
  }, [isScheduled, scheduledDate, showDatePicker, handleDateChange, createReminder, language, t]);
  
  // Render form
  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {email ? t('emails.form.edit_title') : t('emails.form.create_title')}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onCancel}
        >
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.from')}</Text>
        <TextInput
          style={styles.input}
          value={from}
          onChangeText={setFrom}
          placeholder={t('emails.form.from_placeholder')}
          placeholderTextColor="#C7C7CC"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.to')}</Text>
        <RecipientList
          type="to"
          recipients={to}
          onAdd={(email) => handleAddRecipient('to', email)}
          onRemove={(index) => handleRemoveRecipient('to', index)}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.cc')}</Text>
        <RecipientList
          type="cc"
          recipients={cc}
          onAdd={(email) => handleAddRecipient('cc', email)}
          onRemove={(index) => handleRemoveRecipient('cc', index)}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.bcc')}</Text>
        <RecipientList
          type="bcc"
          recipients={bcc}
          onAdd={(email) => handleAddRecipient('bcc', email)}
          onRemove={(index) => handleRemoveRecipient('bcc', index)}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.subject')}</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder={t('emails.form.subject_placeholder')}
          placeholderTextColor="#C7C7CC"
          autoCapitalize="sentences"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.body')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={body}
          onChangeText={setBody}
          placeholder={t('emails.form.body_placeholder')}
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.priority')}</Text>
        <SegmentedControl
          options={priorityOptions}
          selectedValue={priority}
          onChange={setPriority}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.context')}</Text>
        <SegmentedControl
          options={contextOptions}
          selectedValue={context}
          onChange={setContext}
        />
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.scheduledHeader}>
          <Text style={styles.label}>{t('emails.form.scheduled')}</Text>
          <Switch
            value={isScheduled}
            onValueChange={handleScheduledToggle}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isScheduled ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
        {renderDatePicker()}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('emails.form.attachments')}</Text>
        <AttachmentList
          attachments={attachments}
          onAdd={handleAddAttachment}
          onRemove={handleRemoveAttachment}
        />
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      <View style={styles.buttonContainer}>
        <Button
          title={t('emails.form.send')}
          onPress={handleSend}
          loading={loading}
          disabled={!subject.trim() || to.length === 0 || loading}
          primary
          style={styles.sendButton}
        />
        <Button
          title={t('emails.form.save_draft')}
          onPress={handleSave}
          loading={loading}
          disabled={!subject.trim() || loading}
          style={styles.saveButton}
        />
        <Button
          title={t('common.cancel')}
          onPress={onCancel}
          disabled={loading}
          style={styles.cancelButton}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000'
  },
  closeButton: {
    padding: 4
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F9F9F9'
  },
  textArea: {
    minHeight: 150,
    paddingTop: 12
  },
  scheduledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  datePickerContainer: {
    marginTop: 8
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9'
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  reminderLabel: {
    fontSize: 16,
    color: '#000000'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  sendButton: {
    flex: 1,
    marginRight: 8
  },
  saveButton: {
    flex: 1,
    marginHorizontal: 8
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8
  }
});

export default EmailForm;

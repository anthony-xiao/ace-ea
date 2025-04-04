/**
 * MeetingForm Component for Ace Assistant
 * 
 * This component provides a form for creating and editing meetings.
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
import useMeetings from '../../hooks/useMeetings';
import useLocalization from '../../hooks/useLocalization';
import Button from '../common/Button';
import SegmentedControl from '../common/SegmentedControl';
import ParticipantList from './ParticipantList';
import AttachmentList from '../email/AttachmentList';

/**
 * MeetingForm component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const MeetingForm = ({ 
  meeting = null,
  onSave,
  onCancel,
  onStart,
  style
}) => {
  // Get meetings and localization
  const { 
    statuses,
    priorities,
    contexts,
    createMeeting,
    updateMeeting,
    startMeeting
  } = useMeetings();
  
  const { t, language } = useLocalization();
  
  // Form state
  const [title, setTitle] = useState(meeting ? meeting.title : '');
  const [description, setDescription] = useState(meeting ? meeting.description : '');
  const [location, setLocation] = useState(meeting ? meeting.location : '');
  const [startTime, setStartTime] = useState(meeting && meeting.startTime ? new Date(meeting.startTime) : new Date());
  const [endTime, setEndTime] = useState(meeting && meeting.endTime ? new Date(meeting.endTime) : new Date(Date.now() + 60 * 60 * 1000)); // Default 1 hour
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [participants, setParticipants] = useState(meeting && meeting.participants ? [...meeting.participants] : []);
  const [priority, setPriority] = useState(meeting ? meeting.priority : priorities.MEDIUM);
  const [context, setContext] = useState(meeting ? meeting.context : contexts.WORK);
  const [attachments, setAttachments] = useState(meeting && meeting.attachments ? [...meeting.attachments] : []);
  const [createReminder, setCreateReminder] = useState(true);
  const [isOnline, setIsOnline] = useState(meeting ? meeting.isOnline : false);
  const [meetingLink, setMeetingLink] = useState(meeting ? meeting.meetingLink : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Priority options
  const priorityOptions = [
    { value: priorities.HIGH, label: t('meetings.priority.high') },
    { value: priorities.MEDIUM, label: t('meetings.priority.medium') },
    { value: priorities.LOW, label: t('meetings.priority.low') }
  ];
  
  // Context options
  const contextOptions = [
    { value: contexts.WORK, label: t('meetings.context.work') },
    { value: contexts.PERSONAL, label: t('meetings.context.personal') },
    { value: contexts.FAMILY, label: t('meetings.context.family') }
  ];
  
  // Handle start time change
  const handleStartTimeChange = useCallback((event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setStartTime(selectedDate);
      
      // Ensure end time is after start time
      if (selectedDate >= endTime) {
        const newEndTime = new Date(selectedDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        setEndTime(newEndTime);
      }
    }
  }, [endTime]);
  
  // Handle end time change
  const handleEndTimeChange = useCallback((event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      // Ensure end time is after start time
      if (selectedDate > startTime) {
        setEndTime(selectedDate);
      } else {
        setError(t('meetings.form.error.end_time_before_start'));
      }
    }
  }, [startTime, t]);
  
  // Handle add participant
  const handleAddParticipant = useCallback((participant) => {
    if (!participant.trim()) return;
    
    setParticipants(prev => [...prev, participant]);
  }, []);
  
  // Handle remove participant
  const handleRemoveParticipant = useCallback((index) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
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
  
  // Handle online toggle
  const handleOnlineToggle = useCallback((value) => {
    setIsOnline(value);
    
    if (!value) {
      setMeetingLink('');
    }
  }, []);
  
  // Handle generate meeting link
  const handleGenerateMeetingLink = useCallback(() => {
    // Generate a Google Meet link
    const meetId = Math.random().toString(36).substring(2, 10);
    setMeetingLink(`https://meet.google.com/${meetId}`);
  }, []);
  
  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // Validate form
      if (!title.trim()) {
        setError(t('meetings.form.error.title_required'));
        return;
      }
      
      if (endTime <= startTime) {
        setError(t('meetings.form.error.end_time_before_start'));
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Prepare meeting data
      const meetingData = {
        title,
        description,
        location,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        participants,
        priority,
        context,
        attachments,
        createReminder,
        isOnline,
        meetingLink: isOnline ? meetingLink : '',
        language
      };
      
      let savedMeeting;
      
      if (meeting) {
        // Update existing meeting
        savedMeeting = await updateMeeting(meeting.id, meetingData);
      } else {
        // Create new meeting
        savedMeeting = await createMeeting(meetingData);
      }
      
      setLoading(false);
      
      // Call onSave callback
      if (onSave) {
        onSave(savedMeeting);
      }
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [
    title, 
    description, 
    location, 
    startTime, 
    endTime, 
    participants, 
    priority, 
    context, 
    attachments, 
    createReminder, 
    isOnline, 
    meetingLink, 
    language, 
    meeting, 
    updateMeeting, 
    createMeeting, 
    onSave,
    t
  ]);
  
  // Handle start meeting
  const handleStartMeeting = useCallback(async () => {
    try {
      if (!meeting) {
        // Save meeting first
        await handleSave();
      }
      
      if (meeting) {
        setLoading(true);
        setError(null);
        
        const startedMeeting = await startMeeting(meeting.id);
        
        setLoading(false);
        
        // Call onStart callback
        if (onStart) {
          onStart(startedMeeting);
        }
      }
    } catch (err) {
      console.error('Error starting meeting:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [meeting, handleSave, startMeeting, onStart]);
  
  // Render form
  return (
    <ScrollView 
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {meeting ? t('meetings.form.edit_title') : t('meetings.form.create_title')}
        </Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onCancel}
        >
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.title')}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t('meetings.form.title_placeholder')}
          placeholderTextColor="#C7C7CC"
          autoCapitalize="sentences"
          autoFocus
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('meetings.form.description_placeholder')}
          placeholderTextColor="#C7C7CC"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.onlineHeader}>
          <Text style={styles.label}>{t('meetings.form.online_meeting')}</Text>
          <Switch
            value={isOnline}
            onValueChange={handleOnlineToggle}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isOnline ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
        
        {isOnline ? (
          <View style={styles.onlineContainer}>
            <TextInput
              style={styles.input}
              value={meetingLink}
              onChangeText={setMeetingLink}
              placeholder={t('meetings.form.meeting_link_placeholder')}
              placeholderTextColor="#C7C7CC"
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity 
              style={styles.generateLinkButton}
              onPress={handleGenerateMeetingLink}
            >
              <Text style={styles.generateLinkText}>{t('meetings.form.generate_link')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('meetings.form.location')}</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder={t('meetings.form.location_placeholder')}
              placeholderTextColor="#C7C7CC"
              autoCapitalize="sentences"
            />
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.time')}</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timeLabel}>{t('meetings.form.start_time')}</Text>
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <Text style={styles.timePickerButtonText}>
                {startTime ? startTime.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US') : t('meetings.form.select_time')}
              </Text>
            </TouchableOpacity>
            
            {showStartPicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartTimeChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.timePickerContainer}>
            <Text style={styles.timeLabel}>{t('meetings.form.end_time')}</Text>
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <Text style={styles.timePickerButtonText}>
                {endTime ? endTime.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US') : t('meetings.form.select_time')}
              </Text>
            </TouchableOpacity>
            
            {showEndPicker && (
              <DateTimePicker
                value={endTime || new Date(Date.now() + 60 * 60 * 1000)}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndTimeChange}
                minimumDate={startTime}
              />
            )}
          </View>
        </View>
        
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderLabel}>{t('meetings.form.create_reminder')}</Text>
          <Switch
            value={createReminder}
            onValueChange={setCreateReminder}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : createReminder ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#D1D1D6"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.participants')}</Text>
        <ParticipantList
          participants={participants}
          onAdd={handleAddParticipant}
          onRemove={handleRemoveParticipant}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.priority')}</Text>
        <SegmentedControl
          options={priorityOptions}
          selectedValue={priority}
          onChange={setPriority}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.context')}</Text>
        <SegmentedControl
          options={contextOptions}
          selectedValue={context}
          onChange={setContext}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('meetings.form.attachments')}</Text>
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
        {meeting && meeting.status === 'scheduled' ? (
          <Button
            title={t('meetings.form.start_meeting')}
            onPress={handleStartMeeting}
            loading={loading}
            disabled={loading}
            primary
            style={styles.startButton}
          />
        ) : null}
        
        <Button
          title={meeting ? t('common.update') : t('common.create')}
          onPress={handleSave}
          loading={loading}
          disabled={!title.trim() || loading}
          primary={!meeting || meeting.status !== 'scheduled'}
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
    minHeight: 100,
    paddingTop: 12
  },
  onlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  onlineContainer: {
    marginBottom: 16
  },
  generateLinkButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8
  },
  generateLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF'
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  timePickerContainer: {
    flex: 1,
    marginHorizontal: 4
  },
  timeLabel: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 4
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9'
  },
  timePickerButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
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
  startButton: {
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

export default MeetingForm;

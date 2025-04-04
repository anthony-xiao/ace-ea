// Mac Dashboard Panel Mockup
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import Card from '../../../components/common/Card';
import TaskItem from '../../../components/tasks/TaskItem';
import EmailItem from '../../../components/email/EmailItem';
import MeetingItem from '../../../components/meetings/MeetingItem';
import Button from '../../../components/common/Button';

const MacDashboardPanel = () => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate dates for the week view
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -1; i < 6; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = getDates();
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };
  
  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.profileImage} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <View style={styles.calendarHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Calendar</Text>
            <View style={styles.dateSelector}>
              {dates.map((date, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dateItem,
                    isToday(date) && { backgroundColor: theme.primary },
                    date.getTime() === selectedDate.getTime() && { borderColor: theme.primary }
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dateDay, 
                    { color: isToday(date) ? '#FFFFFF' : theme.text }
                  ]}>
                    {formatDate(date)}
                  </Text>
                  <Text style={[
                    styles.dateNumber, 
                    { color: isToday(date) ? '#FFFFFF' : theme.text }
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <ScrollView style={styles.meetingsContainer}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>9:00 AM</Text>
            <MeetingItem 
              title="Team Stand-up"
              startTime="9:00 AM"
              endTime="9:30 AM"
              location="Conference Room B"
              participants={[
                { id: '1', name: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
                { id: '2', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
                { id: '3', name: 'Michael Brown', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
                { id: '4', name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
              ]}
              isOnline={false}
            />
            
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>10:00 AM</Text>
            <MeetingItem 
              title="Product Team Sync"
              startTime="10:00 AM"
              endTime="11:00 AM"
              location="Conference Room A"
              participants={[
                { id: '1', name: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
                { id: '2', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
                { id: '3', name: 'Michael Brown', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' }
              ]}
              isOnline={false}
            />
            
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>12:00 PM</Text>
            <MeetingItem 
              title="Lunch with Investors"
              startTime="12:00 PM"
              endTime="1:30 PM"
              location="Bistro on Main"
              participants={[
                { id: '5', name: 'David Wilson', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
                { id: '6', name: 'Jennifer Lee', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' }
              ]}
              isOnline={false}
            />
            
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>2:00 PM</Text>
            <MeetingItem 
              title="Client Presentation"
              startTime="2:00 PM"
              endTime="3:30 PM"
              location="Google Meet"
              participants={[
                { id: '4', name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
                { id: '5', name: 'David Wilson', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' }
              ]}
              isOnline={true}
            />
            
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>4:00 PM</Text>
            <MeetingItem 
              title="Marketing Strategy Review"
              startTime="4:00 PM"
              endTime="5:00 PM"
              location="Conference Room C"
              participants={[
                { id: '7', name: 'Robert Taylor', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
                { id: '8', name: 'Amanda White', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' }
              ]}
              isOnline={false}
            />
          </ScrollView>
        </View>
        
        <View style={styles.rightPanel}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>High Priority Tasks</Text>
              <Button 
                title="Add Task" 
                icon="add-outline" 
                size="small" 
                variant="outline"
              />
            </View>
            
            <Card variant="outlined" style={styles.tasksCard}>
              <ScrollView style={styles.tasksList}>
                <TaskItem 
                  title="Finalize Q2 Budget Report"
                  dueDate="Today"
                  priority="high"
                  completed={false}
                  progress={75}
                />
                
                <TaskItem 
                  title="Prepare for Board Meeting"
                  dueDate="Tomorrow"
                  priority="high"
                  completed={false}
                  progress={30}
                />
                
                <TaskItem 
                  title="Review Marketing Campaign"
                  dueDate="Apr 6"
                  priority="high"
                  completed={false}
                  progress={10}
                />
                
                <TaskItem 
                  title="Quarterly Team Performance Reviews"
                  dueDate="Apr 8"
                  priority="high"
                  completed={false}
                  progress={0}
                />
              </ScrollView>
            </Card>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Emails</Text>
              <Button 
                title="Compose" 
                icon="create-outline" 
                size="small" 
                variant="outline"
              />
            </View>
            
            <Card variant="outlined" style={styles.emailsCard}>
              <ScrollView style={styles.emailsList}>
                <EmailItem 
                  sender="Sarah Johnson"
                  senderEmail="sarah.johnson@example.com"
                  subject="Updated Project Timeline"
                  preview="Hi Alex, I've updated the project timeline based on our discussion yesterday. Please review and let me know if you have any questions."
                  time="9:45 AM"
                  isUnread={true}
                  hasAttachment={true}
                />
                
                <EmailItem 
                  sender="Michael Brown"
                  senderEmail="michael.brown@example.com"
                  subject="Q2 Budget Approval"
                  preview="Alex, I need your approval on the Q2 budget by EOD. I've attached the final version for your review."
                  time="Yesterday"
                  isUnread={true}
                  hasAttachment={true}
                />
                
                <EmailItem 
                  sender="Emily Davis"
                  senderEmail="emily.davis@example.com"
                  subject="Client Meeting Agenda"
                  preview="Here's the agenda for our client meeting tomorrow. Please let me know if you'd like to add anything else."
                  time="Yesterday"
                  isUnread={false}
                  hasAttachment={false}
                />
              </ScrollView>
            </Card>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Voice Commands</Text>
            </View>
            
            <Card 
              title="Recent Commands" 
              icon="mic-outline"
              iconColor={theme.primary}
              variant="outlined" 
              style={styles.commandsCard}
            >
              <View style={styles.commandsList}>
                <View style={styles.commandItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.secondary} />
                  <Text style={[styles.commandText, { color: theme.text }]}>
                    "Schedule a meeting with the design team tomorrow at 10am"
                  </Text>
                </View>
                
                <View style={styles.commandItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.secondary} />
                  <Text style={[styles.commandText, { color: theme.text }]}>
                    "Create a high priority task to review the marketing plan"
                  </Text>
                </View>
                
                <View style={styles.commandItem}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.secondary} />
                  <Text style={[styles.commandText, { color: theme.text }]}>
                    "Send an email to Sarah about the project timeline"
                  </Text>
                </View>
              </View>
              
              <Button 
                title="New Voice Command" 
                icon="mic-outline" 
                variant="primary"
                fullWidth={true}
                style={styles.voiceButton}
              />
            </Card>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  rightPanel: {
    flex: 2,
    padding: 16,
  },
  calendarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dateItem: {
    width: 48,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  meetingsContainer: {
    flex: 1,
    padding: 16,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tasksCard: {
    height: 280,
  },
  tasksList: {
    flex: 1,
  },
  emailsCard: {
    height: 280,
  },
  emailsList: {
    flex: 1,
  },
  commandsCard: {
    height: 200,
  },
  commandsList: {
    marginBottom: 16,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commandText: {
    fontSize: 14,
    marginLeft: 8,
  },
  voiceButton: {
    marginTop: 8,
  },
});

export default MacDashboardPanel;

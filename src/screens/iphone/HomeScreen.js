// iPhone Home Screen Mockup
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import Card from '../common/Card';
import TaskItem from '../tasks/TaskItem';
import EmailItem from '../email/EmailItem';
import MeetingItem from '../meetings/MeetingItem';
import VoiceCommandBar from '../voice/BilingualVoiceCommandBar';

const HomeScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>Good morning, Alex</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today</Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>Friday, April 4</Text>
          
          <Card 
            title="Daily Summary" 
            icon="calendar-outline"
            variant="elevated"
            style={styles.summaryCard}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryCount, { color: theme.text }]}>5</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tasks</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
                  <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryCount, { color: theme.text }]}>3</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Emails</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={[styles.iconCircle, { backgroundColor: theme.secondary }]}>
                  <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.summaryTextContainer}>
                  <Text style={[styles.summaryCount, { color: theme.text }]}>2</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Meetings</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
        
        {/* Upcoming Meetings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Meetings</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
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
        </View>
        
        {/* High Priority Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>High Priority Tasks</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
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
        </View>
        
        {/* Recent Emails */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Emails</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
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
        </View>
      </ScrollView>
      
      <VoiceCommandBar />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  date: {
    fontSize: 14,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
  },
  summaryCard: {
    marginTop: 8,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  summaryTextContainer: {
    
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
  },
});

export default HomeScreen;

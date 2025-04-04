/**
 * VoiceCommandIntegration Hook for Ace Assistant
 * 
 * This hook integrates the voice command processor with the Ace core
 * to enable voice control of organization features.
 */

import { useCallback } from 'react';
import { useAce } from '../../core/providers/AceProvider';
import useVoiceCommands from '../../hooks/useVoiceCommands';
import useTasks from '../../hooks/useTasks';
import useEmail from '../../hooks/useEmail';
import useMeetings from '../../hooks/useMeetings';
import useReminders from '../../hooks/useReminders';
import useLocalization from '../../hooks/useLocalization';
import voiceCommandProcessor from '../voice/VoiceCommandProcessor';

/**
 * Hook for integrating voice commands with organization services
 * @returns {Object} Voice command integration utilities
 */
const useVoiceCommandIntegration = () => {
  // Get Ace context and hooks
  const ace = useAce();
  const { t, language } = useLocalization();
  const voiceCommands = useVoiceCommands();
  const tasks = useTasks();
  const email = useEmail();
  const meetings = useMeetings();
  const reminders = useReminders();
  
  // Process organization command
  const processOrganizationCommand = useCallback(async (command, commandLanguage) => {
    try {
      // Create services object to pass to processor
      const services = {
        tasks,
        email,
        meetings,
        reminders
      };
      
      // Process the command
      const result = await voiceCommandProcessor.processCommand(
        command, 
        commandLanguage || language, 
        services, 
        t
      );
      
      return result;
    } catch (error) {
      console.error('Error processing organization command:', error);
      return {
        success: false,
        error: error.message,
        response: t('voice.command_error')
      };
    }
  }, [tasks, email, meetings, reminders, language, t]);
  
  // Initialize integration
  const initialize = useCallback(async () => {
    try {
      // Override the Ace core's processVoiceCommand method to integrate with our processor
      const originalProcessVoiceCommand = ace.processVoiceCommand;
      
      ace.processVoiceCommand = async (voiceText, detectedLanguage) => {
        try {
          console.log(`Processing voice command with integration: "${voiceText}"`);
          
          // First try to process as an organization command
          const orgResult = await processOrganizationCommand(voiceText, detectedLanguage);
          
          // If successful, return the result
          if (orgResult.success) {
            return {
              success: true,
              originalCommand: voiceText,
              language: detectedLanguage,
              response: orgResult.response,
              action: orgResult.action,
              data: orgResult.data,
              commandType: orgResult.commandType
            };
          }
          
          // If not an organization command, fall back to the original processor
          return await originalProcessVoiceCommand(voiceText, detectedLanguage);
        } catch (error) {
          console.error('Error in integrated voice command processing:', error);
          return {
            success: false,
            originalCommand: voiceText,
            error: error.message
          };
        }
      };
      
      console.log('Voice command integration initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing voice command integration:', error);
      return false;
    }
  }, [ace, processOrganizationCommand]);
  
  // Initialize on first render
  initialize();
  
  // Return hook value
  return {
    processOrganizationCommand,
    // Helper functions
    getExampleCommands: () => {
      return {
        tasks: [
          t('voice.examples.task.create'),
          t('voice.examples.task.list'),
          t('voice.examples.task.complete'),
          t('voice.examples.task.delete')
        ],
        emails: [
          t('voice.examples.email.create'),
          t('voice.examples.email.list'),
          t('voice.examples.email.read'),
          t('voice.examples.email.delete')
        ],
        meetings: [
          t('voice.examples.meeting.create'),
          t('voice.examples.meeting.list'),
          t('voice.examples.meeting.start'),
          t('voice.examples.meeting.cancel')
        ],
        reminders: [
          t('voice.examples.reminder.create'),
          t('voice.examples.reminder.list'),
          t('voice.examples.reminder.complete'),
          t('voice.examples.reminder.delete')
        ]
      };
    }
  };
};

export default useVoiceCommandIntegration;

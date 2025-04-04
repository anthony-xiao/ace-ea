/**
 * VoiceCommandProcessor Component for Ace Assistant
 * 
 * This component processes voice commands and routes them to the appropriate service
 * (tasks, emails, meetings) with support for both English and Chinese languages.
 */

import { useCallback } from 'react';
import useTasks from '../../hooks/useTasks';
import useEmail from '../../hooks/useEmail';
import useMeetings from '../../hooks/useMeetings';
import useReminders from '../../hooks/useReminders';
import useLocalization from '../../hooks/useLocalization';

/**
 * Process and execute voice commands for organization features
 */
class VoiceCommandProcessor {
  constructor() {
    // Command patterns for English
    this.taskCommandsEN = {
      create: [
        /create (a )?task/i,
        /add (a )?task/i,
        /new task/i
      ],
      list: [
        /list( all)? tasks/i,
        /show( all)? tasks/i,
        /what are my tasks/i
      ],
      complete: [
        /complete task/i,
        /mark task (as )?complete/i,
        /finish task/i
      ],
      delete: [
        /delete task/i,
        /remove task/i
      ],
      update: [
        /update task/i,
        /change task/i,
        /edit task/i
      ]
    };
    
    // Command patterns for Chinese
    this.taskCommandsZH = {
      create: [
        /创建任务/,
        /添加任务/,
        /新任务/
      ],
      list: [
        /列出任务/,
        /显示任务/,
        /我的任务/
      ],
      complete: [
        /完成任务/,
        /标记任务完成/
      ],
      delete: [
        /删除任务/,
        /移除任务/
      ],
      update: [
        /更新任务/,
        /修改任务/
      ]
    };
    
    // Email command patterns for English
    this.emailCommandsEN = {
      create: [
        /create (an? )?email/i,
        /compose (an? )?email/i,
        /new email/i,
        /send (an? )?email/i,
        /write (an? )?email/i
      ],
      list: [
        /list( all)? emails/i,
        /show( all)? emails/i,
        /check( my)? emails/i,
        /what are my emails/i
      ],
      read: [
        /read email/i,
        /open email/i
      ],
      delete: [
        /delete email/i,
        /remove email/i
      ],
      update: [
        /update email/i,
        /edit email/i
      ]
    };
    
    // Email command patterns for Chinese
    this.emailCommandsZH = {
      create: [
        /创建邮件/,
        /撰写邮件/,
        /新邮件/,
        /发送邮件/,
        /写邮件/
      ],
      list: [
        /列出邮件/,
        /显示邮件/,
        /查看邮件/,
        /我的邮件/
      ],
      read: [
        /阅读邮件/,
        /打开邮件/
      ],
      delete: [
        /删除邮件/,
        /移除邮件/
      ],
      update: [
        /更新邮件/,
        /编辑邮件/
      ]
    };
    
    // Meeting command patterns for English
    this.meetingCommandsEN = {
      create: [
        /create (a )?meeting/i,
        /schedule (a )?meeting/i,
        /new meeting/i,
        /set up (a )?meeting/i
      ],
      list: [
        /list( all)? meetings/i,
        /show( all)? meetings/i,
        /what are my meetings/i,
        /check( my)? schedule/i,
        /check( my)? calendar/i
      ],
      start: [
        /start meeting/i,
        /join meeting/i,
        /begin meeting/i
      ],
      cancel: [
        /cancel meeting/i,
        /delete meeting/i,
        /remove meeting/i
      ],
      update: [
        /update meeting/i,
        /change meeting/i,
        /edit meeting/i,
        /reschedule meeting/i
      ]
    };
    
    // Meeting command patterns for Chinese
    this.meetingCommandsZH = {
      create: [
        /创建会议/,
        /安排会议/,
        /新会议/,
        /设置会议/
      ],
      list: [
        /列出会议/,
        /显示会议/,
        /我的会议/,
        /查看日程/,
        /查看日历/
      ],
      start: [
        /开始会议/,
        /加入会议/
      ],
      cancel: [
        /取消会议/,
        /删除会议/,
        /移除会议/
      ],
      update: [
        /更新会议/,
        /修改会议/,
        /编辑会议/,
        /重新安排会议/
      ]
    };
    
    // Reminder command patterns for English
    this.reminderCommandsEN = {
      create: [
        /create (a )?reminder/i,
        /remind me/i,
        /set (a )?reminder/i,
        /new reminder/i
      ],
      list: [
        /list( all)? reminders/i,
        /show( all)? reminders/i,
        /what are my reminders/i
      ],
      complete: [
        /complete reminder/i,
        /mark reminder (as )?complete/i,
        /finish reminder/i
      ],
      delete: [
        /delete reminder/i,
        /remove reminder/i,
        /cancel reminder/i
      ],
      update: [
        /update reminder/i,
        /change reminder/i,
        /edit reminder/i
      ]
    };
    
    // Reminder command patterns for Chinese
    this.reminderCommandsZH = {
      create: [
        /创建提醒/,
        /提醒我/,
        /设置提醒/,
        /新提醒/
      ],
      list: [
        /列出提醒/,
        /显示提醒/,
        /我的提醒/
      ],
      complete: [
        /完成提醒/,
        /标记提醒完成/
      ],
      delete: [
        /删除提醒/,
        /移除提醒/,
        /取消提醒/
      ],
      update: [
        /更新提醒/,
        /修改提醒/,
        /编辑提醒/
      ]
    };
    
    // Bind methods
    this.processCommand = this.processCommand.bind(this);
    this.extractEntityDetails = this.extractEntityDetails.bind(this);
    this.matchCommand = this.matchCommand.bind(this);
    this.executeTaskCommand = this.executeTaskCommand.bind(this);
    this.executeEmailCommand = this.executeEmailCommand.bind(this);
    this.executeMeetingCommand = this.executeMeetingCommand.bind(this);
    this.executeReminderCommand = this.executeReminderCommand.bind(this);
  }
  
  /**
   * Process a voice command
   * @param {string} command - The voice command text
   * @param {string} language - The language of the command ('en' or 'zh')
   * @param {Object} services - The service hooks (tasks, email, meetings, reminders)
   * @param {Object} t - The translation function
   * @returns {Object} Processing result
   */
  async processCommand(command, language, services, t) {
    try {
      console.log(`Processing organization command: "${command}" (${language})`);
      
      // Normalize command text
      const normalizedCommand = command.trim().toLowerCase();
      
      // Determine command type and action
      let commandType = null;
      let action = null;
      let entityDetails = null;
      
      // Check task commands
      const taskCommands = language === 'zh' ? this.taskCommandsZH : this.taskCommandsEN;
      const taskMatch = this.matchCommand(normalizedCommand, taskCommands);
      
      if (taskMatch) {
        commandType = 'task';
        action = taskMatch;
        entityDetails = this.extractEntityDetails(normalizedCommand, commandType, action, language);
        
        return await this.executeTaskCommand(action, entityDetails, services.tasks, t, language);
      }
      
      // Check email commands
      const emailCommands = language === 'zh' ? this.emailCommandsZH : this.emailCommandsEN;
      const emailMatch = this.matchCommand(normalizedCommand, emailCommands);
      
      if (emailMatch) {
        commandType = 'email';
        action = emailMatch;
        entityDetails = this.extractEntityDetails(normalizedCommand, commandType, action, language);
        
        return await this.executeEmailCommand(action, entityDetails, services.email, t, language);
      }
      
      // Check meeting commands
      const meetingCommands = language === 'zh' ? this.meetingCommandsZH : this.meetingCommandsEN;
      const meetingMatch = this.matchCommand(normalizedCommand, meetingCommands);
      
      if (meetingMatch) {
        commandType = 'meeting';
        action = meetingMatch;
        entityDetails = this.extractEntityDetails(normalizedCommand, commandType, action, language);
        
        return await this.executeMeetingCommand(action, entityDetails, services.meetings, t, language);
      }
      
      // Check reminder commands
      const reminderCommands = language === 'zh' ? this.reminderCommandsZH : this.reminderCommandsEN;
      const reminderMatch = this.matchCommand(normalizedCommand, reminderCommands);
      
      if (reminderMatch) {
        commandType = 'reminder';
        action = reminderMatch;
        entityDetails = this.extractEntityDetails(normalizedCommand, commandType, action, language);
        
        return await this.executeReminderCommand(action, entityDetails, services.reminders, t, language);
      }
      
      // No matching command found
      return {
        success: false,
        commandType: null,
        action: null,
        response: t('voice.command_not_recognized'),
        error: 'Command not recognized'
      };
    } catch (error) {
      console.error('Error processing organization command:', error);
      return {
        success: false,
        error: error.message,
        response: t('voice.command_error')
      };
    }
  }
  
  /**
   * Match a command against patterns
   * @param {string} command - The command text
   * @param {Object} patterns - The command patterns
   * @returns {string|null} Matched action or null
   */
  matchCommand(command, patterns) {
    for (const [action, actionPatterns] of Object.entries(patterns)) {
      for (const pattern of actionPatterns) {
        if (pattern.test(command)) {
          return action;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Extract entity details from command
   * @param {string} command - The command text
   * @param {string} entityType - The entity type (task, email, meeting, reminder)
   * @param {string} action - The action (create, list, etc.)
   * @param {string} language - The language of the command
   * @returns {Object} Entity details
   */
  extractEntityDetails(command, entityType, action, language) {
    const details = {};
    
    // Extract title/subject
    if (action === 'create' || action === 'update') {
      let titleMatch = null;
      
      if (language === 'en') {
        // English patterns
        if (entityType === 'task') {
          titleMatch = command.match(/task (?:called|named|titled|about|for|to) ["']?([^"']+)["']?/i) ||
                      command.match(/task ["']([^"']+)["']/i);
        } else if (entityType === 'email') {
          titleMatch = command.match(/email (?:with subject|about|regarding|titled|called) ["']?([^"']+)["']?/i) ||
                      command.match(/email ["']([^"']+)["']/i);
        } else if (entityType === 'meeting') {
          titleMatch = command.match(/meeting (?:called|named|titled|about|for|regarding) ["']?([^"']+)["']?/i) ||
                      command.match(/meeting ["']([^"']+)["']/i);
        } else if (entityType === 'reminder') {
          titleMatch = command.match(/reminder (?:to|about|for) ["']?([^"']+)["']?/i) ||
                      command.match(/remind me (?:to|about|for) ["']?([^"']+)["']?/i) ||
                      command.match(/reminder ["']([^"']+)["']/i);
        }
      } else {
        // Chinese patterns
        if (entityType === 'task') {
          titleMatch = command.match(/任务[叫|名为|关于|为]["']?([^"']+)["']?/) ||
                      command.match(/任务["']([^"']+)["']/);
        } else if (entityType === 'email') {
          titleMatch = command.match(/邮件[主题|关于|标题为]["']?([^"']+)["']?/) ||
                      command.match(/邮件["']([^"']+)["']/);
        } else if (entityType === 'meeting') {
          titleMatch = command.match(/会议[叫|名为|关于|为]["']?([^"']+)["']?/) ||
                      command.match(/会议["']([^"']+)["']/);
        } else if (entityType === 'reminder') {
          titleMatch = command.match(/提醒[关于|为]["']?([^"']+)["']?/) ||
                      command.match(/提醒我[关于|为]?["']?([^"']+)["']?/) ||
                      command.match(/提醒["']([^"']+)["']/);
        }
      }
      
      if (titleMatch && titleMatch[1]) {
        details.title = titleMatch[1].trim();
      }
    }
    
    // Extract priority
    if (action === 'create' || action === 'update') {
      let priorityMatch = null;
      
      if (language === 'en') {
        priorityMatch = command.match(/(?:with|set|mark as) (high|medium|low) priority/i);
      } else {
        priorityMatch = command.match(/(高|中|低)优先级/);
      }
      
      if (priorityMatch && priorityMatch[1]) {
        let priority = priorityMatch[1].toLowerCase();
        
        // Convert Chinese priority terms to English
        if (priority === '高') priority = 'high';
        else if (priority === '中') priority = 'medium';
        else if (priority === '低') priority = 'low';
        
        details.priority = priority;
      }
    }
    
    // Extract date/time for meetings and reminders
    if ((entityType === 'meeting' || entityType === 'reminder') && 
        (action === 'create' || action === 'update')) {
      let dateTimeMatch = null;
      
      if (language === 'en') {
        // Various English date/time patterns
        dateTimeMatch = command.match(/(?:on|at|for) (today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) ||
                       command.match(/(?:on|at|for) (\d{1,2}(?:st|nd|rd|th)? (?:of )?(?:january|february|march|april|may|june|july|august|september|october|november|december))/i) ||
                       command.match(/(?:on|at|for) (\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i) ||
                       command.match(/(?:at) (\d{1,2}(?::\d{2})? ?(?:am|pm)?)/i);
      } else {
        // Various Chinese date/time patterns
        dateTimeMatch = command.match(/(今天|明天|周一|周二|周三|周四|周五|周六|周日)/) ||
                       command.match(/(\d{1,2}月\d{1,2}日)/) ||
                       command.match(/(\d{1,2}点\d{0,2}分)/);
      }
      
      if (dateTimeMatch && dateTimeMatch[1]) {
        details.dateTime = dateTimeMatch[1].trim();
      }
    }
    
    // Extract ID for update, delete, complete actions
    if (action === 'update' || action === 'delete' || action === 'complete' || 
        action === 'read' || action === 'start' || action === 'cancel') {
      let idMatch = null;
      
      if (language === 'en') {
        idMatch = command.match(/(?:with id|id|number|#) (\d+)/i);
      } else {
        idMatch = command.match(/(?:编号|ID|号码) (\d+)/);
      }
      
      if (idMatch && idMatch[1]) {
        details.id = idMatch[1].trim();
      }
    }
    
    return details;
  }
  
  /**
   * Execute a task command
   * @param {string} action - The action to perform
   * @param {Object} details - The task details
   * @param {Object} taskService - The task service
   * @param {Function} t - Translation function
   * @param {string} language - The language of the command
   * @returns {Object} Execution result
   */
  async executeTaskCommand(action, details, taskService, t, language) {
    try {
      switch (action) {
        case 'create':
          if (!details.title) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.title_required'),
              error: 'Task title required'
            };
          }
          
          const newTask = await taskService.createTask({
            title: details.title,
            priority: details.priority || 'medium',
            status: 'pending',
            language
          });
          
          return {
            success: true,
            commandType: 'task',
            action,
            data: newTask,
            response: t('voice.task.created', { title: details.title })
          };
          
        case 'list':
          const tasks = await taskService.getTasks();
          
          return {
            success: true,
            commandType: 'task',
            action,
            data: tasks,
            response: t('voice.task.listed', { count: tasks.length })
          };
          
        case 'complete':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.id_or_title_required'),
              error: 'Task ID or title required'
            };
          }
          
          let taskToComplete;
          
          if (details.id) {
            taskToComplete = await taskService.getTaskById(details.id);
          } else if (details.title) {
            // Find task by title
            const tasks = await taskService.getTasks();
            taskToComplete = tasks.find(task => 
              task.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!taskToComplete) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.not_found'),
              error: 'Task not found'
            };
          }
          
          const completedTask = await taskService.updateTask(taskToComplete.id, {
            status: 'completed'
          });
          
          return {
            success: true,
            commandType: 'task',
            action,
            data: completedTask,
            response: t('voice.task.completed', { title: completedTask.title })
          };
          
        case 'delete':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.id_or_title_required'),
              error: 'Task ID or title required'
            };
          }
          
          let taskToDelete;
          
          if (details.id) {
            taskToDelete = await taskService.getTaskById(details.id);
          } else if (details.title) {
            // Find task by title
            const tasks = await taskService.getTasks();
            taskToDelete = tasks.find(task => 
              task.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!taskToDelete) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.not_found'),
              error: 'Task not found'
            };
          }
          
          await taskService.deleteTask(taskToDelete.id);
          
          return {
            success: true,
            commandType: 'task',
            action,
            data: { id: taskToDelete.id },
            response: t('voice.task.deleted', { title: taskToDelete.title })
          };
          
        case 'update':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.id_or_title_required'),
              error: 'Task ID or title required'
            };
          }
          
          let taskToUpdate;
          
          if (details.id) {
            taskToUpdate = await taskService.getTaskById(details.id);
          } else if (details.title) {
            // Find task by title
            const tasks = await taskService.getTasks();
            taskToUpdate = tasks.find(task => 
              task.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!taskToUpdate) {
            return {
              success: false,
              commandType: 'task',
              action,
              response: t('voice.task.not_found'),
              error: 'Task not found'
            };
          }
          
          const updateData = {};
          
          if (details.priority) {
            updateData.priority = details.priority;
          }
          
          const updatedTask = await taskService.updateTask(taskToUpdate.id, updateData);
          
          return {
            success: true,
            commandType: 'task',
            action,
            data: updatedTask,
            response: t('voice.task.updated', { title: updatedTask.title })
          };
          
        default:
          return {
            success: false,
            commandType: 'task',
            action,
            response: t('voice.task.action_not_supported'),
            error: 'Task action not supported'
          };
      }
    } catch (error) {
      console.error('Error executing task command:', error);
      return {
        success: false,
        commandType: 'task',
        action,
        error: error.message,
        response: t('voice.task.error', { action })
      };
    }
  }
  
  /**
   * Execute an email command
   * @param {string} action - The action to perform
   * @param {Object} details - The email details
   * @param {Object} emailService - The email service
   * @param {Function} t - Translation function
   * @param {string} language - The language of the command
   * @returns {Object} Execution result
   */
  async executeEmailCommand(action, details, emailService, t, language) {
    try {
      switch (action) {
        case 'create':
          if (!details.title) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.subject_required'),
              error: 'Email subject required'
            };
          }
          
          const newEmail = await emailService.createEmail({
            subject: details.title,
            priority: details.priority || 'medium',
            status: 'draft',
            language
          });
          
          return {
            success: true,
            commandType: 'email',
            action,
            data: newEmail,
            response: t('voice.email.created', { subject: details.title })
          };
          
        case 'list':
          const emails = await emailService.getEmails();
          
          return {
            success: true,
            commandType: 'email',
            action,
            data: emails,
            response: t('voice.email.listed', { count: emails.length })
          };
          
        case 'read':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.id_or_subject_required'),
              error: 'Email ID or subject required'
            };
          }
          
          let emailToRead;
          
          if (details.id) {
            emailToRead = await emailService.getEmailById(details.id);
          } else if (details.title) {
            // Find email by subject
            const emails = await emailService.getEmails();
            emailToRead = emails.find(email => 
              email.subject.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!emailToRead) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.not_found'),
              error: 'Email not found'
            };
          }
          
          return {
            success: true,
            commandType: 'email',
            action,
            data: emailToRead,
            response: t('voice.email.read', { subject: emailToRead.subject })
          };
          
        case 'delete':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.id_or_subject_required'),
              error: 'Email ID or subject required'
            };
          }
          
          let emailToDelete;
          
          if (details.id) {
            emailToDelete = await emailService.getEmailById(details.id);
          } else if (details.title) {
            // Find email by subject
            const emails = await emailService.getEmails();
            emailToDelete = emails.find(email => 
              email.subject.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!emailToDelete) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.not_found'),
              error: 'Email not found'
            };
          }
          
          await emailService.deleteEmail(emailToDelete.id);
          
          return {
            success: true,
            commandType: 'email',
            action,
            data: { id: emailToDelete.id },
            response: t('voice.email.deleted', { subject: emailToDelete.subject })
          };
          
        case 'update':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.id_or_subject_required'),
              error: 'Email ID or subject required'
            };
          }
          
          let emailToUpdate;
          
          if (details.id) {
            emailToUpdate = await emailService.getEmailById(details.id);
          } else if (details.title) {
            // Find email by subject
            const emails = await emailService.getEmails();
            emailToUpdate = emails.find(email => 
              email.subject.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!emailToUpdate) {
            return {
              success: false,
              commandType: 'email',
              action,
              response: t('voice.email.not_found'),
              error: 'Email not found'
            };
          }
          
          const updateData = {};
          
          if (details.priority) {
            updateData.priority = details.priority;
          }
          
          const updatedEmail = await emailService.updateEmail(emailToUpdate.id, updateData);
          
          return {
            success: true,
            commandType: 'email',
            action,
            data: updatedEmail,
            response: t('voice.email.updated', { subject: updatedEmail.subject })
          };
          
        default:
          return {
            success: false,
            commandType: 'email',
            action,
            response: t('voice.email.action_not_supported'),
            error: 'Email action not supported'
          };
      }
    } catch (error) {
      console.error('Error executing email command:', error);
      return {
        success: false,
        commandType: 'email',
        action,
        error: error.message,
        response: t('voice.email.error', { action })
      };
    }
  }
  
  /**
   * Execute a meeting command
   * @param {string} action - The action to perform
   * @param {Object} details - The meeting details
   * @param {Object} meetingService - The meeting service
   * @param {Function} t - Translation function
   * @param {string} language - The language of the command
   * @returns {Object} Execution result
   */
  async executeMeetingCommand(action, details, meetingService, t, language) {
    try {
      switch (action) {
        case 'create':
          if (!details.title) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.title_required'),
              error: 'Meeting title required'
            };
          }
          
          // Create a default meeting time if not specified
          let startTime = new Date();
          
          if (details.dateTime) {
            // Simple parsing for demo purposes
            // In a real app, use a more robust date parsing library
            if (details.dateTime.toLowerCase() === 'tomorrow') {
              startTime.setDate(startTime.getDate() + 1);
            } else if (details.dateTime.toLowerCase().includes('monday')) {
              startTime.setDate(startTime.getDate() + (8 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('tuesday')) {
              startTime.setDate(startTime.getDate() + (9 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('wednesday')) {
              startTime.setDate(startTime.getDate() + (10 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('thursday')) {
              startTime.setDate(startTime.getDate() + (11 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('friday')) {
              startTime.setDate(startTime.getDate() + (12 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('saturday')) {
              startTime.setDate(startTime.getDate() + (13 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('sunday')) {
              startTime.setDate(startTime.getDate() + (14 - startTime.getDay()) % 7);
            }
          }
          
          // Set end time to 1 hour after start time
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
          
          const newMeeting = await meetingService.createMeeting({
            title: details.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            priority: details.priority || 'medium',
            status: 'scheduled',
            language
          });
          
          return {
            success: true,
            commandType: 'meeting',
            action,
            data: newMeeting,
            response: t('voice.meeting.created', { title: details.title })
          };
          
        case 'list':
          const meetings = await meetingService.getMeetings();
          
          return {
            success: true,
            commandType: 'meeting',
            action,
            data: meetings,
            response: t('voice.meeting.listed', { count: meetings.length })
          };
          
        case 'start':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.id_or_title_required'),
              error: 'Meeting ID or title required'
            };
          }
          
          let meetingToStart;
          
          if (details.id) {
            meetingToStart = await meetingService.getMeetingById(details.id);
          } else if (details.title) {
            // Find meeting by title
            const meetings = await meetingService.getMeetings();
            meetingToStart = meetings.find(meeting => 
              meeting.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!meetingToStart) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.not_found'),
              error: 'Meeting not found'
            };
          }
          
          const startedMeeting = await meetingService.startMeeting(meetingToStart.id);
          
          return {
            success: true,
            commandType: 'meeting',
            action,
            data: startedMeeting,
            response: t('voice.meeting.started', { title: startedMeeting.title })
          };
          
        case 'cancel':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.id_or_title_required'),
              error: 'Meeting ID or title required'
            };
          }
          
          let meetingToCancel;
          
          if (details.id) {
            meetingToCancel = await meetingService.getMeetingById(details.id);
          } else if (details.title) {
            // Find meeting by title
            const meetings = await meetingService.getMeetings();
            meetingToCancel = meetings.find(meeting => 
              meeting.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!meetingToCancel) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.not_found'),
              error: 'Meeting not found'
            };
          }
          
          await meetingService.deleteMeeting(meetingToCancel.id);
          
          return {
            success: true,
            commandType: 'meeting',
            action,
            data: { id: meetingToCancel.id },
            response: t('voice.meeting.cancelled', { title: meetingToCancel.title })
          };
          
        case 'update':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.id_or_title_required'),
              error: 'Meeting ID or title required'
            };
          }
          
          let meetingToUpdate;
          
          if (details.id) {
            meetingToUpdate = await meetingService.getMeetingById(details.id);
          } else if (details.title) {
            // Find meeting by title
            const meetings = await meetingService.getMeetings();
            meetingToUpdate = meetings.find(meeting => 
              meeting.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!meetingToUpdate) {
            return {
              success: false,
              commandType: 'meeting',
              action,
              response: t('voice.meeting.not_found'),
              error: 'Meeting not found'
            };
          }
          
          const updateData = {};
          
          if (details.priority) {
            updateData.priority = details.priority;
          }
          
          if (details.dateTime) {
            // Simple parsing for demo purposes
            let startTime = new Date(meetingToUpdate.startTime);
            
            if (details.dateTime.toLowerCase() === 'tomorrow') {
              startTime.setDate(startTime.getDate() + 1);
            } else if (details.dateTime.toLowerCase().includes('monday')) {
              startTime.setDate(startTime.getDate() + (8 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('tuesday')) {
              startTime.setDate(startTime.getDate() + (9 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('wednesday')) {
              startTime.setDate(startTime.getDate() + (10 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('thursday')) {
              startTime.setDate(startTime.getDate() + (11 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('friday')) {
              startTime.setDate(startTime.getDate() + (12 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('saturday')) {
              startTime.setDate(startTime.getDate() + (13 - startTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('sunday')) {
              startTime.setDate(startTime.getDate() + (14 - startTime.getDay()) % 7);
            }
            
            updateData.startTime = startTime.toISOString();
            
            // Set end time to 1 hour after start time
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            updateData.endTime = endTime.toISOString();
          }
          
          const updatedMeeting = await meetingService.updateMeeting(meetingToUpdate.id, updateData);
          
          return {
            success: true,
            commandType: 'meeting',
            action,
            data: updatedMeeting,
            response: t('voice.meeting.updated', { title: updatedMeeting.title })
          };
          
        default:
          return {
            success: false,
            commandType: 'meeting',
            action,
            response: t('voice.meeting.action_not_supported'),
            error: 'Meeting action not supported'
          };
      }
    } catch (error) {
      console.error('Error executing meeting command:', error);
      return {
        success: false,
        commandType: 'meeting',
        action,
        error: error.message,
        response: t('voice.meeting.error', { action })
      };
    }
  }
  
  /**
   * Execute a reminder command
   * @param {string} action - The action to perform
   * @param {Object} details - The reminder details
   * @param {Object} reminderService - The reminder service
   * @param {Function} t - Translation function
   * @param {string} language - The language of the command
   * @returns {Object} Execution result
   */
  async executeReminderCommand(action, details, reminderService, t, language) {
    try {
      switch (action) {
        case 'create':
          if (!details.title) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.title_required'),
              error: 'Reminder title required'
            };
          }
          
          // Create a default reminder time if not specified
          let reminderTime = new Date();
          reminderTime.setHours(reminderTime.getHours() + 1);
          
          if (details.dateTime) {
            // Simple parsing for demo purposes
            if (details.dateTime.toLowerCase() === 'tomorrow') {
              reminderTime.setDate(reminderTime.getDate() + 1);
            } else if (details.dateTime.toLowerCase().includes('monday')) {
              reminderTime.setDate(reminderTime.getDate() + (8 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('tuesday')) {
              reminderTime.setDate(reminderTime.getDate() + (9 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('wednesday')) {
              reminderTime.setDate(reminderTime.getDate() + (10 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('thursday')) {
              reminderTime.setDate(reminderTime.getDate() + (11 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('friday')) {
              reminderTime.setDate(reminderTime.getDate() + (12 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('saturday')) {
              reminderTime.setDate(reminderTime.getDate() + (13 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('sunday')) {
              reminderTime.setDate(reminderTime.getDate() + (14 - reminderTime.getDay()) % 7);
            }
          }
          
          const newReminder = await reminderService.createReminder({
            title: details.title,
            reminderTime: reminderTime.toISOString(),
            priority: details.priority || 'medium',
            status: 'pending',
            language
          });
          
          return {
            success: true,
            commandType: 'reminder',
            action,
            data: newReminder,
            response: t('voice.reminder.created', { title: details.title })
          };
          
        case 'list':
          const reminders = await reminderService.getReminders();
          
          return {
            success: true,
            commandType: 'reminder',
            action,
            data: reminders,
            response: t('voice.reminder.listed', { count: reminders.length })
          };
          
        case 'complete':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.id_or_title_required'),
              error: 'Reminder ID or title required'
            };
          }
          
          let reminderToComplete;
          
          if (details.id) {
            reminderToComplete = await reminderService.getReminderById(details.id);
          } else if (details.title) {
            // Find reminder by title
            const reminders = await reminderService.getReminders();
            reminderToComplete = reminders.find(reminder => 
              reminder.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!reminderToComplete) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.not_found'),
              error: 'Reminder not found'
            };
          }
          
          const completedReminder = await reminderService.updateReminder(reminderToComplete.id, {
            status: 'completed'
          });
          
          return {
            success: true,
            commandType: 'reminder',
            action,
            data: completedReminder,
            response: t('voice.reminder.completed', { title: completedReminder.title })
          };
          
        case 'delete':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.id_or_title_required'),
              error: 'Reminder ID or title required'
            };
          }
          
          let reminderToDelete;
          
          if (details.id) {
            reminderToDelete = await reminderService.getReminderById(details.id);
          } else if (details.title) {
            // Find reminder by title
            const reminders = await reminderService.getReminders();
            reminderToDelete = reminders.find(reminder => 
              reminder.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!reminderToDelete) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.not_found'),
              error: 'Reminder not found'
            };
          }
          
          await reminderService.deleteReminder(reminderToDelete.id);
          
          return {
            success: true,
            commandType: 'reminder',
            action,
            data: { id: reminderToDelete.id },
            response: t('voice.reminder.deleted', { title: reminderToDelete.title })
          };
          
        case 'update':
          if (!details.id && !details.title) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.id_or_title_required'),
              error: 'Reminder ID or title required'
            };
          }
          
          let reminderToUpdate;
          
          if (details.id) {
            reminderToUpdate = await reminderService.getReminderById(details.id);
          } else if (details.title) {
            // Find reminder by title
            const reminders = await reminderService.getReminders();
            reminderToUpdate = reminders.find(reminder => 
              reminder.title.toLowerCase().includes(details.title.toLowerCase())
            );
          }
          
          if (!reminderToUpdate) {
            return {
              success: false,
              commandType: 'reminder',
              action,
              response: t('voice.reminder.not_found'),
              error: 'Reminder not found'
            };
          }
          
          const updateData = {};
          
          if (details.priority) {
            updateData.priority = details.priority;
          }
          
          if (details.dateTime) {
            // Simple parsing for demo purposes
            let reminderTime = new Date();
            
            if (details.dateTime.toLowerCase() === 'tomorrow') {
              reminderTime.setDate(reminderTime.getDate() + 1);
            } else if (details.dateTime.toLowerCase().includes('monday')) {
              reminderTime.setDate(reminderTime.getDate() + (8 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('tuesday')) {
              reminderTime.setDate(reminderTime.getDate() + (9 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('wednesday')) {
              reminderTime.setDate(reminderTime.getDate() + (10 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('thursday')) {
              reminderTime.setDate(reminderTime.getDate() + (11 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('friday')) {
              reminderTime.setDate(reminderTime.getDate() + (12 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('saturday')) {
              reminderTime.setDate(reminderTime.getDate() + (13 - reminderTime.getDay()) % 7);
            } else if (details.dateTime.toLowerCase().includes('sunday')) {
              reminderTime.setDate(reminderTime.getDate() + (14 - reminderTime.getDay()) % 7);
            }
            
            updateData.reminderTime = reminderTime.toISOString();
          }
          
          const updatedReminder = await reminderService.updateReminder(reminderToUpdate.id, updateData);
          
          return {
            success: true,
            commandType: 'reminder',
            action,
            data: updatedReminder,
            response: t('voice.reminder.updated', { title: updatedReminder.title })
          };
          
        default:
          return {
            success: false,
            commandType: 'reminder',
            action,
            response: t('voice.reminder.action_not_supported'),
            error: 'Reminder action not supported'
          };
      }
    } catch (error) {
      console.error('Error executing reminder command:', error);
      return {
        success: false,
        commandType: 'reminder',
        action,
        error: error.message,
        response: t('voice.reminder.error', { action })
      };
    }
  }
}

// Create a singleton instance
const voiceCommandProcessor = new VoiceCommandProcessor();

export default voiceCommandProcessor;

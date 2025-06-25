/**
 * NotificationService - Handles user notifications (Task 5)
 * @module services/NotificationService
 */
const NotificationModel = require('../models/NotificationModel');
const MessageService = require('./MessageService'); // Assumes MessageService handles email logic
const logger = require('../utils/logger');

/**
 * Service for sending and managing user notifications.
 */
class NotificationService {
  /**
   * Send an in-app notification to a user and save to DB.
   * @param {string} userId - User's ObjectId
   * @param {string} message - Notification message
   * @returns {Promise<NotificationModel>} Created notification document
   */
  static async sendInAppNotification(userId, message) {
    if (!userId || typeof message !== 'string' || !message.trim()) {
      logger.error('Invalid input for sendInAppNotification', { userId, message });
      throw new Error('Invalid input for notification');
    }
    try {
      const notification = await NotificationModel.create({
        userId,
        type: 'message',
        content: message,
        status: 'unread',
      });
      logger.info('In-app notification sent', { userId, notificationId: notification._id });
      return notification;
    } catch (err) {
      logger.error('Failed to send in-app notification', { error: err, userId });
      throw err;
    }
  }

  /**
   * Send an email notification to a user and save to DB.
   * @param {string} userId - User's ObjectId
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @returns {Promise<NotificationModel>} Created notification document
   */
  static async sendEmailNotification(userId, subject, body) {
    if (!userId || !subject || !body) {
      logger.error('Invalid input for sendEmailNotification', { userId, subject });
      throw new Error('Invalid input for email notification');
    }
    try {
      // Use MessageService to send email (assumes getUserEmail and sendEmail exist)
      const userEmail = await MessageService.getUserEmail(userId);
      await MessageService.sendEmail(userEmail, subject, body);
      const notification = await NotificationModel.create({
        userId,
        type: 'system',
        content: subject,
        status: 'unread',
        meta: { email: userEmail, body },
      });
      logger.info('Email notification sent', { userId, notificationId: notification._id });
      return notification;
    } catch (err) {
      logger.error('Failed to send email notification', { error: err, userId });
      throw err;
    }
  }
}

module.exports = NotificationService;

// Unit tests for NotificationService should be placed in task5/__tests__/notification.test.js 
/**
 * NotificationModel - Mongoose schema for user notifications (Task 5)
 * @module models/NotificationModel
 */
const mongoose = require('mongoose');

/**
 * @typedef {Object} Notification
 * @property {mongoose.Types.ObjectId} userId - Reference to the user
 * @property {string} type - Notification type (e.g., 'message', 'system')
 * @property {string} content - Notification message content
 * @property {string} status - Notification status ('unread', 'read', 'archived')
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} [readAt] - When the notification was read
 * @property {Object} [meta] - Optional metadata
 */
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'system', 'reminder'],
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
    default: null,
  },
  meta: {
    type: Object,
    default: {},
  },
});

// Compound index for efficient querying
notificationSchema.index({ userId: 1, status: 1 });

/**
 * Notification model
 */
const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel; 
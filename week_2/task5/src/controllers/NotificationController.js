/**
 * NotificationController - Handles notification API endpoints (Task 5)
 * @module controllers/NotificationController
 */
const NotificationService = require('../services/NotificationService');
const NotificationModel = require('../models/NotificationModel');
const logger = require('../utils/logger');

/**
 * Controller for notification-related endpoints.
 */
const NotificationController = {
  /**
   * Get notifications for the authenticated user.
   * @param {Request} req
   * @param {Response} res
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user && req.user._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (err) {
      logger.error('Failed to get notifications', { error: err });
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  },

  /**
   * Mark one or more notifications as read.
   * @param {Request} req
   * @param {Response} res
   */
  async markRead(req, res) {
    try {
      const userId = req.user && req.user._id;
      const { ids } = req.body;
      if (!userId || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      const result = await NotificationModel.updateMany(
        { _id: { $in: ids }, userId },
        { $set: { status: 'read', readAt: new Date() } }
      );
      logger.info('Notifications marked as read', { userId, ids });
      res.json({ success: true, modifiedCount: result.nModified || result.modifiedCount });
    } catch (err) {
      logger.error('Failed to mark notifications as read', { error: err });
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  },

  /**
   * Delete a notification by ID.
   * @param {Request} req
   * @param {Response} res
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user && req.user._id;
      const { id } = req.params;
      if (!userId || !id) {
        return res.status(400).json({ error: 'Invalid input' });
      }
      const result = await NotificationModel.deleteOne({ _id: id, userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      logger.info('Notification deleted', { userId, id });
      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to delete notification', { error: err });
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },
};

module.exports = NotificationController; 
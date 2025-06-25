/**
 * Notification routes for Task 5
 * @module routes/notificationRoutes
 */
const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /notifications
 * @desc Get all notifications for the authenticated user
 */
router.get('/notifications', auth, NotificationController.getNotifications);

/**
 * @route POST /notifications/mark-read
 * @desc Mark notifications as read
 */
router.post('/notifications/mark-read', auth, NotificationController.markRead);

/**
 * @route DELETE /notifications/:id
 * @desc Delete a notification by ID
 */
router.delete('/notifications/:id', auth, NotificationController.deleteNotification);

module.exports = router; 
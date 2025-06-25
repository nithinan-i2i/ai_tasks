/**
 * UserController - Handles user-related actions (Task 5)
 * @module controllers/UserController
 */
const userService = require('../services/userService');
const NotificationService = require('../services/NotificationService');
const logger = require('../utils/logger');

/**
 * Register a new user and send a welcome notification.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    // Send welcome notification
    await NotificationService.sendInAppNotification(user._id, 'Welcome to the platform!');
    logger.info('User registered and notified', { userId: user._id });
    res.status(201).json(user);
  } catch (err) {
    logger.error('User registration failed', { error: err });
    next(err);
  }
};

module.exports = {
  createUser,
}; 
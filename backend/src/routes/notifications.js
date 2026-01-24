const express = require('express');
const { param, query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all notifications for user
router.get(
  '/',
  auth,
  [
    query('read').optional().isBoolean().withMessage('Read must be boolean'),
    query('type').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  async (req, res) => {
    try {
      const { read, type, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let filter = { userId: req.user.userId };

      if (read !== undefined) {
        filter.read = read === 'true';
      }

      if (type) {
        filter.type = type;
      }

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Notification.countDocuments(filter),
        Notification.countDocuments({ userId: req.user.userId, read: false })
      ]);

      res.json({
        success: true,
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          unreadCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }
);

// Mark notification as read
router.put(
  '/:id/read',
  auth,
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validate,
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.userId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      notification.read = true;
      notification.readAt = new Date();
      await notification.save();

      res.json({
        success: true,
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: error.message
      });
    }
  }
);

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
      error: error.message
    });
  }
});

// Delete notification
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validate,
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.userId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await notification.deleteOne();

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }
);

module.exports = router;

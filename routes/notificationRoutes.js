const express = require('express')
const router = express.Router()
const { isAuth, isAdmin } = require('../middleware/authMiddleware')
const {
  sendNotificationToAllUsers,
  getUserNotificationStatus,
  updateNotificationSettings,
} = require('../controllers/notificationController')

// Admin routes
router.post('/send-all', isAuth, isAdmin, sendNotificationToAllUsers)

// User routes
router.get('/status', isAuth, getUserNotificationStatus)
router.post('/settings', isAuth, updateNotificationSettings)

module.exports = router

const { Expo } = require('expo-server-sdk')
const User = require('../models/User')

const expo = new Expo()

const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, body } = req.body

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' })
    }

    // Get all users who have enabled notifications and have a valid push token
    const users = await User.find({
      notificationsEnabled: true,
      pushToken: { $exists: true, $ne: null },
    })

    // Create messages array for Expo
    const messages = []
    for (let user of users) {
      if (!Expo.isExpoPushToken(user.pushToken)) {
        console.error(`Invalid Expo push token ${user.pushToken}`)
        continue
      }

      messages.push({
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: { withSome: 'data' },
        priority: 'high',
      })
    }

    // Chunk messages to avoid rate limiting
    const chunks = expo.chunkPushNotifications(messages)
    const tickets = []

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error('Error sending chunk:', error)
      }
    }

    res.status(200).json({
      message: `Notifications sent to ${messages.length} users`,
      tickets,
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    res.status(500).json({ message: 'Error sending notifications' })
  }
}

const getUserNotificationStatus = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).select('notificationsEnabled pushToken')

    res.status(200).json({
      notificationsEnabled: user.notificationsEnabled,
      hasToken: !!user.pushToken,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error getting notification status' })
  }
}

const updateNotificationSettings = async (req, res) => {
  try {
    const { enabled, pushToken } = req.body
    const userId = req.user._id

    const updateData = {
      notificationsEnabled: enabled,
    }

    if (pushToken) {
      updateData.pushToken = pushToken
    }

    await User.findByIdAndUpdate(userId, updateData)

    res.status(200).json({ message: 'Notification settings updated' })
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification settings' })
  }
}

module.exports = {
  sendNotificationToAllUsers,
  getUserNotificationStatus,
  updateNotificationSettings,
}

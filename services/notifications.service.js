import { Expo } from 'expo-server-sdk'

// Initialize Expo SDK
const expo = new Expo()

export async function sendNotification({ tokens, title, body, data = {} }) {
  try {
    if (!tokens || tokens.length === 0) {
      console.warn('No push tokens provided')
      return { success: false, error: 'No push tokens provided' }
    }

    // Create the messages array
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }))

    // Filter out invalid tokens
    const validMessages = messages.filter(message => Expo.isExpoPushToken(message.to))

    if (validMessages.length === 0) {
      console.warn('No valid Expo push tokens')
      return { success: false, error: 'No valid Expo push tokens' }
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(validMessages)
    const tickets = []

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error('Error sending chunk:', error)
      }
    }

    return { success: true, tickets }
  } catch (error) {
    console.error('Notification error:', error)
    return { success: false, error: error.message }
  }
}

export async function checkNotificationStatus(receiptIds) {
  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
    const receipts = []

    for (let chunk of receiptIdChunks) {
      try {
        const receipt = await expo.getPushNotificationReceiptsAsync(chunk)
        receipts.push(receipt)
      } catch (error) {
        console.error('Error checking receipts:', error)
      }
    }

    return { success: true, receipts }
  } catch (error) {
    console.error('Receipt check error:', error)
    return { success: false, error: error.message }
  }
}

export class NotificationService {
  static async sendPushNotification(pushToken, title, message, data = {}) {
    try {
      console.log('Attempting to send push notification:', {
        token: pushToken,
        title,
        message,
        data,
      })

      // Validate the push token
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error('Invalid Expo push token:', pushToken)
        throw new Error(`Invalid Expo push token: ${pushToken}`)
      }

      // Create the notification message
      const notification = {
        to: pushToken,
        sound: 'default',
        title,
        body: message,
        data,
        priority: 'high',
        channelId: 'default',
      }

      console.log('Created notification payload:', notification)

      // Send the notification
      const chunks = expo.chunkPushNotifications([notification])
      const tickets = []

      for (const chunk of chunks) {
        try {
          console.log('Sending notification chunk')
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          console.log('Notification chunk sent successfully:', ticketChunk)
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error('Error sending notification chunk:', error)
          throw error
        }
      }

      console.log('All notifications sent successfully:', tickets)
      return tickets
    } catch (error) {
      console.error('Error in sendPushNotification:', error)
      throw error
    }
  }

  static async sendBatchPushNotifications(notifications) {
    try {
      // Filter out notifications with invalid tokens
      const validNotifications = notifications.filter(n => Expo.isExpoPushToken(n.to))

      if (validNotifications.length === 0) {
        console.log('No valid notifications to send')
        return []
      }

      // Send notifications in chunks
      const chunks = expo.chunkPushNotifications(validNotifications)
      const tickets = []

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error('Error sending notification chunk:', error)
        }
      }

      return tickets
    } catch (error) {
      console.error('Error in sendBatchPushNotifications:', error)
      throw error
    }
  }

  static async getPushNotificationReceipts(tickets) {
    try {
      const receiptIds = tickets.map(ticket => ticket.id)
      const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
      const receipts = []

      for (const chunk of receiptIdChunks) {
        try {
          const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk)
          receipts.push(receiptChunk)
        } catch (error) {
          console.error('Error getting notification receipts:', error)
        }
      }

      return receipts
    } catch (error) {
      console.error('Error in getPushNotificationReceipts:', error)
      throw error
    }
  }

  static async sendCartReminder(user) {
    if (!user.pushToken || !user.notificationsEnabled) return false

    return this.sendPushNotification(
      user.pushToken,
      'Items in your cart',
      "Don't forget about the items in your cart! Complete your purchase now.",
      { type: 'cart_reminder' }
    )
  }

  static async sendOrderStatus(user, orderStatus) {
    if (!user.pushToken || !user.notificationsEnabled) return false

    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered',
    }

    return this.sendPushNotification(
      user.pushToken,
      'Order Update',
      statusMessages[orderStatus] || 'Your order status has been updated',
      { type: 'order_update', status: orderStatus }
    )
  }
}

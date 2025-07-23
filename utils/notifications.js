import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
// This is used to send push notifications
const expo = new Expo();

/**
 * Send push notifications to users
 * @param {Array} pushTokens - Array of Expo push tokens
 * @param {Object} message - Notification message object
 * @returns {Promise} - Promise that resolves when notifications are sent
 */
export async function sendPushNotifications(pushTokens, message) {
  // Create the messages to send
  const messages = [];
  
  // Filter out invalid tokens
  for (let pushToken of pushTokens) {
    // Check that the token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct the message
    messages.push({
      to: pushToken,
      sound: 'default',
      ...message,
    });
  }

  // Send the messages
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
    return tickets;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return [];
  }
}

/**
 * Send order confirmation notification
 * @param {Array} pushTokens - Array of user push tokens
 * @param {Object} order - Order object
 */
export async function sendOrderConfirmationNotification(pushTokens, order) {
  if (!pushTokens || pushTokens.length === 0) {
    console.log('No push tokens available for user');
    return;
  }

  const message = {
    title: 'Order Confirmed!',
    body: `Your order #${order.orderId} has been successfully placed.`,
    data: {
      type: 'order_confirmation',
      orderId: order._id.toString(),
      orderNumber: order.orderId,
    },
  };

  return sendPushNotifications(pushTokens, message);
}
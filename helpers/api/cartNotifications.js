import { Expo } from 'expo-server-sdk'

const expo = new Expo()

export async function sendCartAbandonmentNotification(user, cart) {
  if (!user.pushToken || !user.notificationsEnabled) return

  const message = {
    to: user.pushToken,
    sound: 'default',
    title: 'Items waiting in your cart!',
    body: `Don't forget about the items in your cart. Complete your purchase now!`,
    data: { type: 'cart_reminder', cartId: cart._id },
  }

  try {
    const chunks = expo.chunkPushNotifications([message])
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk)
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

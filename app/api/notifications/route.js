import { Expo } from 'expo-server-sdk'

const expo = new Expo()

export async function POST(req) {
  try {
    const { tokens, title, body, data } = await req.json()

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

    return Response.json({ success: true, tickets })
  } catch (error) {
    console.error('Notification error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ message: 'Notifications service is running' })
}

import { Expo } from 'expo-server-sdk'
import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import User from '@/models/User'

const expo = new Expo()

// Add token validation helper
const isValidExpoPushToken = token => {
  return (
    typeof token === 'string' &&
    (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) &&
    token.endsWith(']')
  )
}

export async function POST(request) {
  try {
    const authResult = await validateToken(request)
    if (!authResult.success) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()
    await connectToDatabase()

    const user = await User.findById(authResult.userId)
    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Handle notification settings update
    if ('notificationsEnabled' in payload) {
      // For disabling notifications, allow null/empty token
      if (!payload.notificationsEnabled) {
        user.notificationsEnabled = false
        user.expoPushToken = null
        user.notificationSettings = {
          enabled: false,
          expoPushToken: null,
        }
      } else {
        // For enabling, require valid token
        if (!payload.expoPushToken) {
          return Response.json(
            { success: false, error: 'Push token required when enabling notifications' },
            { status: 400 }
          )
        }
        user.notificationsEnabled = true
        user.expoPushToken = payload.expoPushToken
        user.notificationSettings = {
          enabled: true,
          expoPushToken: payload.expoPushToken,
        }
      }

      await user.save()
      return Response.json({
        success: true,
        data: {
          notificationsEnabled: user.notificationsEnabled,
          expoPushToken: user.expoPushToken,
          notificationSettings: user.notificationSettings,
        },
      })
    }

    // Handle sending notifications
    const { tokens, title, message, data } = payload

    if (!tokens || !Array.isArray(tokens)) {
      return Response.json({ success: false, error: 'Invalid tokens array' }, { status: 400 })
    }

    // Create the messages array
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body: message, // Use 'message' instead of 'body' to avoid conflict
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
    return Response.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const authResult = await validateToken(request)
    if (!authResult.success) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findById(authResult.userId).select('+notificationSettings')

    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Validate and clean notification state
    const notificationState = {
      notificationsEnabled: !!user.notificationsEnabled,
      expoPushToken: isValidExpoPushToken(user.expoPushToken) ? user.expoPushToken : null,
      notificationSettings: {
        enabled: !!user.notificationsEnabled,
        expoPushToken: isValidExpoPushToken(user.expoPushToken) ? user.expoPushToken : null,
      },
    }

    // Update if token is invalid
    if (user.expoPushToken && !isValidExpoPushToken(user.expoPushToken)) {
      user.expoPushToken = null
      user.notificationSettings.expoPushToken = null
      await user.save()
    }

    return Response.json({
      success: true,
      data: notificationState,
    })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return Response.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

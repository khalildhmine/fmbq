import { Expo } from 'expo-server-sdk'
import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import User from '@/models/User'

const expo = new Expo()

export async function POST(request) {
  try {
    console.log('Admin notification request received')
    console.log('Authorization header:', request.headers.get('Authorization'))

    const auth = await validateToken(request)
    console.log('Auth validation result:', auth)

    if (!auth.success || !auth.isAdmin) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'Admin access required',
        },
        { status: 401 }
      )
    }

    // Double check admin status in database
    await connectToDatabase()
    const adminUser = await User.findById(auth.userId)
    if (!adminUser || adminUser.role !== 'admin') {
      console.log('Database admin check failed:', {
        userId: auth.userId,
        role: adminUser?.role,
      })
      return Response.json(
        {
          success: false,
          error: 'Permission denied',
          details: 'User is not an admin',
        },
        { status: 403 }
      )
    }

    const payload = await request.json()
    console.log('Notification payload:', payload)

    // Find users with notifications enabled
    const query = {
      notificationsEnabled: true,
      expoPushToken: { $ne: null },
      ...(payload.type === 'specific' ? { _id: { $in: payload.userIds } } : {}),
    }

    const users = await User.find(query).select('expoPushToken')
    console.log(`Found ${users.length} users with notifications enabled`)

    const tokens = users.map(user => user.expoPushToken).filter(Boolean)

    if (tokens.length === 0) {
      return Response.json({
        success: false,
        error: 'No users found with notifications enabled',
      })
    }

    // Create messages for each token
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.message,
      data: { link: payload.link },
    }))

    // Filter out invalid tokens
    const validMessages = messages.filter(msg => Expo.isExpoPushToken(msg.to))

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(validMessages)
    const tickets = []

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error('Error sending notification chunk:', error)
      }
    }

    // Save notification to history
    const successCount = tickets.filter(ticket => ticket.status === 'ok').length
    const failureCount = validMessages.length - successCount

    return Response.json({
      success: true,
      data: {
        sent: successCount,
        failed: failureCount,
        total: validMessages.length,
        tickets,
      },
    })
  } catch (error) {
    console.error('Admin notification error:', error)
    return Response.json(
      {
        success: false,
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import User from '@/models/User'
import { verifyToken } from '@/helpers/jwt'
import { NotificationService } from '@/services/notifications.service'

export async function POST(req) {
  try {
    // Get user ID from JWT token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decodedToken = await verifyToken(token)
    const userId = decodedToken.userId || decodedToken.id

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'User ID not found in token' },
        { status: 400 }
      )
    }

    console.log('Testing notification for user:', userId)

    // Get user from database
    const { db } = await connectToDatabase()
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 })
    }

    console.log('User notification settings:', {
      id: user._id,
      hasToken: !!user.pushToken,
      notificationsEnabled: user.notificationsEnabled,
      tokenType: typeof user.pushToken,
      token: user.pushToken,
    })

    if (!user.pushToken) {
      return NextResponse.json(
        { status: 'error', message: 'No push token found for user' },
        { status: 400 }
      )
    }

    if (!user.notificationsEnabled) {
      return NextResponse.json(
        { status: 'error', message: 'Notifications are disabled for user' },
        { status: 400 }
      )
    }

    // Send test notification
    try {
      console.log('Sending test notification with token:', user.pushToken)
      const result = await NotificationService.sendPushNotification(
        user.pushToken,
        'Test Notification',
        'This is a test notification from your app',
        { type: 'test' }
      )
      console.log('Test notification sent successfully:', result)

      return NextResponse.json({
        status: 'success',
        message: 'Test notification sent successfully',
        data: { result },
      })
    } catch (error) {
      console.error('Failed to send test notification:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to send test notification',
          error: error.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}

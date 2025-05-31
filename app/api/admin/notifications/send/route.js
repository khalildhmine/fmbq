import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Notification from '@/models/Notification'
import User from '@/models/User'
import { verifyToken } from '@/helpers/jwt'
import { NotificationService } from '@/services/notifications.service'
import { ObjectId } from 'mongodb'

// Helper to get token from request
const getTokenFromRequest = req => {
  try {
    // First check Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const encodedToken = authHeader.split(' ')[1]
      return decodeURIComponent(encodedToken)
    }

    // Then check user header (set by middleware)
    const userHeader = req.headers.get('user')
    if (userHeader) {
      try {
        const user = JSON.parse(userHeader)
        if (user.token) {
          return decodeURIComponent(user.token)
        }
      } catch (e) {
        console.error('Error parsing user header:', e)
      }
    }

    // Finally check cookies
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
      if (tokenCookie) {
        return decodeURIComponent(tokenCookie.split('=')[1])
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting token:', error)
    return null
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()

    // Validate request body
    const { title, message, type, userIds, link, scheduledFor } = body

    if (!title || !message) {
      return NextResponse.json(
        { status: 'error', message: 'Title and message are required' },
        { status: 400 }
      )
    }

    console.log('Creating notification:', { title, message, type, userIds, link, scheduledFor })

    // Create notification record with default admin user
    const notification = new Notification({
      title,
      message,
      type,
      userIds: type === 'specific' ? userIds : [],
      link,
      scheduledFor,
      status: scheduledFor ? 'scheduled' : 'pending',
      createdBy: 'system',
    })

    await notification.save()
    console.log('Notification record created:', notification.id)

    // If scheduled for later, save and return
    if (scheduledFor) {
      return NextResponse.json({
        status: 'success',
        message: 'Notification scheduled successfully',
        data: notification,
      })
    }

    // Get target users
    const query =
      type === 'specific'
        ? { _id: { $in: userIds.map(id => new ObjectId(id)) } }
        : {
            notificationsEnabled: true,
            $or: [
              { expoPushToken: { $exists: true, $ne: null } },
              { pushToken: { $exists: true, $ne: null } },
            ],
          }
    console.log('Finding users with query:', query)

    const users = await User.find(query)
    console.log(
      'Found users:',
      users.map(u => ({
        id: u._id,
        hasToken: !!(u.pushToken || u.expoPushToken),
        notificationsEnabled: u.notificationsEnabled,
        tokenType: typeof (u.pushToken || u.expoPushToken),
        token: u.pushToken || u.expoPushToken,
      }))
    )

    let successCount = 0
    let failureCount = 0
    let skippedCount = 0

    // Send notifications
    for (const user of users) {
      const token = user.pushToken || user.expoPushToken

      if (!token) {
        console.log('User has no push token:', user._id)
        skippedCount++
        continue
      }

      if (!user.notificationsEnabled) {
        console.log('User has notifications disabled:', user._id)
        skippedCount++
        continue
      }

      try {
        console.log('Attempting to send notification to user:', {
          userId: user._id,
          token,
          title,
          message,
        })

        await NotificationService.sendPushNotification(token, title, message, {
          link,
          notificationId: notification.id,
        })

        successCount++
        console.log('Successfully sent notification to user:', user._id)
      } catch (error) {
        console.error('Failed to send notification to user:', {
          userId: user._id,
          error: error.message,
          stack: error.stack,
        })
        failureCount++
      }
    }

    // Update notification status
    notification.status = successCount > 0 ? 'sent' : 'failed'
    notification.successCount = successCount
    notification.failureCount = failureCount
    notification.sentAt = new Date()
    await notification.save()

    console.log('Notification sending complete:', {
      id: notification.id,
      successCount,
      failureCount,
      skippedCount,
      totalUsers: users.length,
    })

    return NextResponse.json({
      status: 'success',
      message: `Notification sent successfully to ${successCount} users`,
      data: {
        notification,
        successCount,
        failureCount,
        skippedCount,
        total: users.length,
      },
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

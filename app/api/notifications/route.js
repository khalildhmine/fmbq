import { apiHandler, setJson } from '@/helpers/api'
import { connectToDatabase } from '@/helpers/db'
import { NotificationService } from '@/services/notifications.service'
import joi from 'joi'
import { admin } from '@/config/firebase.config'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/helpers/jwt'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

// Handle notification token updates
export const POST = apiHandler(
  async req => {
    try {
      // Get user ID from JWT token
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return setJson(
          {
            success: false,
            message: 'Authorization token is required',
          },
          401
        )
      }

      const token = authHeader.split(' ')[1]
      let decodedToken
      try {
        decodedToken = await verifyToken(token)
      } catch (error) {
        return setJson(
          {
            success: false,
            message: 'Invalid authorization token',
          },
          401
        )
      }

      const userId = decodedToken.userId
      if (!userId) {
        return setJson(
          {
            success: false,
            message: 'User ID not found in token',
          },
          400
        )
      }

      const { expoPushToken, notificationsEnabled } = await req.json()

      console.log('Updating notification settings for user:', userId)
      console.log('Received data:', { expoPushToken, notificationsEnabled })

      // Connect to database and update user directly
      const { db } = await connectToDatabase()

      try {
        // Convert string ID to ObjectId
        const objectId = new ObjectId(userId)

        const result = await db.collection('users').updateOne(
          { _id: objectId },
          {
            $set: {
              pushToken: expoPushToken, // Store as pushToken in the database
              notificationsEnabled,
              updatedAt: new Date(),
            },
          }
        )

        if (result.matchedCount === 0) {
          return setJson(
            {
              success: false,
              message: 'User not found',
            },
            404
          )
        }

        // Fetch the updated user
        const updatedUser = await db.collection('users').findOne({ _id: objectId })

        console.log('Updated user notification settings:', {
          userId,
          pushToken: updatedUser.pushToken,
          notificationsEnabled: updatedUser.notificationsEnabled,
        })

        return setJson({
          success: true,
          message: 'Notification settings updated successfully',
          data: {
            expoPushToken: updatedUser.pushToken, // Return as expoPushToken for mobile app
            notificationsEnabled: updatedUser.notificationsEnabled,
          },
        })
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        return setJson(
          {
            success: false,
            message: 'Failed to update notification settings in database',
          },
          500
        )
      }
    } catch (error) {
      console.error('Notification update error:', error)
      return setJson(
        {
          success: false,
          message: error.message || 'Failed to update notification settings',
        },
        500
      )
    }
  },
  {
    isJwt: true,
    schema: joi.object({
      expoPushToken: joi.string().required(),
      notificationsEnabled: joi.boolean().required(),
    }),
  }
)

// Send test notification
const testNotification = apiHandler(
  async req => {
    try {
      // Get user ID from JWT token
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return setJson(
          {
            success: false,
            message: 'Authorization token is required',
          },
          401
        )
      }

      const token = authHeader.split(' ')[1]
      const decodedToken = await verifyToken(token)
      const userId = decodedToken.userId

      if (!userId) {
        return setJson(
          {
            success: false,
            message: 'User ID is required',
          },
          400
        )
      }

      const { db } = await connectToDatabase()

      try {
        // Convert string ID to ObjectId
        const objectId = new ObjectId(userId)
        const user = await db.collection('users').findOne({ _id: objectId })

        if (!user) {
          return setJson(
            {
              success: false,
              message: 'User not found',
            },
            404
          )
        }

        if (!user.expoPushToken || !user.notificationsEnabled) {
          return setJson(
            {
              success: false,
              message: 'Notifications not enabled for this user',
            },
            400
          )
        }

        const result = await NotificationService.sendPushNotification(
          user.expoPushToken,
          'Test Notification',
          'This is a test notification'
        )

        return setJson({
          success: true,
          result,
        })
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        return setJson(
          {
            success: false,
            message: 'Failed to fetch user from database',
          },
          500
        )
      }
    } catch (error) {
      console.error('Test notification error:', error)
      return setJson(
        {
          success: false,
          message: error.message || 'Failed to send test notification',
        },
        500
      )
    }
  },
  { isJwt: true }
)

export const GET = testNotification
export const dynamic = 'force-dynamic'

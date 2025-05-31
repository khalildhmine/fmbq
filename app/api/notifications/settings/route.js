import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import joi from 'joi'

const schema = joi.object({
  expoPushToken: joi.string().allow(''),
  notificationsEnabled: joi.boolean().required(),
})

// Helper function to verify token and get user ID
const getUserIdFromToken = async req => {
  try {
    // First try Authorization header
    let token = req.headers.get('authorization')?.replace('Bearer ', '')

    // If no token in Authorization header, try to get from cookie
    if (!token) {
      const cookieHeader = req.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
        if (tokenCookie) {
          token = tokenCookie.split('=')[1]
        }
      }
    }

    if (!token) {
      throw new Error('No authentication token found')
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )

    const userId = decoded.id || decoded.userId
    if (!userId) {
      throw new Error('No user ID found in token')
    }

    return userId
  } catch (error) {
    console.error('Token verification error:', error)
    throw error
  }
}

export async function GET(req) {
  try {
    const userId = await getUserIdFromToken(req)
    const { db } = await connectToDatabase()
    const objectId = new ObjectId(userId)

    console.log('Getting notification settings for user:', userId)
    const user = await db.collection('users').findOne({ _id: objectId })

    if (!user) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 })
    }

    console.log('Found user notification settings:', {
      expoPushToken: user.expoPushToken,
      notificationsEnabled: user.notificationsEnabled,
    })

    return NextResponse.json({
      status: 'success',
      data: {
        expoPushToken: user.expoPushToken || '',
        notificationsEnabled: !!user.notificationsEnabled,
      },
    })
  } catch (error) {
    console.error('Error getting notification settings:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get notification settings',
      },
      { status: error.message.includes('authentication') ? 401 : 500 }
    )
  }
}

export async function POST(req) {
  try {
    const userId = await getUserIdFromToken(req)

    // Validate request body
    const body = await req.json()
    const { error, value } = schema.validate(body)
    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.details[0].message },
        { status: 400 }
      )
    }

    const { expoPushToken, notificationsEnabled } = value
    console.log('Updating notification settings:', { userId, expoPushToken, notificationsEnabled })

    // Connect to database
    const { db } = await connectToDatabase()

    // First check if this token is already assigned to another user
    if (expoPushToken) {
      const existingUser = await db.collection('users').findOne({
        _id: { $ne: new ObjectId(userId) },
        $or: [{ expoPushToken }, { pushToken: expoPushToken }],
      })

      if (existingUser) {
        console.log('Token already exists for another user:', existingUser._id)
        // Remove token from other user
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          {
            $set: {
              expoPushToken: null,
              pushToken: null,
              notificationsEnabled: false,
              updatedAt: new Date(),
            },
          }
        )
      }
    }

    // Update current user
    const objectId = new ObjectId(userId)
    const result = await db.collection('users').findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          expoPushToken,
          pushToken: expoPushToken, // Keep both fields in sync
          notificationsEnabled,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 })
    }

    console.log('Update result:', result.value)

    return NextResponse.json({
      status: 'success',
      data: {
        expoPushToken: result.value.expoPushToken || '',
        notificationsEnabled: !!result.value.notificationsEnabled,
      },
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)

    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { status: 'error', message: 'Authentication failed' },
        { status: 401 }
      )
    } else if (error.message.includes('validation')) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 400 })
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Failed to update notification settings' },
        { status: 500 }
      )
    }
  }
}

export const dynamic = 'force-dynamic'

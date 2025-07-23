import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import User from '@/models/User'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  console.log('GET /api/notifications/settings')
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      console.log('Unauthorized GET request')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    console.log('Looking for user:', authResult.id)

    const user = await User.findById(authResult.id).lean()
    if (!user) {
      console.log('User not found:', authResult.id)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    let enabled = false
    let expoPushToken = null

    if (user.notificationSettings?.enabled === true) {
      enabled = true
      expoPushToken = user.notificationSettings.expoPushToken || null
    }

    console.log('Returning settings:', { enabled, expoPushToken })
    return NextResponse.json({ success: true, data: { enabled, expoPushToken } })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const body = await request.json()

    console.log('Update notification settings:', {
      userId: authResult.id,
      settings: body,
    })

    // Find the user first
    const user = await User.findById(authResult.id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Use direct object update instead of the method if it's not available
    try {
      // Try using the method first
      await user.updateNotificationSettings({
        enabled: body.enabled,
        expoPushToken: body.expoPushToken,
      })
    } catch (methodError) {
      console.log('Method not available, falling back to direct update')
      // Fallback to direct update
      user.notificationSettings = {
        enabled: body.enabled,
        expoPushToken: body.expoPushToken,
        updatedAt: new Date(),
      }
      user.notificationsEnabled = body.enabled
      user.expoPushToken = body.expoPushToken
      user.pushToken = body.expoPushToken
      await user.save()
    }

    // Return the updated settings
    return NextResponse.json({
      success: true,
      data: {
        enabled: user.notificationSettings?.enabled === true,
        expoPushToken: user.notificationSettings?.expoPushToken || user.expoPushToken || null,
      },
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

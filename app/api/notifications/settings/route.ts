import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import User from '@/models/User'
import { verifyAuth } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    console.log('[NotificationSettings][PUT] Request received')
    const authResult = await verifyAuth(request)
    console.log('[NotificationSettings][PUT] Auth result:', authResult)
    if (!authResult.success || !authResult.id) {
      console.warn('[NotificationSettings][PUT] Unauthorized access attempt')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    console.log('[NotificationSettings][PUT] Connected to database')

    const body = await request.json()
    console.log('[NotificationSettings][PUT] Request body:', body)

    const user = await User.findById(authResult.id)
    if (!user) {
      console.warn('[NotificationSettings][PUT] User not found:', authResult.id)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (body.enabled === false) {
      // Prepare update for disabling notifications
      var update = {
        notificationSettings: {
          enabled: false,
          expoPushToken: null,
          updatedAt: new Date(),
        },
        notificationsEnabled: false,
        expoPushToken: null,
        pushToken: null,
      }
    } else {
      // Prepare update for enabling notifications
      var update = {
        notificationSettings: {
          enabled: true,
          expoPushToken: body.expoPushToken || null,
          updatedAt: new Date(),
        },
        notificationsEnabled: true,
        expoPushToken: body.expoPushToken || null,
        pushToken: body.expoPushToken || null,
      }
      // Ensure pushTokens is always an array and add if not present
      if (body.expoPushToken) {
        update.$addToSet = { pushTokens: body.expoPushToken }
      }
    }

    // Update only the relevant fields, bypassing address validation
    const savedUser = await User.findByIdAndUpdate(
      authResult.id,
      update,
      { new: true }
    )

    if (!savedUser) {
      console.warn('[NotificationSettings][PUT] User not found:', authResult.id)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    console.log('[NotificationSettings][PUT] User saved:', {
      id: savedUser._id,
      notificationSettings: savedUser.notificationSettings,
      notificationsEnabled: savedUser.notificationsEnabled,
      expoPushToken: savedUser.expoPushToken,
    })

    return NextResponse.json({
      success: true,
      data: {
        enabled: savedUser.notificationSettings?.enabled === true,
        expoPushToken: savedUser.notificationSettings?.expoPushToken || null,
      },
    })
  } catch (error) {
    console.error('[NotificationSettings][PUT] Error updating notification settings:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log('[NotificationSettings][GET] Request received')
    const authResult = await verifyAuth(request)
    console.log('[NotificationSettings][GET] Auth result:', authResult)
    if (!authResult.success || !authResult.id) {
      console.warn('[NotificationSettings][GET] Unauthorized access attempt')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    console.log('[NotificationSettings][GET] Connected to database')

    // Explicitly type user as a single document or null
    const user = await User.findById(authResult.id).lean() as
      | (Record<string, any> & { notificationSettings?: any })
      | null

    console.log('[NotificationSettings][GET] User data:', user)

    let enabled = false
    let expoPushToken = null
    if (user && user.notificationSettings) {
      enabled = user.notificationSettings.enabled === true
      expoPushToken = user.notificationSettings.expoPushToken || null
    }

    return NextResponse.json({
      success: true,
      data: { enabled, expoPushToken },
    })
  } catch (error) {
    console.error('[NotificationSettings][GET] Error fetching notification settings:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

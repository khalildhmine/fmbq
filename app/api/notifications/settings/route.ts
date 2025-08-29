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

    // Ensure notificationSettings subdocument exists
    if (!user.notificationSettings) {
      user.notificationSettings = { enabled: false, expoPushToken: null } as any
    }

    if (body.enabled === false) {
      // Disable notifications
      user.notificationSettings.enabled = false
      user.notificationSettings.expoPushToken = null
      user.notificationsEnabled = false
      user.expoPushToken = null
      user.pushToken = null
      // Remove from pushTokens array if it exists
      if (body.expoPushToken) {
        user.pushTokens = user.pushTokens.filter((token: string) => token !== body.expoPushToken)
      }
    } else {
      // Enable notifications
      user.notificationSettings.enabled = true
      user.notificationSettings.expoPushToken = body.expoPushToken || null
      user.notificationsEnabled = true
      user.expoPushToken = body.expoPushToken || null
      user.pushToken = body.expoPushToken || null
      // Add to pushTokens array if not already present
      if (body.expoPushToken && !user.pushTokens.includes(body.expoPushToken)) {
        user.pushTokens.push(body.expoPushToken)
      }
    }

    // Mark notificationSettings as modified to ensure Mongoose saves nested changes
    user.markModified('notificationSettings')

    const savedUser = await user.save()

    console.log('[NotificationSettings][PUT] User saved:', {
      id: savedUser._id,
      notificationSettings: savedUser.notificationSettings,
      notificationsEnabled: savedUser.notificationsEnabled,
      expoPushToken: savedUser.expoPushToken,
      pushToken: savedUser.pushToken,
      pushTokens: savedUser.pushTokens,
    })

    return NextResponse.json({
      success: true,
      data: {
        enabled: savedUser.notificationSettings?.enabled === true,
        expoPushToken: savedUser.notificationSettings?.expoPushToken || null,
      },
    })
  } catch (error: any) {
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

    // Retrieve the user document without .lean() to ensure full Mongoose document behavior
    const user = await User.findById(authResult.id)

    console.log('[NotificationSettings][GET] User data:', {
      id: user?._id,
      notificationSettings: user?.notificationSettings,
      notificationsEnabled: user?.notificationsEnabled,
      expoPushToken: user?.expoPushToken,
      pushToken: user?.pushToken,
      pushTokens: user?.pushTokens,
    })

    let enabled = false
    let expoPushToken = null
    if (user && user.notificationSettings) {
      enabled = user.notificationSettings.enabled === true
      expoPushToken = user.notificationSettings.expoPushToken || null
    } else if (user && user.notificationsEnabled !== undefined) {
      // Fallback for older schema or if notificationSettings is missing
      enabled = user.notificationsEnabled === true
      expoPushToken = user.expoPushToken || user.pushToken || null
    }

    return NextResponse.json({
      success: true,
      data: { enabled, expoPushToken },
    })
  } catch (error: any) {
    console.error('[NotificationSettings][GET] Error fetching notification settings:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

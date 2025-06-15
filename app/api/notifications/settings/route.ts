import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { validateToken } from '@/helpers/auth'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const authResult = await validateToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { expoPushToken, notificationsEnabled } = await request.json()

    if (!expoPushToken) {
      return NextResponse.json({ message: 'Expo push token is required' }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(authResult.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      expoPushToken,
      enabled: notificationsEnabled,
    }

    await user.save()

    return NextResponse.json({
      status: 'success',
      data: user.notificationSettings,
    })
  } catch (error: any) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await validateToken(request)
    if (!authResult.success) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(authResult.userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: 'success',
      data: user.notificationSettings || {
        enabled: false,
        expoPushToken: null,
      },
    })
  } catch (error: any) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 })
  }
}

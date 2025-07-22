import PushToken from '@/models/pushToken'
import { connectToDatabase } from '../../../helpers/db'
// Correct import path for models folder at project root:
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectToDatabase()

    const { token, anonymousId, deviceInfo, userId } = await req.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Expo push token is required' },
        { status: 400 }
      )
    }

    const updatedToken = await PushToken.findOneAndUpdate(
      { token },
      {
        token,
        anonymousId,
        deviceInfo,
        userId,
        lastActiveAt: new Date(),
        isActive: true,
        $setOnInsert: { firstSeenAt: new Date() },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedToken,
    })
  } catch (error) {
    console.error('Error registering push token:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

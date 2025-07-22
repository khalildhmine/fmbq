import PushToken from '@/models/pushToken'
import { connectToDatabase } from '../../../helpers/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectToDatabase()
    // Populate user details for registered tokens
    const tokens = await PushToken.find({})
      .populate({
        path: 'userId',
        select: 'name email mobile pushToken expoPushToken notificationSettings',
      })
      .lean()

    // Attach user details for easier access in frontend
    const tokensWithUser = tokens.map(token => ({
      ...token,
      user: token.userId || null,
      // For registered users, check if pushToken or expoPushToken exists
      isRegistered: !!(token.userId && (token.userId.pushToken || token.userId.expoPushToken)),
    }))

    return NextResponse.json({ success: true, tokens: tokensWithUser })
  } catch (error) {
    console.error('Error fetching push tokens:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

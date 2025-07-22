import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../helpers/db'
import fetch from 'node-fetch'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export async function POST(req) {
  try {
    await connectToDatabase()
    const { title, body, image, tokens } = await req.json()

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json({ success: false, message: 'No tokens provided' }, { status: 400 })
    }

    // Prepare messages for Expo push
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: { image },
      ...(image ? { image } : {}),
    }))

    // Send notifications in batches of 100 (Expo limit)
    let sentCount = 0
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100)
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      const result = await response.json()
      // Optionally handle invalid tokens here (DeviceNotRegistered)
      sentCount += batch.length
    }

    return NextResponse.json({
      success: true,
      sentCount,
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

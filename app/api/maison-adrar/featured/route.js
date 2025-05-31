import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import MaisonAdrar from '@/models/MaisonAdrar'

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    // Connect to database
    await connectToDatabase()

    // Fetch featured perfumes
    const perfumes = await MaisonAdrar.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: perfumes,
    })
  } catch (error) {
    console.error('Error fetching featured Maison Adrar perfumes:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured perfumes', error: error.message },
      { status: 500 }
    )
  }
}

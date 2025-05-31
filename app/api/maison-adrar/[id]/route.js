import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import MaisonAdrar from '@/models/MaisonAdrar'
import { isValidObjectId } from 'mongoose'

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid perfume ID format' },
        { status: 400 }
      )
    }

    // Connect to database and get perfume
    await connectToDatabase()
    const perfume = await MaisonAdrar.findById(id).lean()

    if (!perfume) {
      return NextResponse.json({ success: false, message: 'Perfume not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: perfume })
  } catch (error) {
    console.error('Error fetching perfume details:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch perfume details',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

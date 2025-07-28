import { connectToDatabase } from '@/helpers/db'
import Melhaf from '@/models/melhaf'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  try {
    const id = params?.id

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ Invalid melhaf ID:', id)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid melhaf ID format',
        },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching melhaf:', { id })

    await connectToDatabase()
    console.log('📡 Database connected')

    const melhaf = await Melhaf.findById(id)

    if (!melhaf) {
      console.log('❌ Melhaf not found:', id)
      return NextResponse.json(
        {
          success: false,
          message: 'Melhaf not found',
        },
        { status: 404 }
      )
    }

    console.log('✅ Found melhaf:', {
      id: melhaf._id,
      name: melhaf.name,
    })

    return NextResponse.json({
      success: true,
      data: melhaf,
    })
  } catch (error) {
    console.error('❌ Error fetching melhaf:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch melhaf',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// app/api/melhaf/[id]/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Melhaf from '../../../../models/melhaf'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  console.log('🔍 GET /api/melhaf/[id] called with ID:', params.id)

  try {
    await connectToDatabase()
    console.log('✅ Database connected')

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.error('❌ Invalid melhaf ID format')
      return NextResponse.json(
        { success: false, message: 'Invalid melhaf ID format' },
        { status: 400 }
      )
    }

    const melhaf = await Melhaf.findById(params.id).select('-__v').lean()

    if (!melhaf) {
      console.error('❌ Melhaf not found with ID:', params.id)
      return NextResponse.json({ success: false, message: 'Melhaf not found' }, { status: 404 })
    }

    console.log('✅ Successfully found melhaf:', melhaf._id)
    return NextResponse.json({
      success: true,
      data: {
        ...melhaf,
        id: melhaf._id.toString(),
        collection: melhaf.collectionName, // Map to frontend expected field
        finalPrice: melhaf.colorVariants?.[0]?.price || 0,
      },
    })
  } catch (error) {
    console.error('❌ Error in GET /api/melhaf/[id]:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

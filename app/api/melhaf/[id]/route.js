import { connectToDatabase } from '@/helpers/db'
import Melhaf from '@/models/melhaf'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    const { id } = params
    console.log('Fetching melhaf with ID:', id)

    const melhaf = await Melhaf.findById(id).lean()

    if (!melhaf) {
      return NextResponse.json(
        {
          success: false,
          message: 'Melhaf not found',
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,
      data: melhaf,
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch melhaf',
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}

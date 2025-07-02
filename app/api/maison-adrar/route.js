// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'
import MaisonAdrar from '@/models/MaisonAdrar'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const perfumes = await MaisonAdrar.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await MaisonAdrar.countDocuments()

    return NextResponse.json({
      success: true,
      hasData: true,
      hasError: false,
      status: 'success',
      data: {
        perfumes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      },
    })
  } catch (error) {
    console.error('Maison Adrar API Error:', error)
    return NextResponse.json(
      {
        success: false,
        hasData: false,
        hasError: true,
        status: 'error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

import { connectToDatabase } from '@/helpers/db'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  const { id } = params
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 20

  console.log('⭐ API - getBrandProducts called with brandId:', id)

  try {
    await connectToDatabase()

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Find products for the brand with pagination
    const products = await db
      .collection('products')
      .find({
        brand: id,
      })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await db.collection('products').countDocuments({
      brand: id,
    })

    return NextResponse.json({
      status: 'success',
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('⭐ API Error in getBrandProducts:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to fetch brand products',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

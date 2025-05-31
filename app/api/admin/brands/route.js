import { connectToDatabase } from '@/helpers/db'
import Brand from '@/models/brand'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectToDatabase()
    const data = await req.json()

    const brand = new Brand(data)
    await brand.save()

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    console.error('Create brand error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create brand' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    const brands = await Brand.find().sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: brands,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

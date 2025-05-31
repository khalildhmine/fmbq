import { connectToDatabase } from '@/helpers/db'
import Melhaf from '@/models/melhaf'
import { NextResponse } from 'next/server'

// GET single melhaf
export async function GET(req, { params }) {
  try {
    await connectToDatabase()

    // Extract and await the id parameter
    const { id } = await params
    const melhaf = await Melhaf.findById(id)

    if (!melhaf) {
      return NextResponse.json({ message: 'Melhaf not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: melhaf,
    })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// UPDATE melhaf
export async function PUT(req, { params }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const data = await req.json()

    // Format dates if they exist
    if (data.promotion?.startDate) {
      data.promotion.startDate = new Date(data.promotion.startDate)
    }
    if (data.promotion?.endDate) {
      data.promotion.endDate = new Date(data.promotion.endDate)
    }

    const melhaf = await Melhaf.findByIdAndUpdate(id, data, { new: true, runValidators: true })

    if (!melhaf) {
      return NextResponse.json({ message: 'Melhaf not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: melhaf,
    })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// DELETE melhaf
export async function DELETE(req, { params }) {
  try {
    await connectToDatabase()
    const melhaf = await Melhaf.findByIdAndDelete(params.id)

    if (!melhaf) {
      return NextResponse.json({ message: 'Melhaf not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Melhaf deleted successfully',
    })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

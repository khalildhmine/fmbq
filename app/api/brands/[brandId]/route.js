import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { Brand } from '@/models'

export async function GET(request, { params }) {
  try {
    await connectToDatabase()
    const brandId = await params.brandId // Await the dynamic parameter
    const brand = await Brand.findById(brandId)

    if (!brand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: brand })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch brand', error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase()
    const brandId = await params.brandId // Await the dynamic parameter

    // Validate brandId
    if (!brandId) {
      return NextResponse.json({ success: false, message: 'Invalid brand ID' }, { status: 400 })
    }

    const updateData = await request.json()

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No update data provided' },
        { status: 400 }
      )
    }

    // Update the brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!updatedBrand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      data: updatedBrand,
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update brand', error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()
    const brandId = await params.brandId // Await the dynamic parameter
    const deletedBrand = await Brand.findByIdAndDelete(brandId)

    if (!deletedBrand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete brand', error: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

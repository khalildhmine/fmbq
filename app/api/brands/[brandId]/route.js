import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { Brand } from '@/models'
import mongoose from 'mongoose'

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request, { params }) {
  try {
    await connectToDatabase()

    // Properly await and validate the brandId
    const brandId = await params.brandId
    if (!brandId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Brand ID is required',
        },
        { status: 400 }
      )
    }

    const brand = await Brand.findById(brandId).lean()

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: 'Brand not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch brand',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase()
    const brandId = params.brandId

    // Validate brandId
    if (!brandId) {
      return NextResponse.json({ success: false, message: 'Brand ID is required' }, { status: 400 })
    }

    const updateData = await request.json()

    // Validate required fields
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No update data provided' },
        { status: 400 }
      )
    }

    // Validate color format if provided
    if (updateData.color && !/^#([A-Fa-f0-9]{6})$/.test(updateData.color)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid color format. Must be a valid hex color (e.g., #FF0000)',
        },
        { status: 400 }
      )
    }

    // Validate URLs if provided
    if (updateData.logo && !/^https?:\/\/.+/.test(updateData.logo)) {
      return NextResponse.json(
        { success: false, message: 'Logo must be a valid URL' },
        { status: 400 }
      )
    }

    // Validate slug format if provided
    if (updateData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updateData.slug)) {
      return NextResponse.json({ success: false, message: 'Invalid slug format' }, { status: 400 })
    }

    // Check for unique constraints
    if (updateData.slug || updateData.name) {
      const existingBrand = await Brand.findOne({
        _id: { $ne: brandId },
        $or: [{ slug: updateData.slug?.toLowerCase() }, { name: updateData.name }],
      })

      if (existingBrand) {
        return NextResponse.json(
          {
            success: false,
            message: `A brand with this ${existingBrand.name === updateData.name ? 'name' : 'slug'} already exists`,
          },
          { status: 400 }
        )
      }
    }

    // Update the brand with validation
    const updatedBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    ).lean()

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

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      )
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        {
          success: false,
          message: `A brand with this ${field} already exists`,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update brand',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase()
    const brandId = params.brandId

    if (!brandId) {
      return NextResponse.json({ success: false, message: 'Brand ID is required' }, { status: 400 })
    }

    const deletedBrand = await Brand.findByIdAndDelete(brandId)

    if (!deletedBrand) {
      return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
      data: deletedBrand,
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete brand',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

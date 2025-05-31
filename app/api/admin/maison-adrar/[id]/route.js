import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'

import { verifyAuth, isAdmin } from '@/lib/auth'
import MaisonAdrar from '@/models/MaisonAdrar'
import { isValidObjectId } from 'mongoose'

// Get a single perfume by ID
export async function GET(request, { params }) {
  try {
    // Verify user authentication
    const authResult = await verifyAuth(request)

    if (!authResult.success || !isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 })
    }

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

// Update a perfume
export async function PUT(request, { params }) {
  try {
    // Verify user authentication
    const authResult = await verifyAuth(request)

    if (!authResult.success || !isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 })
    }

    const { id } = params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid perfume ID format' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Connect to database
    await connectToDatabase()

    // Ensure type is lowercase
    if (body.type) {
      body.type = body.type.toLowerCase()
    }

    // Convert string values to proper types
    if (body.price) body.price = parseFloat(body.price)
    if (body.discount) body.discount = parseFloat(body.discount)
    if (body.inStock) body.inStock = parseInt(body.inStock)

    // Update perfume
    const updatedPerfume = await MaisonAdrar.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!updatedPerfume) {
      return NextResponse.json({ success: false, message: 'Perfume not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfume updated successfully',
      data: updatedPerfume,
    })
  } catch (error) {
    console.error('Error updating perfume:', error)

    // Handle validation errors
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

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update perfume',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Delete a perfume
export async function DELETE(request, { params }) {
  try {
    // Verify user authentication
    const authResult = await verifyAuth(request)

    if (!authResult.success || !isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 })
    }

    const { id } = params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid perfume ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Delete perfume
    const deletedPerfume = await MaisonAdrar.findByIdAndDelete(id)

    if (!deletedPerfume) {
      return NextResponse.json({ success: false, message: 'Perfume not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfume deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting perfume:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete perfume',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

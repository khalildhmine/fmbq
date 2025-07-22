import joi from 'joi'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'

// Schema for user update validation
const updateUserSchema = joi.object({
  name: joi.string().min(2).max(50),
  email: joi.string().email(),
  mobile: joi.string().allow(''),
  role: joi.string().valid('user', 'admin'),
  isVerified: joi.boolean(),
  notificationsEnabled: joi.boolean(),
  avatar: joi.string().allow(''),
  address: joi
    .object({
      street: joi.string().allow(''),
      province: joi.string().allow(''),
      city: joi.string().allow(''),
      area: joi.string().allow(''),
      postalCode: joi.string().allow(''),
    })
    .allow(null),
})

// PUT handler for updating user
export async function PUT(request, context) {
  await connectToDatabase()

  try {
    // Get and validate user ID from params
    const { id } = await context.params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid user ID is required' },
        { status: 400 }
      )
    }

    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
    }

    // Validate the request body
    const { error, value } = updateUserSchema.validate(body, { stripUnknown: true })
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.details.map(err => err.message),
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: value },
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    )

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update user',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          notificationsEnabled: updatedUser.notificationsEnabled,
          avatar: updatedUser.avatar,
          address: updatedUser.address,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Indicate that this is a dynamic route
export const dynamic = 'force-dynamic'

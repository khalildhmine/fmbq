import joi from 'joi'
import { NextResponse } from 'next/server'
import { usersRepo } from '@/helpers'

// Schema for user update validation
const updateUserSchema = joi.object({
  name: joi.string().min(2).max(50),
  email: joi.string().email(),
  phone: joi.string().allow(''),
  role: joi.string().valid('user', 'admin'),
  active: joi.boolean(),
  verified: joi.boolean(),
})

// PUT handler for updating user
export async function PUT(request, { params: { id } }) {
  try {
    // Validate user ID
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
    const { error, value } = updateUserSchema.validate(body)
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.details,
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await usersRepo.getById(id)
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
    const updatedUser = await usersRepo.update(id, value)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
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

import { connectToDatabase } from '@/helpers/db'
import { ObjectId } from 'mongodb'
import { setJson } from '@/helpers/api'
import joi from 'joi'

// Address validation schema for partial updates
const addressUpdateSchema = joi
  .object({
    fullName: joi.string(),
    phone: joi.string().pattern(/^(?:\+?222)?[234567]\d{7}$/), // Mauritanian phone numbers
    streetAddress: joi.string(),
    city: joi.string(),
    province: joi.string().allow(''), // Optional for Mauritania
    area: joi.string().allow(''), // Optional
    postalCode: joi.string().default('0000'), // Optional with default
    isDefault: joi.boolean(),
  })
  .min(1) // Require at least one field to be present

// Helper to get user ID from request
const getUserIdFromRequest = req => {
  const userId = req.headers.get('userid') || req.headers.get('x-user-id')
  if (!userId) {
    console.log('No user ID found in headers')
    return null
  }
  console.log('Using user ID from header:', userId)
  return userId
}

// PATCH endpoint to update an address
export async function PATCH(req, context) {
  try {
    console.log('PATCH /api/user/addresses/[addressId] - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    // Get addressId from async params
    const { addressId } = await context.params
    if (!addressId) {
      return setJson({ message: 'Address ID is required' }, 400)
    }

    const body = await req.json()
    console.log('Update address request body:', body)

    const { error, value: addressUpdates } = addressUpdateSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      console.error('Validation error:', error.details)
      return setJson(
        {
          message: 'Invalid address data',
          errors: error.details.map(detail => detail.message),
        },
        400
      )
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    const addresses = user.addresses || []
    const addressIndex = addresses.findIndex(addr => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return setJson({ message: 'Address not found' }, 404)
    }

    // Handle isDefault flag
    if (addressUpdates.isDefault) {
      addresses.forEach((addr, idx) => {
        if (idx !== addressIndex) {
          addr.isDefault = false
        }
      })
    }

    // Merge existing address with updates
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...addressUpdates,
      updatedAt: new Date(),
    }

    console.log('Updated address:', addresses[addressIndex])

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          addresses,
          updatedAt: new Date(),
        },
      }
    )

    return setJson(
      {
        success: true,
        data: addresses[addressIndex],
        message: 'Address updated successfully',
      },
      200
    )
  } catch (error) {
    console.error('Error in PATCH /api/user/addresses/[addressId]:', error)
    return setJson(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      500
    )
  }
}

// DELETE endpoint to remove an address
export async function DELETE(req, context) {
  try {
    console.log('DELETE /api/user/addresses/[addressId] - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    // Get addressId from async params
    const { addressId } = await context.params
    if (!addressId) {
      return setJson({ message: 'Address ID is required' }, 400)
    }

    console.log('Deleting address:', addressId, 'for user:', userId)

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    const addresses = user.addresses || []
    const addressIndex = addresses.findIndex(addr => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return setJson({ message: 'Address not found' }, 404)
    }

    const wasDefault = addresses[addressIndex].isDefault

    addresses.splice(addressIndex, 1)

    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          addresses,
          updatedAt: new Date(),
        },
      }
    )

    return setJson(
      {
        success: true,
        message: 'Address deleted successfully',
      },
      200
    )
  } catch (error) {
    console.error('Error in DELETE /api/user/addresses/[addressId]:', error)
    return setJson(
      {
        success: false,
        message: error.message || 'Internal server error',
      },
      500
    )
  }
}

export const dynamic = 'force-dynamic'

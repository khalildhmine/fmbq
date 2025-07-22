import { connectToDatabase } from '@/helpers/db'
import { ObjectId } from 'mongodb'
import { setJson } from '@/helpers/api'
import joi from 'joi'

// Address validation schema
const addressSchema = joi.object({
  fullName: joi.string().required(),
  phone: joi
    .string()
    .required()
    .pattern(/^(?:\+?222)?[234567]\d{7}$/), // Mauritanian phone numbers
  streetAddress: joi.string().required(),
  city: joi.string().required(),
  province: joi.string().allow(''), // Optional for Mauritania
  area: joi.string().allow(''), // Optional
  postalCode: joi.string().default('0000'), // Optional with default
  isDefault: joi.boolean().default(false),
})

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

// GET endpoint to fetch user addresses
export async function GET(req) {
  try {
    console.log('GET /api/user/addresses - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    const { db } = await connectToDatabase()
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    const addresses = user.addresses || []
    return setJson({ data: addresses }, 200)
  } catch (error) {
    console.error('GET /api/user/addresses error:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// POST endpoint to add a new address
export async function POST(req) {
  try {
    console.log('POST /api/user/addresses - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    const body = await req.json()
    console.log('Request body:', body)

    const { error, value: address } = addressSchema.validate(body, {
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

    const newAddress = {
      ...address,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const addresses = user.addresses || []
    if (newAddress.isDefault) {
      addresses.forEach(addr => (addr.isDefault = false))
    } else if (addresses.length === 0) {
      newAddress.isDefault = true
    }

    addresses.push(newAddress)

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          addresses,
          updatedAt: new Date(),
        },
      }
    )

    return setJson({ data: newAddress }, 201)
  } catch (error) {
    console.error('POST /api/user/addresses error:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// PUT endpoint to update an address
export async function PUT(req) {
  try {
    console.log('PUT /api/user/addresses - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    const body = await req.json()
    const { _id, ...addressData } = body

    if (!_id) {
      return setJson({ message: 'Address ID is required' }, 400)
    }

    const { error, value: address } = addressSchema.validate(addressData)
    if (error) {
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
    const addressIndex = addresses.findIndex(addr => addr._id.toString() === _id)
    if (addressIndex === -1) {
      return setJson({ message: 'Address not found' }, 404)
    }

    if (address.isDefault) {
      addresses.forEach(addr => (addr.isDefault = false))
    }

    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...address,
      updatedAt: new Date(),
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

    return setJson({ data: addresses[addressIndex] }, 200)
  } catch (error) {
    console.error('Error in PUT /api/user/addresses:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// DELETE endpoint to remove an address
export async function DELETE(req) {
  try {
    console.log('DELETE /api/user/addresses - Request received')
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    const url = new URL(req.url)
    const addressId = url.searchParams.get('id')
    if (!addressId) {
      return setJson({ message: 'Address ID is required' }, 400)
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

    const wasDefault = addresses[addressIndex].isDefault

    if (wasDefault && addresses.length === 1) {
      return setJson({ message: 'Cannot delete the only address' }, 400)
    }

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

    return setJson({ message: 'Address deleted successfully' }, 200)
  } catch (error) {
    console.error('DELETE /api/user/addresses error:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

export const dynamic = 'force-dynamic'

import { usersRepo } from 'helpers'
import jwt from 'jsonwebtoken'
import { setJson } from '@/helpers/api'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/helpers/db'
import joi from 'joi'

// Address validation schema
const addressSchema = joi.object({
  province: joi
    .object({
      code: joi.string().required(),
      name: joi.string().required(),
    })
    .required(),
  city: joi
    .object({
      code: joi.string().required(),
      name: joi.string().required(),
    })
    .required(),
  area: joi
    .object({
      code: joi.string().required(),
      name: joi.string().required(),
    })
    .required(),
  street: joi.string().required(),
  postalCode: joi.string().allow(''),
  isDefault: joi.boolean().default(false),
  label: joi.string().valid('home', 'work', 'other').default('home'),
  recipientName: joi.string().required(),
  recipientPhone: joi.string().required(),
})

// Helper to extract token from request
const getTokenFromRequest = req => {
  // First check cookies
  const cookieToken = req.cookies.get('token')?.value
  if (cookieToken) return cookieToken

  // Then check Authorization header
  const authHeader = req.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

// Helper to get user ID from request
const getUserIdFromRequest = req => {
  // Try to get from headers first
  const userId = req.headers.get('userid') || req.headers.get('x-user-id')
  if (userId) {
    console.log('GET /api/auth/user/address - Using user ID from header:', userId)
    return userId
  }

  // Otherwise decode from token
  const token = getTokenFromRequest(req)
  if (!token) return null

  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )
    console.log('GET /api/auth/user/address - Extracted user ID from token:', decoded.id)
    return decoded.id
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Direct function to get user from MongoDB
const findUserDirectly = async (userId, req) => {
  try {
    console.log('Trying direct MongoDB query for user:', userId)
    const { db } = await connectToDatabase()

    // Try multiple query approaches
    const queries = [
      // Try ObjectId first
      async () => {
        try {
          const objectId = new ObjectId(userId)
          console.log('Trying with ObjectId:', objectId)
          return await db.collection('users').findOne({ _id: objectId })
        } catch (e) {
          console.log('ObjectId lookup failed:', e.message)
          return null
        }
      },

      // Try string ID
      async () => {
        console.log('Trying with string ID:', userId)
        return await db.collection('users').findOne({ _id: userId })
      },

      // Try string comparison (less efficient)
      async () => {
        console.log('Trying with string comparison')
        const allUsers = await db.collection('users').find({}).toArray()
        return allUsers.find(u => String(u._id) === userId) || null
      },
    ]

    // Try each query strategy until we find the user
    for (const queryFn of queries) {
      const user = await queryFn()
      if (user) {
        console.log('Found user with query strategy:', user._id)
        return user
      }
    }

    console.log('All direct query strategies failed')
    return null
  } catch (error) {
    console.error('Direct MongoDB query failed:', error)
    return null
  }
}

// GET endpoint to fetch user addresses
export async function GET(req) {
  try {
    console.log('GET /api/auth/user/address - Request received')
    console.log('Headers:', Object.fromEntries([...req.headers.entries()]))

    const userId = getUserIdFromRequest(req)
    if (!userId) {
      console.log('GET /api/auth/user/address - No user ID found')
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    console.log(`GET /api/auth/user/address - Looking up user with ID: ${userId}`)

    // First try to find user directly through MongoDB
    const directUser = await findUserDirectly(userId, req)
    if (directUser) {
      console.log(`GET /api/auth/user/address - Found user directly: ${directUser._id}`)

      // Return array of addresses or empty array if none exist
      const addresses = directUser.addresses || []
      if (addresses.length === 0 && directUser.address) {
        // Convert legacy single address to array format
        addresses.push({
          ...directUser.address,
          isDefault: true,
          _id: new ObjectId(),
          createdAt: new Date(),
        })
      }

      return setJson({ data: addresses }, 200)
    }

    // Fall back to repository approach
    let user = await usersRepo.getById(userId)
    if (!user) {
      console.log(`GET /api/auth/user/address - User not found with ID: ${userId}`)
      return setJson({ message: 'User not found' }, 404)
    }

    // Handle legacy single address format
    const addresses = user.addresses || []
    if (addresses.length === 0 && user.address) {
      addresses.push({
        ...user.address,
        isDefault: true,
        _id: new ObjectId(),
        createdAt: new Date(),
      })
    }

    return setJson({ data: addresses }, 200)
  } catch (error) {
    console.error('Error in address API:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// POST endpoint to add a new address
export async function POST(req) {
  try {
    console.log('POST /api/auth/user/address - Request received')

    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    // Parse and validate request body
    const body = await req.json()
    const { error, value: address } = addressSchema.validate(body)
    if (error) {
      return setJson(
        {
          message: 'Invalid address data',
          errors: error.details.map(detail => detail.message),
        },
        400
      )
    }

    // Find user
    const { db } = await connectToDatabase()
    const user = await findUserDirectly(userId, req)
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    // Prepare new address
    const newAddress = {
      ...address,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Handle default address logic
    const addresses = user.addresses || []
    if (newAddress.isDefault) {
      // Remove default flag from other addresses
      addresses.forEach(addr => (addr.isDefault = false))
    } else if (addresses.length === 0) {
      // Make first address default
      newAddress.isDefault = true
    }

    // Add new address
    addresses.push(newAddress)

    // Update user
    await db.collection('users').updateOne(
      { _id: user._id },
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
        data: newAddress,
      },
      201
    )
  } catch (error) {
    console.error('Error adding address:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// PUT endpoint to update an address
export async function PUT(req) {
  try {
    console.log('PUT /api/auth/user/address - Request received')

    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    // Parse and validate request body
    const body = await req.json()
    const { addressId, address } = body

    if (!addressId) {
      return setJson({ message: 'Address ID is required' }, 400)
    }

    const { error, value: validatedAddress } = addressSchema.validate(address)
    if (error) {
      return setJson(
        {
          message: 'Invalid address data',
          errors: error.details.map(detail => detail.message),
        },
        400
      )
    }

    // Find user
    const { db } = await connectToDatabase()
    const user = await findUserDirectly(userId, req)
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    // Find address to update
    const addresses = user.addresses || []
    const addressIndex = addresses.findIndex(addr => String(addr._id) === String(addressId))
    if (addressIndex === -1) {
      return setJson({ message: 'Address not found' }, 404)
    }

    // Handle default address logic
    if (validatedAddress.isDefault) {
      addresses.forEach(addr => (addr.isDefault = false))
    }

    // Update address
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...validatedAddress,
      updatedAt: new Date(),
    }

    // Update user
    await db.collection('users').updateOne(
      { _id: user._id },
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
      },
      200
    )
  } catch (error) {
    console.error('Error updating address:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// DELETE endpoint to remove an address
export async function DELETE(req) {
  try {
    console.log('DELETE /api/auth/user/address - Request received')

    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    // Get address ID from URL
    const url = new URL(req.url)
    const addressId = url.searchParams.get('addressId')
    if (!addressId) {
      return setJson({ message: 'Address ID is required' }, 400)
    }

    // Find user
    const { db } = await connectToDatabase()
    const user = await findUserDirectly(userId, req)
    if (!user) {
      return setJson({ message: 'User not found' }, 404)
    }

    // Find and remove address
    const addresses = user.addresses || []
    const addressIndex = addresses.findIndex(addr => String(addr._id) === String(addressId))
    if (addressIndex === -1) {
      return setJson({ message: 'Address not found' }, 404)
    }

    // Don't allow deleting the only default address
    if (addresses[addressIndex].isDefault && addresses.length === 1) {
      return setJson({ message: 'Cannot delete the only address' }, 400)
    }

    // Remove address
    addresses.splice(addressIndex, 1)

    // If we removed the default address, make another one default
    if (addresses.length > 0 && addresses[addressIndex]?.isDefault) {
      addresses[0].isDefault = true
    }

    // Update user
    await db.collection('users').updateOne(
      { _id: user._id },
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
    console.error('Error deleting address:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

export const dynamic = 'force-dynamic'

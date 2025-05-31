import { usersRepo } from 'helpers'
import jwt from 'jsonwebtoken'
import { setJson } from '@/helpers/api'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/helpers/db'

// Helper to extract token from request
const getTokenFromRequest = req => {
  // First check cookies
  const cookieToken = req.cookies.get('token')?.value
  if (cookieToken) return cookieToken

  // Then check Authorization header
  const authHeader = req.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7) // Remove 'Bearer ' prefix
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
        console.log(`Checking ${allUsers.length} users for ID match`)

        // Log first few users for debugging
        if (allUsers.length > 0) {
          console.log(
            'Sample user IDs:',
            allUsers.slice(0, 3).map(u => `${u._id} (${typeof u._id})`)
          )
        }

        const user = allUsers.find(u => String(u._id) === userId)
        return user || null
      },

      // Try by email if we can find it in a token
      async () => {
        const token = getTokenFromRequest(req)
        if (!token) return null

        try {
          const decoded = jwt.verify(
            token,
            process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
          )
          if (decoded.email) {
            console.log('Trying lookup by email:', decoded.email)
            return await db.collection('users').findOne({ email: decoded.email })
          }
        } catch (e) {
          console.log('Token email lookup failed')
        }
        return null
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

// GET endpoint to fetch user address
export async function GET(req) {
  try {
    console.log('GET /api/auth/user/address - Request received')
    console.log('Headers:', Object.fromEntries([...req.headers.entries()]))

    // Get user ID from request
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
      console.log(
        `GET /api/auth/user/address - Address data: ${JSON.stringify(directUser.address || null)}`
      )

      return setJson(
        {
          data: directUser.address || null,
        },
        200
      )
    }

    console.log('Direct lookup failed, trying repository...')

    // Fall back to repository approach
    let user = null
    try {
      user = await usersRepo.getById(userId)
    } catch (userError) {
      console.error(`GET /api/auth/user/address - Error fetching user: ${userError.message}`)
      // Try backup approach already tried in direct lookup, no need to repeat
    }

    if (!user) {
      console.log(`GET /api/auth/user/address - User not found with ID: ${userId}`)
      return setJson({ message: 'User not found' }, 404)
    }

    console.log(
      `GET /api/auth/user/address - Found address: ${JSON.stringify(user.address || null)}`
    )

    // Return just the address data or null if not set
    return setJson(
      {
        data: user.address || null,
      },
      200
    )
  } catch (error) {
    console.error('Error in address API:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// PUT endpoint to update user address
export async function PUT(req) {
  try {
    console.log('PUT /api/auth/user/address - Request received')
    console.log('Headers:', Object.fromEntries([...req.headers.entries()]))

    // Get user ID from request
    const userId = getUserIdFromRequest(req)

    if (!userId) {
      console.log('PUT /api/auth/user/address - No user ID found')
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    console.log(`PUT /api/auth/user/address - User ID: ${userId}`)

    // Parse request body
    const body = await req.json()
    const { address } = body

    console.log(`PUT /api/auth/user/address - Request body: ${JSON.stringify(body)}`)

    if (!address) {
      console.log('PUT /api/auth/user/address - No address data provided')
      return setJson({ message: 'Address data is required' }, 400)
    }

    // First try to find user directly
    const directUser = await findUserDirectly(userId, req)

    if (directUser) {
      console.log(`PUT /api/auth/user/address - Found user directly: ${directUser._id}`)

      // Update directly with MongoDB
      try {
        const { db } = await connectToDatabase()
        const result = await db
          .collection('users')
          .updateOne({ _id: directUser._id }, { $set: { address, updatedAt: new Date() } })

        console.log(`Direct update result: ${JSON.stringify(result)}`)

        if (result.modifiedCount > 0) {
          const updatedUser = await db.collection('users').findOne({ _id: directUser._id })
          return setJson(
            {
              success: true,
              data: updatedUser.address,
            },
            200
          )
        }
      } catch (updateError) {
        console.error('Direct update failed:', updateError)
      }
    }

    // Fall back to repository
    console.log('Falling back to repository for update')
    const updatedUser = await usersRepo.update(userId, { address })

    if (!updatedUser) {
      console.log('PUT /api/auth/user/address - Update failed, user not found')
      return setJson({ message: 'User not found or update failed' }, 404)
    }

    console.log(
      `PUT /api/auth/user/address - Address updated: ${JSON.stringify(updatedUser.address)}`
    )

    // Return the updated address data
    return setJson(
      {
        success: true,
        data: updatedUser.address,
      },
      200
    )
  } catch (error) {
    console.error('Error in update address API:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

// POST endpoint to create a new address for user (same as PUT in functionality)
export async function POST(req) {
  try {
    console.log('POST /api/auth/user/address - Request received')
    console.log('Headers:', Object.fromEntries([...req.headers.entries()]))

    // Get user ID from request
    const userId = getUserIdFromRequest(req)

    if (!userId) {
      console.log('POST /api/auth/user/address - No user ID found')
      return setJson({ message: 'Unauthorized - Cannot identify user' }, 401)
    }

    console.log(`POST /api/auth/user/address - User ID: ${userId}`)

    // Parse request body
    const body = await req.json()
    const { address } = body

    console.log(`POST /api/auth/user/address - Request body: ${JSON.stringify(body)}`)

    if (!address) {
      console.log('POST /api/auth/user/address - No address data provided')
      return setJson({ message: 'Address data is required' }, 400)
    }

    // First try to find user directly
    const directUser = await findUserDirectly(userId, req)

    if (directUser) {
      console.log(`POST /api/auth/user/address - Found user directly: ${directUser._id}`)

      // Update directly with MongoDB
      try {
        const { db } = await connectToDatabase()
        const result = await db
          .collection('users')
          .updateOne({ _id: directUser._id }, { $set: { address, updatedAt: new Date() } })

        console.log(`Direct update result: ${JSON.stringify(result)}`)

        if (result.modifiedCount > 0) {
          const updatedUser = await db.collection('users').findOne({ _id: directUser._id })
          return setJson(
            {
              success: true,
              data: updatedUser.address,
            },
            201
          )
        }
      } catch (updateError) {
        console.error('Direct update failed:', updateError)
      }
    }

    // Fall back to repository
    const updatedUser = await usersRepo.update(userId, { address })

    if (!updatedUser) {
      console.log('POST /api/auth/user/address - Update failed, user not found')
      return setJson({ message: 'User not found or update failed' }, 404)
    }

    console.log(
      `POST /api/auth/user/address - Address created: ${JSON.stringify(updatedUser.address)}`
    )

    // Return the created address data
    return setJson(
      {
        success: true,
        data: updatedUser.address,
      },
      201
    )
  } catch (error) {
    console.error('Error in create address API:', error)
    return setJson({ message: error.message || 'Internal server error' }, 500)
  }
}

export const dynamic = 'force-dynamic'

import jwt from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Verify authentication from request headers
 *
 * @param {Request} request - Next.js request object
 * @returns {Object} Authentication result with success flag and user data
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid authorization header')
      return { success: false }
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      console.log('No token found in authorization header')
      return {
        success: false,
        message: 'Unauthorized: No token provided',
      }
    }

    try {
      // Verify the token
      const decoded = verify(token, JWT_SECRET)

      // Return successful authentication with user data
      return {
        success: true,
        isAuthenticated: true,
        user: {
          _id: decoded.userId || decoded.id || decoded._id,
          email: decoded.email,
          role: decoded.role || 'user',
        },
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError)
      return {
        success: false,
        message: 'Unauthorized: Invalid token',
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      message: 'Internal authentication error',
    }
  }
}

/**
 * Creates a new access token
 * @param {Object} payload - The data to include in the token
 * @param {string} expiresIn - When the token expires
 * @returns {string} The generated token
 */
export function createAccessToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Checks if a user has admin privileges
 * @param {Object|string} user - The user object or role string
 * @returns {boolean} Whether the user is an admin
 */
export function isAdmin(user) {
  if (!user) return false
  return typeof user === 'string' ? user === 'admin' : user.role === 'admin'
}

// Export a mock authentication function for development
export function mockAuth() {
  return {
    success: true,
    isAuthenticated: true,
    user: {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@example.com',
      role: 'admin',
    },
  }
}

export default verifyAuth

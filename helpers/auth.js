import jwt from 'jsonwebtoken'

const verifyToken = async (req, isJwt) => {
  try {
    // First try Authorization header
    let token = req.headers.get('authorization')?.replace('Bearer ', '')

    // If no token in Authorization header, try to get from cookie
    if (!token) {
      const cookieHeader = req.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
        if (tokenCookie) {
          token = tokenCookie.split('=')[1]
        }
      }
    }

    if (!token) {
      throw new Error('No authentication token found')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const id = decoded.id

    return id
  } catch (error) {
    console.error('[Auth] Token verification error:', error.message)
    if (isJwt) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
    return null
  }
}

const createAccessToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export async function validateToken(request) {
  try {
    // Get token from all possible sources
    let token =
      request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies?.get('token')?.value ||
      request.cookies?.get('auth')?.value

    if (!token) {
      console.log('No token found')
      return { success: false, error: 'No token provided' }
    }

    console.log('Validating token:', token.substring(0, 20) + '...')

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Token decoded:', {
      id: decoded.id,
      role: decoded.role,
      isAdmin: decoded.role === 'admin',
    })

    return {
      success: true,
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isAdmin: decoded.role === 'admin',
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }
}

// Middleware to authenticate requests
export const authenticate = async (req, res, next) => {
  try {
    const userId = await verifyToken(req, true)
    if (!userId) {
      throw new Error('Authentication required')
    }
    req.userId = userId
    return next()
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async req => {
  try {
    const userId = await verifyToken(req, false)
    return !!userId
  } catch (error) {
    return false
  }
}

// Helper function to get current user ID
export const getCurrentUserId = async req => {
  try {
    return await verifyToken(req, false)
  } catch (error) {
    return null
  }
}

export const auth = {
  verifyToken,
  createAccessToken,
  validateToken,
  authenticate,
  isAuthenticated,
  getCurrentUserId,
}

export default auth

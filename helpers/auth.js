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

    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )
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
  return jwt.sign(payload, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  })
}

export const validateToken = async request => {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, message: 'No token provided' }
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    return {
      success: true,
      user: decoded,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Invalid token',
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

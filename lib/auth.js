import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const createAccessToken = payload => {
  const secret = process.env.JWT_SECRET
  return jwt.sign(payload, secret)
}

const getTokenFromCookies = () => {
  try {
    return cookies().get('token')?.value
  } catch (error) {
    return null
  }
}

export const verifyAuth = async request => {
  try {
    // Try to get token from request cookies first
    let token = request.cookies?.get?.('token')?.value

    // Fallback to Authorization header
    if (!token) {
      token = request.headers.get('authorization')?.replace('Bearer ', '')
    }

    if (!token) {
      return { success: false, message: 'No token found' }
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    return {
      success: true,
      id: decoded.id,
      role: decoded.role,
      isAdmin: decoded.role === 'admin' || decoded.isAdmin === true,
      user: decoded,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, message: error.message }
  }
}

export const isAdmin = async request => {
  const auth = await verifyAuth(request)
  if (!auth.success) {
    return false
  }
  return auth.isAdmin
}

export const mockAuth = async request => {
  return {
    success: true,
    id: '123',
    role: 'admin',
    isAdmin: true,
    user: {
      id: '123',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'admin',
      isAdmin: true,
    },
  }
}

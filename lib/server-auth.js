import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

/**
 * Sets authentication cookies
 * @param {string} token - The token to store
 * @param {Object} userData - User data to store
 */
export async function setAuthCookies(token, userData) {
  const cookieStore = cookies()
  await cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Store user role in a non-httpOnly cookie for client access
  if (userData.role) {
    await cookieStore.set('userRole', userData.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }
}

/**
 * Clears authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = cookies()
  await cookieStore.delete('token')
  await cookieStore.delete('userRole')
}

/**
 * Gets the authentication token from cookies or Authorization header
 * @returns {Promise<string|null>} The token or null if not found
 */
export async function getAuthToken(request) {
  try {
    // Try authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Then try cookies
    const cookieStore = cookies()
    const tokenCookie = cookieStore.get('token')
    return tokenCookie?.value || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Gets the user role from cookies
 * @returns {Promise<string|null>} The user role or null if not found
 */
export async function getUserRole() {
  try {
    const cookieStore = cookies()
    const roleCookie = cookieStore.get('userRole')
    return roleCookie?.value || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Verifies the authentication token
 * @param {Object} request - The request object
 * @returns {Promise<Object|null>} The decoded token payload or null if verification fails
 */
export async function verifyAuth(request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      console.log('No token found')
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Token verified:', {
      id: decoded.id,
      role: decoded.role,
      isAdmin: decoded.role === 'admin',
    })

    return decoded
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

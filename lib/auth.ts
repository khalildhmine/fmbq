import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function verifyAuth(request: Request) {
  const cookieStore = cookies()
  let token = null

  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    token = authHeader.replace('Bearer ', '')
  }

  // If no token from header, try cookies
  if (!token) {
    const tokenFromCookie = await cookieStore.get('token')
    token = tokenFromCookie?.value
  }

  try {
    if (!token) {
      return { success: false, message: 'No token found' }
    }

    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET!)
    if (!decoded || typeof decoded !== 'object') {
      return { success: false, message: 'Invalid token' }
    }

    // Extract userId from the decoded token
    const userId = decoded.user?.userId || decoded.userId || decoded.id
    if (!userId) {
      console.error('No user ID in token:', decoded)
      return { success: false, message: 'Invalid token structure' }
    }

    return {
      success: true,
      id: userId,
      role: decoded.user?.role || decoded.role || 'user',
      isAdmin: decoded.user?.role === 'admin' || decoded.role === 'admin',
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, message: 'Invalid token' }
  }
}

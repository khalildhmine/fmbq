import { auth } from '../auth'

export const jwtMiddleware = async req => {
  try {
    const userId = await auth.verifyToken(req, true)
    if (!userId) {
      throw new Error('User ID not found in token')
    }

    // Add userId to request headers for downstream use
    req.headers.set('userId', userId)

    return userId
  } catch (error) {
    console.error('[JWT Middleware] Error:', error.message)
    throw new Error('Authentication failed')
  }
}

export default jwtMiddleware

import jwt from 'jsonwebtoken'

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'

export const verifyToken = async token => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export const createToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export const verifyRefreshToken = token => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET)
    return decoded.userId || decoded.id || decoded._id
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

export const generateAccessToken = user => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    root: user.root,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

// Export validateToken as alias for verifyToken for backwards compatibility
export const validateToken = verifyToken

export default {
  verifyToken,
  createToken,
  verifyRefreshToken,
  generateAccessToken,
}

import jwt from 'jsonwebtoken'

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'

export const verifyToken = async token => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Ensure we have a valid user ID and role
    const userId = decoded.id || decoded.userId || decoded._id
    const role = decoded.role || 'user'

    if (!userId) {
      console.error('No user ID found in token')
      return null
    }

    return {
      userId,
      role,
      email: decoded.email,
      isAdmin: role === 'admin' || decoded.root === true,
    }
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

export default {
  verifyToken,
  createToken,
  verifyRefreshToken,
  generateAccessToken,
}

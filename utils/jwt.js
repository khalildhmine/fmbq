import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const verifyToken = async token => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export const generateToken = user => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const decodeToken = token => {
  try {
    return jwt.decode(token)
  } catch (error) {
    console.error('Token decode failed:', error)
    return null
  }
}

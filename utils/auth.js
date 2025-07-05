/**
 * Gets the authentication token from localStorage or cookies
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return null

  // Try to get token from localStorage first
  let token = localStorage.getItem('authToken') || ''

  // If token isn't in localStorage, check cookies
  if (!token) {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
    if (tokenCookie) {
      token = tokenCookie.split('=')[1]
    }

    // Some systems use 'authToken=' instead of 'token='
    const authTokenCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='))
    if (!token && authTokenCookie) {
      token = authTokenCookie.split('=')[1]
    }
  }

  return token || null
}

/**
 * Prepares headers with authentication for API requests
 * @param {Object} additionalHeaders - Optional additional headers to include
 * @returns {Object} Headers object with authorization included if available
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  }

  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Standard fetch options to include in all authenticated API requests
 * @returns {Object} Fetch options with credentials included
 */
export const getAuthFetchOptions = () => {
  return {
    credentials: 'include', // Include cookies with the request
  }
}

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint to call
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Promise that resolves to the JSON response
 */
export const authFetch = async (url, options = {}) => {
  const headers = getAuthHeaders(options.headers || {})

  const fetchOptions = {
    ...getAuthFetchOptions(),
    ...options,
    headers,
  }

  const response = await fetch(url, fetchOptions)
  return await response.json()
}

/**
 * Verify authentication from request headers or cookies
 * @param {Request} req - The incoming request object
 * @returns {Promise<{success: boolean, userId?: string}>} Authentication result
 */
export const verifyAuth = async req => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.get('authorization')
    let token = authHeader ? authHeader.split(' ')[1] : null

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
      return { success: false, error: 'No token provided' }
    }

    // Import dependencies using absolute paths
    const { verifyToken } = await import('@/helpers/jwt')
    const { connectToDatabase } = await import('@/helpers/db')
    const User = (await import('@/models/User')).default

    const decoded = await verifyToken(token)

    if (!decoded || !decoded.id) {
      return { success: false, error: 'Invalid token' }
    }

    await connectToDatabase()
    const user = await User.findById(decoded.id).select('role isAdmin').lean()

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      user: {
        _id: user._id,
        role: user.role || (user.isAdmin ? 'admin' : 'user'),
      },
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

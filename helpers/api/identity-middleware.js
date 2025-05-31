import { usersRepo } from '../db-repo/user-repo.js'
import { connectToDatabase } from '../db'
import { ObjectId } from 'mongodb'

async function identityMiddleware(req, identity = 'user', isJwt = false) {
  if (identity === 'user' && isJwt === false) return

  const userId = req.headers.get('userId')
  if (!userId) {
    console.error('[Identity Middleware] Missing userId in headers')
    throw 'Authentication required - User ID is missing'
  }

  try {
    console.log(
      `[Identity Middleware] Checking identity for user ${userId}, required identity: ${identity}`
    )

    // Connect to the database directly if needed
    let user = null

    try {
      // First try through usersRepo
      user = await usersRepo.getOne({ _id: new ObjectId(userId) })
    } catch (repoError) {
      console.warn('[Identity Middleware] Error using usersRepo:', repoError.message)

      try {
        // Fallback to direct database query
        const { db } = await connectToDatabase()
        user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
      } catch (dbError) {
        console.error('[Identity Middleware] Database connection error:', dbError.message)
        throw 'Database connection failed'
      }
    }

    if (!user) {
      console.error(`[Identity Middleware] User not found with ID: ${userId}`)
      throw 'User account not found'
    }

    // Set headers with user information
    req.headers.set('userRole', user.role || 'guest')
    req.headers.set('userRoot', user.root || false)

    // Log the user role and access attempt
    console.log(
      `[Identity Middleware] User ${userId} with role '${
        user.role || 'none'
      }' accessing '${identity}' route`
    )

    // Admin check: either role is 'admin' or user is root
    if (identity === 'admin' && user.role !== 'admin' && !user.root) {
      console.error(
        `[Identity Middleware] Access denied: User ${userId} with role '${
          user.role || 'none'
        }' attempted to access admin route`
      )
      throw 'Admin access required - Permission denied'
    }

    // Root check: user must have root flag
    if (identity === 'root' && !user.root) {
      console.error(
        `[Identity Middleware] Root access denied: User ${userId} with role '${
          user.role || 'none'
        }' attempted to access root route`
      )
      throw 'Root access required - Permission denied'
    }

    // Add the user object to the request for convenience
    req.headers.set('user', JSON.stringify(user))

    return user
  } catch (error) {
    console.error('[Identity Middleware] Authentication error:', error)
    throw typeof error === 'string' ? error : 'Authentication failed'
  }
}

export { identityMiddleware }

import { usersRepo } from 'helpers'
import { setJson } from '@/helpers/api'
import jwt from 'jsonwebtoken'

export async function GET(req) {
  try {
    // Get the token from the request
    const token = req.cookies.get('token')?.value

    if (!token) {
      return new Response(JSON.stringify({ message: 'Unauthorized - No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify the token and extract user ID
    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || 'your-secret-key'
    )

    // Use the ID from the token to get user data
    const user = await usersRepo.getById(decoded.id)

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Return user data
    return new Response(
      JSON.stringify({
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          root: user.root,
          address: user.address,
          mobile: user.mobile,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in user API:', error)
    return new Response(JSON.stringify({ message: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/models/User'

// Helper function to extract token from various sources
function extractToken(req) {
  // Try to get token from Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookies
  const cookies = req.cookies
  if (cookies.get('token')) {
    return cookies.get('token').value
  }
  if (cookies.get('authToken')) {
    return cookies.get('authToken').value
  }

  return null
}

// Verify authentication
async function verifyAuth(req) {
  const token = extractToken(req)

  if (!token) {
    console.log('No token found in request')
    return { success: false, message: 'authentication_required', redirectUrl: '/login' }
  }

  console.log('Token found:', token.substring(0, 10) + '...')

  // In a real app, you would verify the token
  // For now, we'll accept any token for testing
  return { success: true, role: 'admin' }
}

export async function PATCH(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success || authResult.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized: Only admins can update user roles' },
        { status: 403 }
      )
    }

    await connectToDB()
    const { id } = params
    const { role } = await request.json()

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 })
    }

    // Find and update user
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update role and admin status
    user.role = role
    user.isAdmin = role === 'admin'
    await user.save()

    return NextResponse.json({
      message: 'User role updated successfully',
      data: {
        id: user._id,
        role: user.role,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ message: 'Failed to update user role' }, { status: 500 })
  }
}

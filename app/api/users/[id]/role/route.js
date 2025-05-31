import { NextResponse } from 'next/server'
import { connectToDB } from '@/lib/mongoose'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(request, { params }) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
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

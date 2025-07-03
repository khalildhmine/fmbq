import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    console.log('[API Debug] Received request for /api/user')
    
    // Get token from cookies or authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('[API Debug] No token found')
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 })
    }
    
    try {
      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
      console.log('[API Debug] Decoded token:', decoded)
      
      await connectToDatabase()
      
      // If user ID is in token, fetch that specific user (for regular users)
      if (decoded.id) {
        const user = await User.findById(decoded.id).select('-password')
        
        if (!user) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }
        
        // Include coins in the response
        return NextResponse.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            address: user.address,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            avatar: user.avatar || '',
            hasPassword: !!user.password,
            isVerified: user.isVerified || false,
            coins: user.coins || 0
          }
        })
      }
      
      // For admin users, return all users
      if (decoded.role === 'admin') {
        const users = await User.find().select('-password')
        return NextResponse.json({
          success: true,
          data: users
        })
      }
      
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    } catch (error) {
      console.log('[API Debug] Token verification error:', error.message)
      return NextResponse.json({ success: false, message: error.message }, { status: 401 })
    }
  } catch (error) {
    console.error('[API Debug] GET users error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

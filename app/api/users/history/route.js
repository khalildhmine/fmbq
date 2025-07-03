import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { History } from '@/models'
import jwt from 'jsonwebtoken'

// Create a function to get user from token since getUserFromToken is not available
async function getUserFromToken(req) {
  try {
    const token = req.cookies.get('token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return null
    }
    
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
    
    if (!decoded || !decoded.id) {
      return null
    }
    
    await connectToDatabase()
    const User = (await import('@/models')).User
    return await User.findById(decoded.id).select('-password')
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

export async function GET(req) {
  try {
    await connectToDatabase()
    
    // Get user from token
    const user = await getUserFromToken(req)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user history
    const history = await History.find({ user: user._id })
      .populate('product')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    
    return NextResponse.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('Error fetching user history:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    await connectToDatabase()
    
    // Get user from token
    const user = await getUserFromToken(req)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get product ID from request body
    const { productId } = await req.json()
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Check if history entry already exists
    const existingEntry = await History.findOne({
      user: user._id,
      product: productId
    })
    
    if (existingEntry) {
      // Update timestamp
      existingEntry.updatedAt = new Date()
      await existingEntry.save()
      
      return NextResponse.json({
        success: true,
        message: 'History updated'
      })
    }
    
    // Create new history entry
    const newEntry = new History({
      user: user._id,
      product: productId
    })
    
    await newEntry.save()
    
    return NextResponse.json({
      success: true,
      message: 'Added to history'
    })
  } catch (error) {
    console.error('Error updating user history:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update history' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

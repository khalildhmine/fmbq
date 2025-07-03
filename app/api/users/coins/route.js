import { usersRepo } from '@/helpers'
import { setJson, apiHandler } from '@/helpers/api'

const getCoinsNotification = apiHandler(
  async req => {
    const userId = req.headers.get('userId')
    const user = await usersRepo.getById(userId)

    // Get recent coin changes (last 24 hours)
    const recentCoins = await usersRepo.getRecentCoinsChanges(userId)

    return setJson({
      data: {
        currentCoins: user.coins,
        recentChanges: recentCoins,
      },
    })
  },
  {
    isJwt: true,
  }
)

export const GET = getCoinsNotification
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import jwt from 'jsonwebtoken'

// Get user from token
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
    
    return NextResponse.json({
      success: true,
      data: {
        currentCoins: user.coins || 0,
        redeemableAmount: Math.floor((user.coins || 0) / 100) * 40,
        recentChanges: user.pointsHistory || []
      }
    })
  } catch (error) {
    console.error('Error fetching user coins:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch coins' },
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
    
    // Get points to redeem from request body
    const { pointsToRedeem } = await req.json()
    
    // Validate points
    if (!pointsToRedeem || pointsToRedeem <= 0 || pointsToRedeem % 100 !== 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid points amount. Must be a positive multiple of 100.' },
        { status: 400 }
      )
    }
    
    // Check if user has enough points
    if (user.coins < pointsToRedeem) {
      return NextResponse.json(
        { success: false, message: 'Not enough points available' },
        { status: 400 }
      )
    }
    
    // Calculate discount amount (40 MRU per 100 points)
    const discountAmount = Math.floor(pointsToRedeem / 100) * 40
    
    return NextResponse.json({
      success: true,
      data: {
        pointsToRedeem,
        discountAmount,
        remainingPoints: user.coins - pointsToRedeem
      }
    })
  } catch (error) {
    console.error('Error validating points redemption:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to validate points' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

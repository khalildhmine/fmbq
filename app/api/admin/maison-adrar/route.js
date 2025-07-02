import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
// import { connectDb } from '@/lib/db'
import { connectToDatabase } from '@/lib/db'

import MaisonAdrar from '@/models/MaisonAdrar'

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

  // Check URL parameters (less secure, but sometimes needed)
  const url = new URL(req.url)
  const tokenParam = url.searchParams.get('token')
  if (tokenParam) {
    return tokenParam
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

export async function GET(req) {
  try {
    // Log the request headers for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Auth result:', authResult)

    if (!authResult.success) {
      // For API routes, we return a JSON response with a redirect instruction
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
          redirectUrl: authResult.redirectUrl,
        },
        {
          status: 401,
        }
      )
    }

    // Connect to database
    console.log('Connecting to MongoDB...')
    await connectDb()
    const mongoose = (await import('mongoose')).default
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Failed to connect to database')
    }

    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search') || ''
    const type = url.searchParams.get('type') || ''
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    console.log(
      `Query params: page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}, search=${search}, type=${type}`
    )

    // Build query
    const query = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    if (type) {
      query.type = type
    }

    try {
      // Count total matching documents for pagination
      const collection = db.collection('maisonadrars')
      const totalDocs = await collection.countDocuments(query)

      // Build sort options
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

      // Get paginated results
      const skip = (page - 1) * limit
      const perfumes = await collection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray()

      console.log(`Found ${perfumes.length} perfumes matching query`)

      return NextResponse.json({
        success: true,
        data: {
          perfumes,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalDocs / limit),
            totalItems: totalDocs,
            itemsPerPage: limit,
          },
        },
      })
    } catch (error) {
      console.error('Database error:', error.message)
      throw new Error(`Error querying database: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in GET /api/admin/maison-adrar:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(req) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req)
    console.log('Auth result:', authResult)

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
          redirectUrl: authResult.redirectUrl,
        },
        {
          status: 401,
        }
      )
    }

    // Get request body
    const perfumeData = await req.json()

    // Validate required fields
    if (!perfumeData.name || !perfumeData.price || !perfumeData.type) {
      return NextResponse.json(
        { success: false, message: 'Name, price and type are required' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDb()
    const mongoose = (await import('mongoose')).default
    const db = mongoose.connection.db

    if (!db) {
      throw new Error('Failed to connect to database')
    }

    try {
      const collection = db.collection('maisonadrar')

      // Add metadata
      perfumeData.createdAt = new Date()
      perfumeData.updatedAt = new Date()

      // Insert document
      const result = await collection.insertOne(perfumeData)

      return NextResponse.json({
        success: true,
        data: { id: result.insertedId, ...perfumeData },
      })
    } catch (error) {
      console.error('Database error:', error.message)
      throw new Error(`Error inserting document: ${error.message}`)
    }
  } catch (error) {
    console.error('Error in POST /api/admin/maison-adrar:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      {
        status: 500,
      }
    )
  }
}

// Set CORS headers
export const config = {
  api: {
    bodyParser: false,
  },
}

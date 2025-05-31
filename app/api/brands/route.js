import { connectToDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

// Make sure this is set for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Get all brands
export async function GET(request) {
  try {
    // Connect to the database
    const connection = await connectToDatabase()
    const db = connection.db

    console.log('Fetching brands from database...')

    // Fetch all brands with proper sorting
    const brands = await db.collection('brands').find({}).sort({ featured: -1, name: 1 }).toArray()

    // Log the results
    console.log(`Found ${brands.length} brands`)

    // Transform and validate each brand
    const transformedBrands = brands.map(brand => {
      // Ensure all required fields have fallback values
      const transformedBrand = {
        _id: brand._id.toString(),
        name: brand.name || 'Unnamed Brand',
        slug: brand.slug || brand._id.toString(),
        logo: brand.logo || null,
        featured: !!brand.featured,
        active: brand.active !== false,
        color: brand.color || '#F5F5DC',
        description: brand.description || '',
        isInFeed: brand.isInFeed !== false,
      }

      console.log(`Transformed brand: ${transformedBrand.name}`, transformedBrand)
      return transformedBrand
    })

    // Return success response
    return NextResponse.json({
      success: true,
      data: transformedBrands,
      message: `Successfully fetched ${transformedBrands.length} brands`,
    })
  } catch (error) {
    console.error('Error in brands API:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch brands',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// Create brand API endpoint
export async function POST(req) {
  try {
    // Connect to the database
    const connection = await connectToDatabase()
    const db = connection.db

    // Parse the request body
    const brandData = await req.json()

    // Validate the request body
    if (!brandData.name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Brand name is required',
        },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    if (!brandData.slug) {
      brandData.slug = brandData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    }

    // Create a new brand
    const result = await db.collection('brands').insertOne({
      ...brandData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Get the created brand
    const newBrand = await db.collection('brands').findOne({ _id: result.insertedId })

    return NextResponse.json({
      success: true,
      data: newBrand,
      message: 'Brand created successfully',
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create brand',
      },
      { status: 500 }
    )
  }
}

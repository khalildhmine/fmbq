import joi from 'joi'
import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Banner } from '@/models'

// GET handler for banners
export async function GET(req) {
  try {
    console.log('Banner API: Starting request processing')

    // Get query parameters
    const url = new URL(req.url)
    const category = url.searchParams.get('category')

    console.log(`Banner API: Query params - category: ${category || 'none'}`)

    // Connect to database
    await connect()
    console.log('Banner API: Connected to database')

    // Build filter
    const filter = {}
    if (category) {
      filter.category_id = category
    }

    // Get banners
    const banners = await Banner.find(filter)
    console.log(`Banner API: Found ${banners.length} banners`)

    // Return the response
    return NextResponse.json(
      {
        data: banners,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Banner API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get banners',
      },
      { status: 500 }
    )
  }
}

// POST handler for creating a banner
export async function POST(req) {
  try {
    console.log('Banner API: Starting banner creation')

    // Get request body
    const body = await req.json()

    // Validate request body
    const schema = joi.object({
      category_id: joi.string().required(),
      image: joi.object().required(),
      isPublic: joi.boolean().required(),
      title: joi.string().required(),
      type: joi.string().required(),
      uri: joi.string().required(),
    })

    const { error } = schema.validate(body)
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.details[0].message,
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connect()

    // Create banner
    const banner = new Banner(body)
    await banner.save()

    console.log('Banner API: Banner created successfully')

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: '新增成功',
    })
  } catch (error) {
    console.error('Banner creation error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to create banner',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

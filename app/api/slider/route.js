import joi from 'joi'
import { NextResponse } from 'next/server'
import { connect } from '@/helpers/db'
import { Slider, Category } from '@/models'

// GET handler for sliders
export async function GET(req) {
  try {
    console.log('Slider API: Starting request processing')

    // Get query parameters
    const url = new URL(req.url)
    const category = url.searchParams.get('category')

    console.log(`Slider API: Query params - category: ${category || 'none'}`)

    // Connect to database
    await connect()
    console.log('Slider API: Connected to database')

    // Build filter
    const filter = {}
    if (category) {
      filter.category_id = category
    }

    // Get sliders
    const sliders = await Slider.find(filter)
    console.log(`Slider API: Found ${sliders.length} sliders`)

    // Return the response
    return NextResponse.json(
      {
        data: sliders,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Slider API error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to get sliders',
      },
      { status: 500 }
    )
  }
}

// POST handler for creating a slider
export async function POST(req) {
  try {
    console.log('Slider API: Starting slider creation')

    // Get form data
    const formData = await req.formData()
    const title = formData.get('title')
    const category_id = formData.get('category_id')
    const imageData = formData.get('image')
    const displayOrder = formData.get('displayOrder')
    const active = formData.get('active') === 'true'
    const isPublic = formData.get('isPublic') === 'true'
    const uri = formData.get('uri') || '#'

    console.log('Received slider data:', {
      title,
      category_id,
      displayOrder,
      active,
      isPublic,
      uri,
      imageData: imageData ? 'Present' : 'Missing',
    })

    // Parse image data
    let image
    try {
      image = JSON.parse(imageData)
    } catch (error) {
      console.error('Failed to parse image data:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid image data',
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!title || !category_id || !image?.url || !image?.publicId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Connect to database
    await connect()

    // Verify category exists if category_id is provided
    if (category_id !== 'all') {
      const category = await Category.findById(category_id)
      if (!category) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Invalid category ID',
          },
          { status: 400 }
        )
      }
    }

    // Create slider with sanitized data
    const sliderData = {
      title,
      category_id,
      uri,
      image: {
        url: image.url,
        publicId: image.publicId,
        uploadedAt: new Date().toISOString(),
      },
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      active,
      isPublic,
      createdAt: new Date(),
    }

    const slider = new Slider(sliderData)
    await slider.save()

    console.log('Slider created successfully:', slider._id)

    // Return success response
    return NextResponse.json(
      {
        status: 'success',
        message: 'Slider created successfully',
        data: {
          _id: slider._id,
          title: slider.title,
          image: slider.image,
          category_id: slider.category_id,
          uri: slider.uri,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Slider creation error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to create slider',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

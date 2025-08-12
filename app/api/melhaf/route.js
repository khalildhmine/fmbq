// app/api/melhaf/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import Melhaf from '../../../models/melhaf'
import slugify from 'slugify'
import { z } from 'zod'

// Validation schema for Melhaf data
const MelhafSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  collection: z.string().min(1, 'Collection is required'),
  description: z.string().optional(),
  adFabric: z.boolean().default(false),
  published: z.boolean().default(true),
  targetAudience: z.string().default('Women'),
  colorVariants: z
    .array(
      z.object({
        colorName: z.string().min(1, 'Color name is required'),
        images: z.array(z.string().url()).min(1, 'At least one image is required'),
        stock: z.number().min(0, 'Stock must be non-negative'),
        price: z.number().min(0, 'Price must be non-negative'),
        sold: z.number().min(0).default(0),
        views: z.number().min(0).default(0),
      })
    )
    .min(1, 'At least one color variant is required'),
  promotion: z
    .object({
      isActive: z.boolean().default(false),
      discountType: z.enum(['percentage', 'fixed']).default('percentage'),
      discountValue: z.number().min(0).default(0),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })
    .optional(),
  sizes: z
    .array(
      z.object({
        size: z.string().min(1, 'Size is required'),
        inStock: z.number().min(0, 'Stock must be non-negative'),
      })
    )
    .optional(),
})

export async function GET(req) {
  try {
    console.log('🔍 Starting GET request for melhafs...')
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    console.log(`📄 Fetching page ${page} with limit ${limit}`)

    const total = await Melhaf.countDocuments()
    const melhafs = await Melhaf.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    console.log(`✅ Found ${melhafs.length} melhafs`)

    return NextResponse.json({
      success: true,
      data: melhafs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('❌ Error fetching melhafs:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    console.log('🚀 Starting Melhaf POST request...')
    await connectToDatabase()
    console.log('✅ Database connected')

    const data = await req.json()
    console.log('📄 Received data:', data)

    // Generate slug from name (ensure fallback if name is missing)
    const slug =
      (data.name || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || 'melhaf-' + Date.now()

    console.log('🏷️ Generated slug:', slug)

    // Prepare melhaf data with required fields
    const melhafData = {
      ...data,
      slug, // Ensure slug is set
      collectionName: data.collection, // Map collection to collectionName
      colorVariants: Array.isArray(data.colorVariants)
        ? data.colorVariants.map(({ _id, ...variant }) => variant)
        : [],
    }

    console.log('💾 Creating Melhaf...')
    const melhaf = new Melhaf(melhafData)
    const savedMelhaf = await melhaf.save()

    return NextResponse.json({
      success: true,
      data: savedMelhaf
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to create melhaf',
        errors: error.errors
      },
      { status: 500 }
    )
  }
}

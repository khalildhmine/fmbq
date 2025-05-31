import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { Category } from '@/models'
import joi from 'joi'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    console.log('Connected to database, fetching categories...')

    const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray()
    console.log(`Found ${categories.length} categories`)

    // Format categories to ensure consistent response
    const formattedCategories = categories.map(category => ({
      ...category,
      _id: category._id.toString(),
      parent: category.parent ? category.parent.toString() : null,
    }))

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    })
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase()

    const data = await req.json()

    // Convert parent to ObjectId if provided
    if (data.parent) {
      data.parent = new ObjectId(data.parent)
    }

    const result = await db.collection('categories').insertOne(data)
    const insertedCategory = await db.collection('categories').findOne({ _id: result.insertedId })

    return NextResponse.json({
      success: true,
      data: {
        ...insertedCategory,
        _id: insertedCategory._id.toString(),
        parent: insertedCategory.parent ? insertedCategory.parent.toString() : null,
      },
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/helpers/db'
import { Category } from '@/models'
import joi from 'joi'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  let connection = null
  try {
    connection = await connectToDatabase()
    if (!connection?.db) {
      throw new Error('Failed to establish database connection')
    }
    console.log('Connected to database, fetching categories...')

    // Verify collection exists
    const collections = await connection.db.listCollections({ name: 'categories' }).toArray()
    if (collections.length === 0) {
      console.log('Categories collection does not exist, creating it...')
      await connection.db.createCollection('categories')
    }

    const categories = await connection.db
      .collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray()
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
    // Return a more detailed error message in development
    const errorMessage =
      process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch categories'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function POST(req) {
  let connection = null
  try {
    connection = await connectToDatabase()
    if (!connection?.db) {
      throw new Error('Failed to establish database connection')
    }

    const data = await req.json()

    // Validate input data
    const schema = joi.object({
      name: joi.string().required(),
      parent: joi.string().allow(null),
      description: joi.string().allow(''),
      image: joi.string().allow(''),
      isActive: joi.boolean().default(true),
    })

    const { error, value } = schema.validate(data)
    if (error) {
      return NextResponse.json({ success: false, error: error.details[0].message }, { status: 400 })
    }

    // Convert parent to ObjectId if provided
    if (value.parent) {
      value.parent = new ObjectId(value.parent)
    }

    const result = await connection.db.collection('categories').insertOne({
      ...value,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const insertedCategory = await connection.db
      .collection('categories')
      .findOne({ _id: result.insertedId })

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
    const errorMessage =
      process.env.NODE_ENV === 'development' ? error.message : 'Failed to create category'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

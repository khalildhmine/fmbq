import { NextResponse } from 'next/server'
import Product from '@/models/Product'
import connectDB from '@/lib/db'

export async function POST(request) {
  try {
    await connectDB()

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Find product by ID or barcode
    const product = await Product.findOne({
      $or: [{ _id: productId }, { barcode: productId }, { sku: productId }],
    }).populate('category brand')

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock. Available: ${product.stock}`,
          product: {
            ...product.toObject(),
            stock: product.stock,
          },
        },
        { status: 400 }
      )
    }

    // Return product info for POS
    const posProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || product.price,
      stock: product.stock,
      category: product.category?.name || 'Uncategorized',
      brand: product.brand?.name || 'No Brand',
      image: product.images?.[0] || null,
      sku: product.sku,
      barcode: product.barcode,
    }

    return NextResponse.json({
      success: true,
      product: posProduct,
      message: 'Product scanned successfully',
    })
  } catch (error) {
    console.error('POS Scan Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

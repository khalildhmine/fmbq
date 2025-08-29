import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit')) || 100

    // Build search query
    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
        ],
      }
    }

    // Only show products with stock > 0
    query.stock = { $gt: 0 }

    const products = await Product.find(query)
      .populate('category brand')
      .select(
        'name title price salePrice stock category brand images sku barcode description discount colors sizes inStock rating numReviews slug'
      )
      .limit(limit)
      .sort({ name: 1 })
      .lean()

    const posProducts = products.map(product => ({
      _id: product._id,
      name: product.name || product.title || 'Product',
      title: product.title || product.name || 'Product',
      price: product.price || 0,
      salePrice: product.salePrice || product.price || 0,
      stock: product.stock || product.inStock || 0,
      category: product.category?.name || 'Uncategorized',
      brand: product.brand?.name || 'No Brand',
      images: product.images || [],
      image: product.images?.[0]?.url || product.images?.[0] || null,
      sku: product.sku || '',
      barcode: product.barcode || '',
      description: product.description || '',
      discount: product.discount || 0,
      colors: product.colors || [],
      sizes: product.sizes || [],
      rating: product.rating || 0,
      numReviews: product.numReviews || 0,
      slug: product.slug || '',
    }))

    return NextResponse.json({
      success: true,
      products: posProducts,
      total: posProducts.length,
    })
  } catch (error) {
    console.error('POS Products Error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

import { connectToDatabase } from '@/helpers/db'
import AnonymousCart from '@/models/AnonymousCart'
import Product from '@/models/Product' // Import the Product model

export async function POST(request) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const { userId, cartId, contactInfo, items, totalItems, totalPrice, action } = body

    // Optional: Validate phone is string if present
    if (contactInfo?.phone && typeof contactInfo.phone !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'contactInfo.phone must be a string' }),
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'Items are required' }), {
        status: 400,
      })
    }

    let existingCart
    if (userId) {
      existingCart = await AnonymousCart.findOne({ userId })
    } else if (cartId) {
      existingCart = await AnonymousCart.findOne({ cartId })
    }

    let currentCart = existingCart

    if (!currentCart) {
      // Create new cart if not found
      currentCart = new AnonymousCart({
        userId: userId || null,
        cartId: cartId || userId || Math.random().toString(36).substr(2, 9),
        contactInfo: contactInfo || {},
        items: [], // Initialize with empty items, will be populated below
        totalItems: 0,
        totalPrice: 0,
        action: action || 'add',
      })
    }

    const updatedItems = []
    let newTotalItems = 0
    let newTotalPrice = 0

    for (const incomingItem of items) {
      const { productID, variantId, quantity } = incomingItem

      if (!productID || !quantity) {
        throw new Error('Product ID and quantity are required for each cart item.')
      }

      const product = await Product.findById(productID).lean() // Fetch product with variants

      if (!product) {
        throw new Error(`Product with ID ${productID} not found.`)
      }

      let targetVariant
      if (variantId) {
        targetVariant = product.variants?.find(v => v._id?.toString() === variantId)
        if (!targetVariant) {
          throw new Error(`Variant with ID ${variantId} not found for product ${productID}.`)
        }
      } else {
        // Handle products without explicit variants (e.g., if optionsType is 'none')
        // For now, assume products without variantId refer to the main product stock.
        // In a full variant system, non-variant products might still have a default variant.
        // This part needs careful consideration based on your product data structure.
        if (product.optionsType === 'none' || !product.variants || product.variants.length === 0) {
          targetVariant = {
            _id: product._id.toString(), // Use product ID as a virtual variant ID
            stock: product.inStock, // Use product's overall inStock
            price: product.price, // Use product's overall price
            discount: product.discount, // Use product's overall discount
            size: null, // No specific size
            color: null, // No specific color
          }
        } else {
          throw new Error('Variant ID is required for products with variants.')
        }
      }

      if (targetVariant.stock < quantity) {
        throw new Error(
          `Insufficient stock for ${product.title} (Variant: ${targetVariant.size || 'N/A'}/${targetVariant.color?.name || 'N/A'}). Available: ${targetVariant.stock}, Requested: ${quantity}`
        )
      }

      // Deduct stock from the variant
      // Important: Since product is .lean(), we need to find and update the actual Mongoose document
      const productToUpdate = await Product.findById(productID)
      if (!productToUpdate) throw new Error('Product not found for stock update.')

      if (variantId) {
        const variantToUpdate = productToUpdate.variants.find(v => v._id.toString() === variantId)
        if (variantToUpdate) {
          variantToUpdate.stock -= quantity
        }
      } else if (
        productToUpdate.optionsType === 'none' ||
        !productToUpdate.variants ||
        productToUpdate.variants.length === 0
      ) {
        // Deduct from main product stock if no variants
        productToUpdate.inStock -= quantity
      }

      // Recalculate overall product inStock
      productToUpdate.inStock = productToUpdate.variants.reduce((sum, v) => sum + v.stock, 0)

      await productToUpdate.save()

      // Add/Update item in the cart
      const existingCartItemIndex = currentCart.items.findIndex(
        item => item.productID === productID && item.variantId === variantId
      )

      if (existingCartItemIndex > -1) {
        // Update quantity of existing item
        currentCart.items[existingCartItemIndex].quantity += quantity
      } else {
        // Add new item to cart
        updatedItems.push({
          _id: incomingItem._id || Math.random().toString(36).substr(2, 9),
          itemID: incomingItem.itemID || Math.random().toString(36).substr(2, 9),
          productID,
          name: incomingItem.name || product.title,
          price: targetVariant.price || product.price,
          originalPrice: incomingItem.originalPrice || product.price,
          finalPrice: targetVariant.price
            ? targetVariant.price * (1 - (targetVariant.discount || 0) / 100)
            : product.price * (1 - (product.discount || 0) / 100),
          discount: targetVariant.discount || product.discount,
          quantity,
          image: incomingItem.image || product.images?.[0]?.url,
          inStock: targetVariant.stock, // This is the remaining stock after deduction
          color: targetVariant.color || incomingItem.color,
          size: targetVariant.size ? { size: targetVariant.size } : incomingItem.size,
          variantId: targetVariant._id.toString(),
        })
      }
    }

    // Filter out nulls from currentCart.items and ensure existing items are added to updatedItems
    currentCart.items = currentCart.items.filter(item => {
      const isUpdated = updatedItems.some(
        updated => updated.productID === item.productID && updated.variantId === item.variantId
      )
      return !isUpdated // Keep items that were not updated in the loop
    })
    currentCart.items.push(...updatedItems)

    // Recalculate totalItems and totalPrice for the entire cart
    currentCart.totalItems = currentCart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    currentCart.totalPrice = currentCart.items.reduce(
      (sum, item) => sum + (item.finalPrice || item.price || 0) * (item.quantity || 0),
      0
    )

    await currentCart.save()

    return new Response(JSON.stringify({ success: true, cart: currentCart }), { status: 200 })
  } catch (error) {
    console.error('Error processing cart:', error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 })
  }
}

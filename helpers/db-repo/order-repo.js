import mongoose from 'mongoose'
import { Product, Order } from '@/models'
import { connect } from '@/helpers/db'

class OrderRepository {
  async getAll({ page, page_size }, filter) {
    await connect()
    const orders = await Order.find(filter)
      .populate('user', '-password')
      .populate('timeline.userId', 'name email')
      .skip((page - 1) * page_size)
      .limit(page_size)
      .sort({
        createdAt: 'desc',
      })
    const ordersLength = await Order.countDocuments(filter)
    return {
      orders,
      ordersLength,
      pagination: {
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: page_size * page < ordersLength,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(ordersLength / page_size),
      },
    }
  }

  async getById(id) {
    await connect()
    const result = await Order.findById(id)
      .populate('user', '-password')
      .populate('timeline.userId', 'name email')
    if (!result) throw new Error('Order not found')
    return result
  }

  async create(userId, data) {
    try {
      await connect()

      // Make sure userId is valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID')
      }

      // Format cart items according to schema
      const formattedCart = data.cart.map(item => ({
        productID: item.productID || item._id,
        baseProductId: new mongoose.Types.ObjectId(item.productID || item._id), // Convert to ObjectId
        quantity: item.quantity,
        price: item.finalPrice || item.price,
        originalPrice: item.originalPrice || item.price,
        discount: item.discount || 0,
        name: item.name,
        image: item.image || '',
        color: {
          id: item.color?.id || 'default',
          name: item.color?.name || 'Default',
          hashCode: item.color?.hashCode || '#000000',
        },
        size: {
          id: item.size?.id || 'default',
          size: item.size?.size || 'One Size',
        },
        isMelhaf: item.isMelhaf || false,
        model: item.model || 'product',
      }))

      // Format items array according to schema
      const formattedItems = data.items.map(item => ({
        productId: item.productId || item._id,
        name: item.name,
        quantity: item.quantity,
        originalPrice: item.originalPrice || item.price,
        discountedPrice: item.discountedPrice || item.finalPrice,
        color: {
          id: item.color?.id || 'default',
          name: item.color?.name || 'Default',
          hashCode: item.color?.hashCode || '#000000',
        },
        size: {
          id: item.size?.id || 'default',
          size: item.size?.size || 'One Size',
        },
        image: item.image || '',
      }))

      // Create order with initial timeline entry
      const orderData = {
        user: userId,
        mobile: data.mobile || '+22200000000', // Ensure mobile is never empty
        address: {
          province: data.address?.province || '',
          city: data.address?.city || '',
          area: data.address?.area || '',
          street: data.address?.street || '',
          postalCode: data.address?.postalCode || '',
        },
        shippingAddress: {
          street: data.shippingAddress?.street || '',
          area: data.shippingAddress?.area || '',
          city: data.shippingAddress?.city || '',
          province: data.shippingAddress?.province || '',
          postalCode: data.shippingAddress?.postalCode || '',
        },
        cart: formattedCart,
        items: formattedItems,
        totalItems: data.totalItems,
        totalPrice: data.totalPrice,
        subtotalBeforeDiscounts: data.subtotalBeforeDiscounts,
        totalDiscount: data.totalDiscount,
        paymentMethod: data.paymentMethod,
        status: data.status || 'pending',
        delivered: data.delivered || false,
        paid: data.paid || false,
        paymentVerification: {
          ...data.paymentVerification,
          image: data.paymentVerification?.image || '',
          status: data.paymentVerification?.status || 'pending',
          verificationStatus: data.paymentVerification?.verificationStatus || 'pending',
        },
        tracking: data.tracking || [
          {
            status: 'pending',
            date: new Date(),
            location: 'Order received',
            description: 'Order has been created',
          },
        ],
        timeline: [
          {
            type: 'status',
            content: 'Order created',
            userId: userId,
          },
        ],
      }

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2))

      const order = new Order(orderData)
      await order.save()

      return order
    } catch (error) {
      console.error('Order creation error:', error)
      throw error
    }
  }

  async updateStatus(orderId, userId, newStatus) {
    try {
      await connect()
      const order = await Order.findById(orderId)
      if (!order) throw new Error('Order not found')

      await order.updateStatus(newStatus, userId)

      // Populate user and timeline data before returning
      return await Order.findById(orderId)
        .populate('user', '-password')
        .populate('timeline.userId', 'name email')
    } catch (error) {
      console.error('Order status update error:', error)
      throw error
    }
  }

  async updateProductStats(productId, quantity) {
    try {
      await connect()
      // First get the current product
      const product = await Product.findById(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      // Ensure stock and sold values are valid numbers
      const currentStock = parseInt(product.inStock) || 0
      const currentSold = parseInt(product.sold) || 0

      // Validate stock
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for product ${product.title}`)
      }

      // Update using explicit numbers
      const result = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            inStock: currentStock - quantity,
            sold: currentSold + quantity,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )

      if (!result) {
        throw new Error(`Failed to update product ${productId}`)
      }

      return result
    } catch (error) {
      console.error('Product update error:', error)
      throw error
    }
  }

  async update(id, params) {
    await connect()
    const order = await Order.findById(id)
    if (!order) throw new Error('Order not found')
    const updatedOrder = await Order.findByIdAndUpdate({ _id: id }, { ...params }, { new: true })
      .populate('user', '-password')
      .populate('timeline.userId', 'name email')
    return updatedOrder
  }

  async delete(id) {
    await connect()
    const order = await Order.findById(id)
    if (!order) throw new Error('Order not found')
    await Order.findByIdAndDelete(id)
  }

  async getByUserId(userId) {
    await connect()
    const orders = await Order.find({ user: userId })
      .populate('user', 'name email')
      .populate('timeline.userId', 'name email')
      .sort({ createdAt: -1 })
    return orders
  }
}

export const orderRepo = new OrderRepository()

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

      // Create order with initial timeline entry and ensure mobile is set
      const orderData = {
        ...data,
        mobile: data.mobile || '+22200000000', // Ensure mobile is never empty
        user: userId,
        status: 'pending',
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

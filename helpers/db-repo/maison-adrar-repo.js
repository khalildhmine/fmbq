import { connectDb } from '@/lib/db'
import MaisonAdrar from '@/models/MaisonAdrar'

export const maisonAdrarRepo = {
  // Get all perfumes with optional filtering and pagination
  getAll: async ({
    page = 1,
    limit = 10,
    search = '',
    type = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) => {
    try {
      await connectDb()

      console.log('Fetching perfumes with params:', { page, limit, search, type })

      const filter = {
        isActive: true, // Only get active perfumes
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }),
        ...(type && { type: type.toLowerCase() }),
      }

      const [perfumes, total] = await Promise.all([
        MaisonAdrar.find(filter)
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        MaisonAdrar.countDocuments(filter),
      ])

      console.log(`Found ${perfumes.length} perfumes out of ${total} total`)

      return {
        success: true,
        data: {
          perfumes,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
          },
        },
      }
    } catch (error) {
      console.error('Error in maisonAdrarRepo.getAll:', error)
      throw error
    }
  },

  // Get featured perfumes
  getFeatured: async (limit = 8) => {
    await connectDb()

    const perfumes = await MaisonAdrar.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return perfumes
  },

  // Get newest perfumes
  getNewest: async (limit = 8) => {
    await connectDb()

    const perfumes = await MaisonAdrar.find({}).sort({ createdAt: -1 }).limit(limit).lean()

    return perfumes
  },

  // Get a single perfume by ID
  getById: async id => {
    await connectDb()

    const perfume = await MaisonAdrar.findById(id).lean()

    if (!perfume) {
      throw new Error('Perfume not found')
    }

    return perfume
  },

  // Create a new perfume
  create: async perfumeData => {
    await connectDb()

    // Convert type to lowercase
    if (perfumeData.type) {
      perfumeData.type = perfumeData.type.toLowerCase()
    }

    const perfume = new MaisonAdrar(perfumeData)
    await perfume.save()

    return perfume
  },

  // Update a perfume
  update: async (id, perfumeData) => {
    await connectDb()

    // Convert type to lowercase
    if (perfumeData.type) {
      perfumeData.type = perfumeData.type.toLowerCase()
    }

    const perfume = await MaisonAdrar.findByIdAndUpdate(id, perfumeData, {
      new: true,
      runValidators: true,
    })

    if (!perfume) {
      throw new Error('Perfume not found')
    }

    return perfume
  },

  // Delete a perfume
  delete: async id => {
    await connectDb()

    const perfume = await MaisonAdrar.findByIdAndDelete(id)

    if (!perfume) {
      throw new Error('Perfume not found')
    }

    return perfume
  },

  // Update perfume stock
  updateStock: async (id, quantity) => {
    await connectDb()

    const perfume = await MaisonAdrar.findById(id)

    if (!perfume) {
      throw new Error('Perfume not found')
    }

    if (perfume.inStock < quantity) {
      throw new Error('Not enough stock available')
    }

    perfume.inStock -= quantity
    perfume.sold += quantity

    await perfume.save()

    return perfume
  },

  // Get perfume statistics
  getStats: async () => {
    await connectDb()

    const totalPerfumes = await MaisonAdrar.countDocuments({})
    const totalInStock = await MaisonAdrar.aggregate([
      { $group: { _id: null, total: { $sum: '$inStock' } } },
    ])
    const totalSold = await MaisonAdrar.aggregate([
      { $group: { _id: null, total: { $sum: '$sold' } } },
    ])

    const stockValue = await MaisonAdrar.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ['$price', '$inStock'],
            },
          },
        },
      },
    ])

    return {
      totalPerfumes,
      totalInStock: totalInStock.length > 0 ? totalInStock[0].total : 0,
      totalSold: totalSold.length > 0 ? totalSold[0].total : 0,
      stockValue: stockValue.length > 0 ? stockValue[0].total : 0,
    }
  },

  // Get perfumes by type
  getByType: async (type, limit = 10) => {
    await connectDb()

    const perfumes = await MaisonAdrar.find({ type: type.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return perfumes
  },
}

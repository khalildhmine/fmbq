import { connectToDatabase } from '../helpers/db.js'
import { ObjectId } from 'mongodb'

/**
 * Initialize the default category structure
 * Men, Women, Perfumes as top-level categories
 * Following Zalando-like organization
 */
async function initCategories() {
  try {
    console.log('Connecting to database...')
    const { db } = await connectToDatabase()
    const collection = db.collection('categories')

    // Check if categories already exist
    const existingCount = await collection.countDocuments()
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing categories. Skipping initialization.`)
      console.log('To force reinitialization, drop the categories collection first.')
      return
    }

    console.log('Creating top-level categories...')

    // Create top-level categories (level 0)
    const topLevelCategories = [
      {
        _id: new ObjectId(),
        name: 'Men',
        slug: 'men',
        level: 0,
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3',
        bannerImage: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb5d45a?ixlib=rb-4.0.3',
        description: "Shop men's clothing, shoes, and accessories",
        featured: true,
        displayOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Women',
        slug: 'women',
        level: 0,
        image: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?ixlib=rb-4.0.3',
        bannerImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3',
        description: "Shop women's clothing, shoes, and accessories",
        featured: true,
        displayOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Perfumes',
        slug: 'perfumes',
        level: 0,
        image: 'https://images.unsplash.com/photo-1615354310188-082663eaa7db?ixlib=rb-4.0.3',
        bannerImage: 'https://images.unsplash.com/photo-1556228578-14a0a81e0a4d?ixlib=rb-4.0.3',
        description: 'Explore luxury fragrances for everyone',
        featured: true,
        displayOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const menId = topLevelCategories[0]._id
    const womenId = topLevelCategories[1]._id
    const perfumesId = topLevelCategories[2]._id

    // Define sublevel categories (level 1) for Men
    const menSubcategories = [
      {
        _id: new ObjectId(),
        name: 'Clothing',
        slug: 'men-clothing',
        parent: menId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-4.0.3',
        description: "Men's shirts, trousers, jackets and more",
        displayOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Shoes',
        slug: 'men-shoes',
        parent: menId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3',
        description: "Men's sneakers, boots, formal shoes and more",
        displayOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Accessories',
        slug: 'men-accessories',
        parent: menId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1601924928357-22d3b3abdfb9?ixlib=rb-4.0.3',
        description: 'Belts, watches, sunglasses and more',
        displayOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Define sublevel categories (level 1) for Women
    const womenSubcategories = [
      {
        _id: new ObjectId(),
        name: 'Clothing',
        slug: 'women-clothing',
        parent: womenId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3',
        description: "Women's dresses, tops, jeans and more",
        displayOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Shoes',
        slug: 'women-shoes',
        parent: womenId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3',
        description: "Women's heels, flats, sneakers and more",
        displayOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Accessories',
        slug: 'women-accessories',
        parent: womenId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?ixlib=rb-4.0.3',
        description: 'Bags, jewelry, belts and more',
        displayOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Define sublevel categories (level 1) for Perfumes
    const perfumeSubcategories = [
      {
        _id: new ObjectId(),
        name: "Men's Fragrances",
        slug: 'mens-fragrances',
        parent: perfumesId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1590736969306-79a44da24b31?ixlib=rb-4.0.3',
        description: 'Perfumes and colognes for men',
        displayOrder: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Women's Fragrances",
        slug: 'womens-fragrances',
        parent: perfumesId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1596742578443-7682ef5251cd?ixlib=rb-4.0.3',
        description: 'Perfumes and fragrances for women',
        displayOrder: 2,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Unisex Fragrances',
        slug: 'unisex-fragrances',
        parent: perfumesId,
        level: 1,
        image: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e33?ixlib=rb-4.0.3',
        description: 'Neutral fragrances for everyone',
        displayOrder: 3,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Define level 2 categories for Men's Clothing
    const menClothingId = menSubcategories[0]._id
    const menClothingSubcategories = [
      {
        _id: new ObjectId(),
        name: 'T-shirts & Polos',
        slug: 'men-tshirts-polos',
        parent: menClothingId,
        level: 2,
        image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-4.0.3',
        displayOrder: 1,
        active: true,
        attributeFilters: [
          { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Color', values: ['Black', 'White', 'Blue', 'Gray', 'Red'] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Jeans',
        slug: 'men-jeans',
        parent: menClothingId,
        level: 2,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3',
        displayOrder: 2,
        active: true,
        attributeFilters: [
          { name: 'Size', values: ['28', '30', '32', '34', '36', '38', '40'] },
          { name: 'Fit', values: ['Slim', 'Regular', 'Relaxed', 'Skinny'] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Jackets & Coats',
        slug: 'men-jackets-coats',
        parent: menClothingId,
        level: 2,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3',
        displayOrder: 3,
        active: true,
        attributeFilters: [
          { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Type', values: ['Leather', 'Denim', 'Bomber', 'Parka', 'Raincoat'] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // All categories
    const allCategories = [
      ...topLevelCategories,
      ...menSubcategories,
      ...womenSubcategories,
      ...perfumeSubcategories,
      ...menClothingSubcategories,
    ]

    // Insert all categories
    const result = await collection.insertMany(allCategories)
    console.log(`Successfully inserted ${result.insertedCount} categories`)

    console.log('Categories initialization complete!')
  } catch (error) {
    console.error('Failed to initialize categories:', error)
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  initCategories()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}

export default initCategories

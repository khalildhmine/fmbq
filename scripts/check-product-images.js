// Check product images script
// This script connects to the database and checks all product images
// to identify any issues with image URLs or formats

const { connectToDatabase } = require('../helpers/db')
const fetch = require('node-fetch')

async function checkProductImages() {
  console.log('Starting product image check...')

  try {
    // Connect to database
    const connection = await connectToDatabase()
    const db = connection.db
    const productsCollection = db.collection('products')

    // Get all products
    const products = await productsCollection.find({}).toArray()
    console.log(`Found ${products.length} products to check`)

    // Track statistics
    let stats = {
      total: products.length,
      hasImages: 0,
      missingImages: 0,
      invalidFormat: 0,
      inaccessible: 0,
      fixedProducts: 0,
    }

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`Checking product ${i + 1}/${products.length}: ${product.title || product._id}`)

      // Check if product has images array
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        console.log(`  ❌ No images found`)
        stats.missingImages++

        // Fix: Add placeholder image
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { images: [{ url: '/placeholder.svg' }] } }
        )
        stats.fixedProducts++
        continue
      }

      // Check image format
      let hasInvalidFormat = false
      let updatedImages = [...product.images]
      let needsUpdate = false

      for (let j = 0; j < product.images.length; j++) {
        const image = product.images[j]

        // Check if image is in correct format (object with url property)
        if (typeof image !== 'object' || !image.url) {
          hasInvalidFormat = true
          console.log(`  ❌ Image ${j + 1} has invalid format: ${JSON.stringify(image)}`)

          // Fix: Convert to proper format if possible
          if (typeof image === 'string') {
            updatedImages[j] = { url: image }
            needsUpdate = true
          } else if (typeof image === 'object' && image !== null) {
            // Try to salvage object format
            if (image.src) {
              updatedImages[j] = { url: image.src }
              needsUpdate = true
            } else if (image.path) {
              updatedImages[j] = { url: image.path }
              needsUpdate = true
            } else {
              // Can't salvage, use placeholder
              updatedImages[j] = { url: '/placeholder.svg' }
              needsUpdate = true
            }
          } else {
            // Can't salvage, use placeholder
            updatedImages[j] = { url: '/placeholder.svg' }
            needsUpdate = true
          }
        } else {
          // Image has correct format, check if URL is valid
          const imageUrl = image.url

          // Check for known problematic URLs
          if (
            imageUrl.includes('images.puma.com') ||
            imageUrl.includes('example.com') ||
            (!imageUrl.startsWith('http') && !imageUrl.startsWith('/'))
          ) {
            console.log(`  ❌ Image ${j + 1} has problematic URL: ${imageUrl}`)
            updatedImages[j] = { url: '/placeholder.svg' }
            needsUpdate = true
          }
          // Skip external URL validation for now
          else if (imageUrl.startsWith('http')) {
            console.log(`  ✓ Image ${j + 1} format is valid (external URL)`)
          } else if (imageUrl.startsWith('/')) {
            console.log(`  ✓ Image ${j + 1} format is valid (local path)`)
          } else {
            console.log(`  ❌ Image ${j + 1} has suspicious URL: ${imageUrl}`)
            updatedImages[j] = { url: '/placeholder.svg' }
            needsUpdate = true
          }
        }
      }

      // Update product if needed
      if (needsUpdate) {
        console.log(`  🔧 Fixing images for product ${product._id}`)
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { images: updatedImages } }
        )
        stats.fixedProducts++
      }

      if (hasInvalidFormat) {
        stats.invalidFormat++
      } else {
        stats.hasImages++
      }
    }

    // Report results
    console.log('\nImage Check Complete!')
    console.log('=====================')
    console.log(`Total products checked: ${stats.total}`)
    console.log(`Products with valid images: ${stats.hasImages}`)
    console.log(`Products missing images: ${stats.missingImages}`)
    console.log(`Products with invalid image format: ${stats.invalidFormat}`)
    console.log(`Products with inaccessible images: ${stats.inaccessible}`)
    console.log(`Products fixed: ${stats.fixedProducts}`)
  } catch (error) {
    console.error('Error checking product images:', error)
  }
}

// Run the script
checkProductImages()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch(err => {
    console.error('Script failed:', err)
    process.exit(1)
  })

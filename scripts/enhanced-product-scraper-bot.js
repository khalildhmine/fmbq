#!/usr/bin/env node

/**
 * Enhanced Product Scraping Bot
 *
 * A professional, production-ready bot that scrapes product data from known brand websites,
 * processes it with AI, and submits it to the database.
 *
 * Features:
 * - Advanced Playwright-based web scraping with fallback selectors
 * - AI-powered data cleaning and classification using Gemini
 * - Cloudinary image upload integration
 * - Automatic category and brand detection
 * - Professional e-commerce data formatting
 * - Comprehensive error handling and retry logic
 * - Detailed logging and progress tracking
 */

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

import { chromium } from 'playwright'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fetch from 'node-fetch'
import FormData from 'form-data'
import CONFIG from './config.js'

class EnhancedProductScrapingBot {
  constructor() {
    this.browser = null
    this.page = null
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || CONFIG.AI.API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: CONFIG.AI.MODEL })
    this.stats = {
      startTime: null,
      endTime: null,
      imagesProcessed: 0,
      imagesUploaded: 0,
      errors: [],
    }
  }

  /**
   * Initialize the browser with advanced configuration
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Product Scraping Bot...')

      this.browser = await chromium.launch({
        headless: CONFIG.BROWSER.HEADLESS,
        args: CONFIG.BROWSER.ARGS,
      })

      this.page = await this.browser.newPage()

      // Set viewport
      await this.page.setViewportSize(CONFIG.SCRAPING.VIEWPORT)

      // Set extra headers including user agent
      const headers = {
        ...CONFIG.BROWSER.HEADERS,
        'User-Agent': CONFIG.SCRAPING.USER_AGENT,
      }
      await this.page.setExtraHTTPHeaders(headers)

      // Add stealth measures
      await this.page.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        })

        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        })

        // Override languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en', 'fr'],
        })
      })

      // Enable request interception for better performance
      await this.page.route('**/*', route => {
        const resourceType = route.request().resourceType()
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
          route.abort()
        } else {
          route.continue()
        }
      })

      console.log('✅ Browser initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error.message)
      throw error
    }
  }

  /**
   * Detect brand from URL with fallback logic
   */
  detectBrand(url) {
    const domain = new URL(url).hostname.toLowerCase()

    for (const [brandDomain, brandInfo] of Object.entries(CONFIG.BRANDS)) {
      if (domain.includes(brandDomain)) {
        console.log(`🏷️  Detected brand: ${brandInfo.name} (${brandInfo.country})`)
        return brandInfo
      }
    }

    // Fallback: try to detect brand from URL patterns
    if (domain.includes('burberry'))
      return { name: 'Burberry', country: 'UK', selectors: CONFIG.BRANDS['burberry.com'].selectors }
    if (domain.includes('zara'))
      return { name: 'Zara', country: 'Spain', selectors: CONFIG.BRANDS['zara.com'].selectors }
    if (domain.includes('nike'))
      return { name: 'Nike', country: 'USA', selectors: CONFIG.BRANDS['nike.com'].selectors }

    throw new Error(`Unsupported brand domain: ${domain}`)
  }

  /**
   * Scrape product data with advanced error handling
   */
  async scrapeProduct(url) {
    try {
      console.log(`🔍 Scraping product from: ${url}`)

      const brand = this.detectBrand(url)

      // Navigate to the page with retry logic
      await this.navigateWithRetry(url, brand.waitFor)

      // Extract product data using fallback selectors
      const productData = await this.extractProductDataWithFallbacks(brand.selectors)

      console.log('📊 Raw scraped data:', JSON.stringify(productData, null, 2))

      return {
        ...productData,
        brand: brand.name,
        sourceUrl: url,
      }
    } catch (error) {
      console.error('❌ Scraping failed:', error.message)
      this.stats.errors.push({ step: 'scraping', error: error.message })
      throw error
    }
  }

  /**
   * Navigate to page with retry logic and error detection
   */
  async navigateWithRetry(url, waitForSelector) {
    let attempts = 0
    const maxAttempts = CONFIG.ERROR_HANDLING.MAX_RETRIES

    while (attempts < maxAttempts) {
      try {
        attempts++
        console.log(`📄 Navigation attempt ${attempts}/${maxAttempts}`)
        console.log(`🌐 Navigating to: ${url}`)

        // Navigate to the page
        const response = await this.page.goto(url, {
          waitUntil: 'domcontentloaded', // Changed from 'networkidle' for faster loading
          timeout: CONFIG.SCRAPING.TIMEOUT,
        })

        console.log(`📡 Response status: ${response?.status()}`)
        console.log(`📄 Current URL: ${this.page.url()}`)

        // Wait for content to load
        console.log('⏳ Waiting for page content...')
        await this.page.waitForTimeout(CONFIG.SCRAPING.WAIT_TIME)

        // Get page title for debugging
        const pageTitle = await this.page.title()
        console.log(`📝 Page title: ${pageTitle}`)

        // Check for CAPTCHA or security challenges
        const pageContent = await this.page.content()
        console.log(`📊 Page content length: ${pageContent.length} characters`)

        const hasCaptcha = CONFIG.ERROR_HANDLING.CAPTCHA_DETECTION.some(term =>
          pageContent.toLowerCase().includes(term)
        )

        if (hasCaptcha) {
          throw new Error('CAPTCHA or security challenge detected')
        }

        // Wait for specific selector if provided
        if (waitForSelector) {
          console.log(`🔍 Waiting for selector: ${waitForSelector}`)
          await this.page.waitForSelector(waitForSelector, { timeout: 10000 })
        }

        console.log('✅ Page loaded successfully')
        return
      } catch (error) {
        console.warn(`⚠️  Navigation attempt ${attempts} failed:`, error.message)
        console.warn(`🔍 Error details:`, error)

        if (attempts === maxAttempts) {
          throw new Error(`Failed to navigate after ${maxAttempts} attempts: ${error.message}`)
        }

        // Wait before retry
        console.log(`⏳ Waiting ${CONFIG.ERROR_HANDLING.RETRY_DELAY * attempts}ms before retry...`)
        await this.page.waitForTimeout(CONFIG.ERROR_HANDLING.RETRY_DELAY * attempts)
      }
    }
  }

  /**
   * Extract product data using fallback selectors
   */
  async extractProductDataWithFallbacks(selectors) {
    try {
      const data = {}

      // Extract title with fallback selectors
      data.title = await this.extractTextWithFallbacks(selectors.title)

      // Extract price with fallback selectors
      data.price = await this.extractPriceWithFallbacks(selectors.price)

      // Extract description with fallback selectors
      data.description = await this.extractTextWithFallbacks(selectors.description)

      // Extract sizes with fallback selectors
      data.sizes = await this.extractSizesWithFallbacks(selectors.sizes)

      // Extract colors with fallback selectors
      data.colors = await this.extractColorsWithFallbacks(selectors.colors)

      // Extract images with fallback selectors
      data.images = await this.extractImagesWithFallbacks(selectors.images)

      return data
    } catch (error) {
      console.error('❌ Data extraction failed:', error.message)
      throw error
    }
  }

  /**
   * Extract text content with fallback selectors
   */
  async extractTextWithFallbacks(selectorArray) {
    for (const selector of selectorArray) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          const text = await element.textContent()
          if (text && text.trim()) {
            return text.trim()
          }
        }
      } catch (error) {
        console.warn(`⚠️  Selector ${selector} failed:`, error.message)
      }
    }
    return ''
  }

  /**
   * Extract price with fallback selectors
   */
  async extractPriceWithFallbacks(selectorArray) {
    for (const selector of selectorArray) {
      try {
        const text = await this.extractTextWithFallbacks([selector])
        if (text) {
          // Extract numeric price from text
          const priceMatch = text.match(/[\d,]+\.?\d*/)
          if (priceMatch) {
            return parseFloat(priceMatch[0].replace(/,/g, ''))
          }
        }
      } catch (error) {
        console.warn(`⚠️  Price extraction from ${selector} failed:`, error.message)
      }
    }
    return 0
  }

  /**
   * Extract sizes with fallback selectors
   */
  async extractSizesWithFallbacks(selectorArray) {
    const sizes = []

    for (const selector of selectorArray) {
      try {
        const sizeElements = await this.page.$$(selector)
        for (const element of sizeElements) {
          const size = await element.textContent()
          if (size && size.trim() && !sizes.includes(size.trim())) {
            sizes.push(size.trim())
          }
        }
        if (sizes.length > 0) break
      } catch (error) {
        console.warn(`⚠️  Size extraction from ${selector} failed:`, error.message)
      }
    }

    return sizes
  }

  /**
   * Extract colors with fallback selectors
   */
  async extractColorsWithFallbacks(selectorArray) {
    const colors = []

    for (const selector of selectorArray) {
      try {
        const colorElements = await this.page.$$(selector)
        for (const element of colorElements) {
          const color = await element.textContent()
          if (color && color.trim() && !colors.includes(color.trim())) {
            colors.push(color.trim())
          }
        }
        if (colors.length > 0) break
      } catch (error) {
        console.warn(`⚠️  Color extraction from ${selector} failed:`, error.message)
      }
    }

    return colors
  }

  /**
   * Extract images with fallback selectors
   */
  async extractImagesWithFallbacks(selectorArray) {
    const images = []

    for (const selector of selectorArray) {
      try {
        const imageElements = await this.page.$$(selector)
        for (const element of imageElements) {
          const src = await element.getAttribute('src')
          if (src) {
            // Convert relative URLs to absolute
            const absoluteUrl = src.startsWith('http') ? src : new URL(src, this.page.url()).href
            if (!images.includes(absoluteUrl)) {
              images.push(absoluteUrl)
            }
          }
        }
        if (images.length > 0) break
      } catch (error) {
        console.warn(`⚠️  Image extraction from ${selector} failed:`, error.message)
      }
    }

    return images
  }

  /**
   * Process data with AI using enhanced prompt
   */
  async processWithAI(scrapedData) {
    try {
      console.log('🤖 Processing data with AI...')

      // Build comprehensive prompt with category information
      const prompt = this.buildAIPrompt(scrapedData)

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI response does not contain valid JSON')
      }

      const aiResult = JSON.parse(jsonMatch[0])

      // Validate AI result
      this.validateAIResult(aiResult)

      console.log('✅ AI processing completed:', JSON.stringify(aiResult, null, 2))

      return aiResult
    } catch (error) {
      console.error('❌ AI processing failed:', error.message)
      this.stats.errors.push({ step: 'ai_processing', error: error.message })
      throw error
    }
  }

  /**
   * Build comprehensive AI prompt
   */
  buildAIPrompt(scrapedData) {
    const categoryList = this.buildCategoryList()

    return `You are an expert e-commerce product data formatter and classifier.

Given the raw title, description, and brand from a scraped product page, please:

1. Clean the title: Make it short, clear, and professional for e-commerce display
2. Rewrite the description: Polish it in professional e-commerce style while preserving all factual details
3. Classify the product: Assign the most accurate category from our predefined list
4. Detect gender target: Determine if it's Men, Women, or Unisex

IMPORTANT: Use ONLY the categories from our predefined list. Do not create new categories.

Available Categories:
${categoryList}

Raw Data:
- Title: "${scrapedData.title}"
- Description: "${scrapedData.description}"
- Brand: "${scrapedData.brand}"

Return ONLY a valid JSON object in this exact format:
{
  "title": "cleaned title here",
  "description": "polished description here",
  "category": "exact category from list above",
  "gender": "Men|Women|Unisex"
}`
  }

  /**
   * Build category list from configuration
   */
  buildCategoryList() {
    let categoryList = ''

    for (const [gender, categories] of Object.entries(CONFIG.CATEGORIES)) {
      for (const [category, subcategories] of Object.entries(categories)) {
        if (Array.isArray(subcategories)) {
          for (const subcategory of subcategories) {
            categoryList += `- ${gender} > ${category} > ${subcategory}\n`
          }
        } else if (typeof subcategories === 'object') {
          // Handle nested subcategories
          for (const [subcategory, keywords] of Object.entries(subcategories)) {
            categoryList += `- ${gender} > ${category} > ${subcategory}\n`
          }
        }
      }
    }

    return categoryList
  }

  /**
   * Validate AI result
   */
  validateAIResult(aiResult) {
    const requiredFields = ['title', 'description', 'category', 'gender']
    const validGenders = ['Men', 'Women', 'Unisex']

    for (const field of requiredFields) {
      if (!aiResult[field]) {
        throw new Error(`AI result missing required field: ${field}`)
      }
    }

    if (!validGenders.includes(aiResult.gender)) {
      throw new Error(`Invalid gender value: ${aiResult.gender}`)
    }

    // Validate category format
    const categoryParts = aiResult.category.split(' > ')
    if (categoryParts.length !== 3) {
      throw new Error(`Invalid category format: ${aiResult.category}`)
    }
  }

  /**
   * Upload images to Cloudinary with enhanced error handling
   */
  async uploadImages(imageUrls) {
    try {
      console.log(`📤 Uploading ${imageUrls.length} images to Cloudinary...`)

      const uploadedImages = []

      for (const imageUrl of imageUrls) {
        try {
          this.stats.imagesProcessed++

          // Download image
          const response = await fetch(imageUrl)
          if (!response.ok) {
            console.warn(`⚠️  Failed to download image: ${imageUrl}`)
            continue
          }

          const buffer = await response.buffer()

          // Validate image size and format
          if (!this.validateImage(buffer, imageUrl)) {
            continue
          }

          // Create form data
          const formData = new FormData()
          formData.append('file', buffer, {
            filename: 'product-image.jpg',
            contentType: 'image/jpeg',
          })

          // Upload to Cloudinary
          const uploadResponse = await fetch(
            process.env.CLOUDINARY_UPLOAD_URL || CONFIG.CLOUDINARY_UPLOAD_URL,
            {
              method: 'POST',
              body: formData,
            }
          )

          if (!uploadResponse.ok) {
            console.warn(`⚠️  Failed to upload image: ${imageUrl}`)
            continue
          }

          const uploadResult = await uploadResponse.json()
          uploadedImages.push({
            url: uploadResult.url,
            originalUrl: imageUrl,
          })

          this.stats.imagesUploaded++
          console.log(`✅ Uploaded: ${imageUrl}`)
        } catch (error) {
          console.warn(`⚠️  Failed to process image ${imageUrl}:`, error.message)
        }
      }

      console.log(`✅ Image upload completed: ${uploadedImages.length}/${imageUrls.length} images`)
      return uploadedImages
    } catch (error) {
      console.error('❌ Image upload failed:', error.message)
      this.stats.errors.push({ step: 'image_upload', error: error.message })
      throw error
    }
  }

  /**
   * Validate image before upload
   */
  validateImage(buffer, url) {
    // Check file size
    if (buffer.length > CONFIG.IMAGE_PROCESSING.MAX_SIZE) {
      console.warn(`⚠️  Image too large: ${url} (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`)
      return false
    }

    // Check file format (basic check)
    const header = buffer.slice(0, 4)
    const isJPEG = header[0] === 0xff && header[1] === 0xd8
    const isPNG =
      header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47

    if (!isJPEG && !isPNG) {
      console.warn(`⚠️  Unsupported image format: ${url}`)
      return false
    }

    return true
  }

  /**
   * Submit product to database
   */
  async submitToDatabase(productData) {
    try {
      console.log('💾 Submitting product to database...')

      const response = await fetch(process.env.DATABASE_API_URL || CONFIG.DATABASE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Database submission failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Product submitted successfully:', result)

      return result
    } catch (error) {
      console.error('❌ Database submission failed:', error.message)
      this.stats.errors.push({ step: 'database_submission', error: error.message })
      throw error
    }
  }

  /**
   * Main workflow with comprehensive error handling
   */
  async processProduct(url) {
    this.stats.startTime = new Date()

    try {
      console.log('🎯 Starting enhanced product processing workflow...')

      // Initialize browser
      await this.initialize()

      // Scrape product data
      const scrapedData = await this.scrapeProduct(url)

      // Process with AI
      const aiResult = await this.processWithAI(scrapedData)

      // Upload images
      const uploadedImages = await this.uploadImages(scrapedData.images)

      // Prepare final product data
      const finalProduct = {
        title: aiResult.title,
        description: aiResult.description,
        price: scrapedData.price,
        brand: scrapedData.brand,
        gender: aiResult.gender,
        category: aiResult.category,
        sizes: scrapedData.sizes,
        colors: scrapedData.colors,
        images: uploadedImages.map(img => ({ url: img.url })),
        sourceUrl: scrapedData.sourceUrl,
        inStock: 100, // Default stock
        discount: 0,
        active: true,
      }

      console.log('📋 Final product data:', JSON.stringify(finalProduct, null, 2))

      // Submit to database
      const result = await this.submitToDatabase(finalProduct)

      this.stats.endTime = new Date()
      this.printFinalStats()

      console.log('🎉 Enhanced product processing completed successfully!')
      return result
    } catch (error) {
      console.error('💥 Enhanced product processing failed:', error.message)
      this.stats.endTime = new Date()
      this.printFinalStats()
      throw error
    } finally {
      // Cleanup
      await this.cleanup()
    }
  }

  /**
   * Print final statistics
   */
  printFinalStats() {
    const duration = this.stats.endTime - this.stats.startTime
    console.log('\n📊 Final Statistics:')
    console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`🖼️  Images Processed: ${this.stats.imagesProcessed}`)
    console.log(`📤 Images Uploaded: ${this.stats.imagesUploaded}`)
    console.log(`❌ Errors: ${this.stats.errors.length}`)

    if (this.stats.errors.length > 0) {
      console.log('Error Details:')
      this.stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.step}: ${error.error}`)
      })
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
🚀 Enhanced Product Scraping Bot

Usage: node enhanced-product-scraper-bot.js <product-url>

Example: node enhanced-product-scraper-bot.js https://fr.burberry.com/polo-en-coton-p80726611

Supported brands: Burberry, Zara, Nike, H&M

Environment Variables:
- GEMINI_API_KEY: Your Gemini API key
- CLOUDINARY_UPLOAD_URL: Your Cloudinary upload endpoint
- DATABASE_API_URL: Your database API endpoint

Features:
- Advanced web scraping with fallback selectors
- AI-powered data cleaning and classification
- Comprehensive error handling and retry logic
- Professional e-commerce data formatting
- Detailed progress tracking and statistics
    `)
    process.exit(1)
  }

  const url = args[0]
  const bot = new EnhancedProductScrapingBot()

  try {
    await bot.processProduct(url)
  } catch (error) {
    console.error('💥 Enhanced bot execution failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
main()

export default EnhancedProductScrapingBot

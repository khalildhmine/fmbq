#!/usr/bin/env node

import EnhancedProductScrapingBot from './enhanced-product-scraper-bot.js'

console.log('🧪 Testing bot import...')

try {
  const bot = new EnhancedProductScrapingBot()
  console.log('✅ Bot class created successfully')
  console.log('Bot instance:', bot)
} catch (error) {
  console.error('❌ Failed to create bot:', error)
}

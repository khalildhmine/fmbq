#!/usr/bin/env node

import { chromium } from 'playwright'

async function testEcommerceSites() {
  console.log('🧪 Testing different e-commerce sites...')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Set realistic user agent
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const testSites = [
    'https://www.amazon.com/dp/B08N5WRWNW', // Amazon product
    'https://www.etsy.com/listing/1234567890', // Etsy product
    'https://www.ebay.com/itm/1234567890', // eBay product
  ]

  for (const site of testSites) {
    try {
      console.log(`\n🌐 Testing: ${site}`)

      const response = await page.goto(site, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })

      console.log(`📡 Status: ${response?.status()}`)
      console.log(`📝 Title: ${await page.title()}`)

      // Check if we got blocked
      const content = await page.content()
      if (
        content.includes('Access Denied') ||
        content.includes('Forbidden') ||
        content.includes('Blocked')
      ) {
        console.log('❌ Site blocked access')
      } else {
        console.log('✅ Site accessible')
        break
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
    }
  }

  await browser.close()
}

testEcommerceSites()

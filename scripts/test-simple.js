#!/usr/bin/env node

import { chromium } from 'playwright'

async function testSimpleScraping() {
  console.log('🧪 Testing simple web scraping...')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log('🌐 Navigating to a simple test page...')

    // Test with a simple, accessible website
    await page.goto('https://httpbin.org/html', { waitUntil: 'domcontentloaded' })

    const title = await page.title()
    const h1Text = await page.$eval('h1', el => el.textContent)

    console.log('✅ Successfully scraped:')
    console.log(`📝 Title: ${title}`)
    console.log(`📝 H1: ${h1Text}`)
  } catch (error) {
    console.error('❌ Simple scraping failed:', error.message)
  } finally {
    await browser.close()
  }
}

testSimpleScraping()

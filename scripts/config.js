/**
 * Configuration file for Product Scraping Bot
 *
 * This file contains all the configuration settings, brand-specific selectors,
 * and category mappings for the bot.
 */

export const CONFIG = {
  // AI Configuration
  AI: {
    MODEL: 'gemini-1.5-flash',
    MAX_RETRIES: 3,
    TIMEOUT: 30000,
  },

  // Scraping Configuration
  SCRAPING: {
    USER_AGENT:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    WAIT_TIME: 2000,
    VIEWPORT: { width: 1920, height: 1080 },
  },

  // Browser Configuration
  BROWSER: {
    HEADLESS: true, // Use headless for better reliability
    ARGS: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled',
      '--disable-extensions',
      '--no-default-browser-check',
      '--disable-default-apps',
    ],
    HEADERS: {
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  },

  // Supported Brands with detailed selectors
  BRANDS: {
    'burberry.com': {
      name: 'Burberry',
      country: 'UK',
      selectors: {
        title: ['h1[data-testid="product-title"]', 'h1.product-title', 'h1[class*="title"]', 'h1'],
        price: [
          '[data-testid="price"]',
          '.price',
          '.product-price',
          '[class*="price"]',
          '.current-price',
        ],
        description: [
          '[data-testid="description"]',
          '.description',
          '.product-description',
          '[class*="description"]',
          '.product-details',
        ],
        sizes: [
          '[data-testid="size-selector"] option',
          '.size-selector option',
          '.size-option',
          '[class*="size"] option',
        ],
        colors: [
          '[data-testid="color-selector"] option',
          '.color-selector option',
          '.color-option',
          '[class*="color"] option',
        ],
        images: [
          '[data-testid="product-image"] img',
          '.product-image img',
          '.gallery img',
          '[class*="image"] img',
          '.product-carousel img',
        ],
      },
      waitFor: '.product-container, .product-details',
      priceExtractor: text => {
        const match = text.match(/[\d,]+\.?\d*/)
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0
      },
    },

    'zara.com': {
      name: 'Zara',
      country: 'Spain',
      selectors: {
        title: [
          'h1[data-qa-action="product-name"]',
          'h1.product-name',
          'h1[class*="name"]',
          'h1',
          'h1',
          '.product-name',
          '[data-qa-action="product-name"]',
        ],
        price: [
          '[data-qa-action="product-price"]',
          '.price',
          '.product-price',
          '[class*="price"]',
          '.current-price',
          '.price-current',
          '[data-qa-action="price"]',
        ],
        description: [
          '[data-qa-action="product-description"]',
          '.description',
          '.product-description',
          '[class*="description"]',
          '.product-details',
          '.product-info',
          '.product-summary',
        ],
        sizes: [
          '[data-qa-action="size-selector"] option',
          '.size-selector option',
          '.size-option',
          '[class*="size"] option',
          '.size-selector select option',
          '.product-sizes option',
        ],
        colors: [
          '[data-qa-action="color-selector"] option',
          '.color-selector option',
          '.color-option',
          '[class*="color"] option',
          '.product-colors option',
          '.color-selector select option',
        ],
        images: [
          '[data-qa-action="product-image"] img',
          '.product-image img',
          '.gallery img',
          '[class*="image"] img',
          '.product-carousel img',
          '.product-photos img',
          '.product-gallery img',
        ],
      },
      waitFor: 'h1, .product-name, [data-qa-action="product-name"]',
      priceExtractor: text => {
        const match = text.match(/[\d,]+\.?\d*/)
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0
      },
    },

    'nike.com': {
      name: 'Nike',
      country: 'USA',
      selectors: {
        title: ['h1[data-test="product-title"]', 'h1.product-title', 'h1[class*="title"]', 'h1'],
        price: [
          '[data-test="product-price"]',
          '.price',
          '.product-price',
          '[class*="price"]',
          '.current-price',
        ],
        description: [
          '[data-test="product-description"]',
          '.description',
          '.product-description',
          '[class*="description"]',
          '.product-details',
        ],
        sizes: [
          '[data-test="size-selector"] option',
          '.size-selector option',
          '.size-option',
          '[class*="size"] option',
        ],
        colors: [
          '[data-test="color-selector"] option',
          '.color-selector option',
          '.color-option',
          '[class*="color"] option',
        ],
        images: [
          '[data-test="product-image"] img',
          '.product-image img',
          '.gallery img',
          '[class*="image"] img',
          '.product-carousel img',
        ],
      },
      waitFor: '.product-container, .product-details',
      priceExtractor: text => {
        const match = text.match(/[\d,]+\.?\d*/)
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0
      },
    },
  },

  // Category mappings for AI classification
  CATEGORIES: {
    Men: {
      Clothing: {
        'T-Shirts': ['t-shirt', 'tshirt', 'tee', 'shirt', 'top'],
        'Polo Shirts': ['polo', 'polo shirt', 'polo t-shirt'],
        Shirts: ['shirt', 'dress shirt', 'formal shirt', 'button-up'],
        Jeans: ['jeans', 'denim', 'pants'],
        Trousers: ['trousers', 'pants', 'slacks', 'chinos'],
        Jackets: ['jacket', 'blazer', 'coat', 'outerwear'],
        Hoodies: ['hoodie', 'hooded', 'sweatshirt'],
        Sweaters: ['sweater', 'jumper', 'pullover'],
      },
      Footwear: {
        Sneakers: ['sneakers', 'trainers', 'athletic shoes', 'sports shoes'],
        Boots: ['boots', 'boot', 'footwear'],
        Shoes: ['shoes', 'formal shoes', 'dress shoes'],
      },
      Accessories: {
        Bags: ['bag', 'backpack', 'messenger bag', 'tote'],
        Watches: ['watch', 'timepiece', 'wristwatch'],
        Belts: ['belt', 'waistband'],
      },
    },
    Women: {
      Clothing: {
        Dresses: ['dress', 'gown', 'frock'],
        Tops: ['top', 'blouse', 'shirt', 't-shirt'],
        Skirts: ['skirt', 'mini skirt', 'maxi skirt'],
        Jeans: ['jeans', 'denim', 'pants'],
        Trousers: ['trousers', 'pants', 'slacks'],
        Jackets: ['jacket', 'blazer', 'coat', 'outerwear'],
        Hoodies: ['hoodie', 'hooded', 'sweatshirt'],
        Sweaters: ['sweater', 'jumper', 'pullover'],
      },
      Footwear: {
        Sneakers: ['sneakers', 'trainers', 'athletic shoes', 'sports shoes'],
        Boots: ['boots', 'boot', 'footwear'],
        Shoes: ['shoes', 'heels', 'flats', 'pumps'],
      },
      Accessories: {
        Bags: ['bag', 'handbag', 'purse', 'clutch', 'tote'],
        Watches: ['watch', 'timepiece', 'wristwatch'],
        Jewelry: ['jewelry', 'necklace', 'earrings', 'bracelet'],
      },
    },
    Unisex: {
      Clothing: {
        'T-Shirts': ['t-shirt', 'tshirt', 'tee', 'shirt', 'top'],
        Hoodies: ['hoodie', 'hooded', 'sweatshirt'],
        Jackets: ['jacket', 'blazer', 'coat', 'outerwear'],
      },
      Footwear: {
        Sneakers: ['sneakers', 'trainers', 'athletic shoes', 'sports shoes'],
      },
      Accessories: {
        Bags: ['bag', 'backpack', 'messenger bag', 'tote'],
        Watches: ['watch', 'timepiece', 'wristwatch'],
      },
    },
  },

  // Error handling configuration
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    TIMEOUT: 30000,
    CAPTCHA_DETECTION: [
      'captcha',
      'cloudflare',
      'security check',
      'verify you are human',
      'challenge',
    ],
  },

  // Image processing configuration
  IMAGE_PROCESSING: {
    MAX_IMAGES: 10,
    MIN_IMAGE_SIZE: 100,
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    COMPRESSION_QUALITY: 0.8,
  },

  // Database field mappings
  DATABASE_MAPPING: {
    title: 'title',
    description: 'description',
    price: 'price',
    brand: 'brand',
    category: 'category',
    subcategory: 'subcategory',
    gender: 'gender',
    sizes: 'sizes',
    colors: 'colors',
    images: 'images',
    sourceUrl: 'sourceUrl',
  },
}

export default CONFIG

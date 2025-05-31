// Script runner for initializing categories
import initCategories from './init-categories.js'

console.log('Starting category initialization...')

;(async () => {
  try {
    await initCategories()
    console.log('Category initialization completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing categories:', error)
    process.exit(1)
  }
})()

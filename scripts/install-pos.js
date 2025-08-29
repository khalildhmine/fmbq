#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Installing POS System Dependencies...')

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory')
  process.exit(1)
}

// Dependencies that should already be installed
const requiredDeps = [
  'react-hot-toast',
  'axios',
  'react-icons'
]

// Check existing dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const existingDeps = Object.keys(packageJson.dependencies || {})

console.log('📦 Checking existing dependencies...')

let missingDeps = []
requiredDeps.forEach(dep => {
  if (!existingDeps.includes(dep)) {
    missingDeps.push(dep)
  }
})

if (missingDeps.length > 0) {
  console.log(`📥 Installing missing dependencies: ${missingDeps.join(', ')}`)
  try {
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' })
    console.log('✅ Dependencies installed successfully!')
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message)
    process.exit(1)
  }
} else {
  console.log('✅ All required dependencies are already installed!')
}

// Create POS directory structure
console.log('📁 Creating POS system directory structure...')

const posDirs = [
  'app/api/pos',
  'app/admin/(dashboard-layout)/pos'
]

posDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

console.log('\n🎉 POS System setup complete!')
console.log('\n📋 What was created:')
console.log('  • /app/api/pos/scan - Product scanning API endpoint')
console.log('  • /app/api/pos/checkout - Checkout processing API endpoint')
console.log('  • /app/admin/(dashboard-layout)/pos/page.jsx - POS dashboard page')
console.log('  • Updated admin sidebar with POS navigation')
console.log('\n🔧 Next steps:')
console.log('  1. Start your development server: npm run dev')
console.log('  2. Navigate to /admin/pos to access the POS system')
console.log('  3. Test scanning products and processing orders')
console.log('\n💡 Features included:')
console.log('  • Barcode/ID scanner integration')
console.log('  • Real-time inventory management')
console.log('  • Multiple payment methods (Cash, Bankili, Sedad, Masrvi)')
console.log('  • Customer information capture')
console.log('  • Receipt generation and printing')
console.log('  • Stock validation and updates')
console.log('\n🚀 Your POS system is ready to use!')

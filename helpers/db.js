// import mongoose from 'mongoose'

// const MONGODB_URI = process.env.MONGODB_URI

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable')
// }

// let cachedConnection = null
// let isConnecting = false
// let connectionAttempts = 0
// const MAX_CONNECTION_ATTEMPTS = 5

// // Set up event listeners only once
// const setupEventListeners = () => {
//   // Remove existing listeners to prevent duplicates
//   mongoose.connection.removeAllListeners('error')
//   mongoose.connection.removeAllListeners('disconnected')

//   // Set max listeners to prevent warnings
//   mongoose.connection.setMaxListeners(15)

//   // Add new listeners
//   mongoose.connection.on('error', err => {
//     console.error('MongoDB connection error:', err)
//     cachedConnection = null
//   })

//   mongoose.connection.on('disconnected', () => {
//     console.log('MongoDB disconnected')
//     cachedConnection = null
//   })
// }

// export async function connectToDatabase() {
//   // If we're already connecting, wait for that connection
//   if (isConnecting) {
//     console.log('Connection in progress, waiting...')
//     await new Promise(resolve => setTimeout(resolve, 1000))
//     return connectToDatabase()
//   }

//   // If we already have a connection, return it
//   if (cachedConnection && mongoose.connection.readyState === 1) {
//     console.log('Using existing MongoDB connection')
//     return {
//       db: mongoose.connection.db,
//       connection: mongoose.connection,
//       mongoose: mongoose,
//     }
//   }

//   // Reset cached connection if it's not connected
//   if (cachedConnection && mongoose.connection.readyState !== 1) {
//     console.log('Previous connection no longer active, reconnecting...')
//     cachedConnection = null
//     connectionAttempts = 0
//   }

//   isConnecting = true
//   connectionAttempts++

//   try {
//     console.log(`MongoDB connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`)

//     // If we've tried too many times, throw an error
//     if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
//       throw new Error(`Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts`)
//     }

//     // Validate MONGODB_URI
//     if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
//       throw new Error('Invalid MONGODB_URI environment variable')
//     }

//     const opts = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       bufferCommands: false,
//       connectTimeoutMS: 10000,
//       socketTimeoutMS: 45000,
//       family: 4,
//       serverSelectionTimeoutMS: 5000,
//       maxPoolSize: 10,
//       autoIndex: true, // Build indexes
//       retryWrites: true,
//       retryReads: true,
//     }

//     const conn = await mongoose.connect(MONGODB_URI, opts)
//     console.log('New MongoDB connection established')

//     // Set up event listeners
//     setupEventListeners()

//     // Reset connection attempts on success
//     connectionAttempts = 0
//     cachedConnection = {
//       db: conn.connection.db,
//       connection: conn.connection,
//       mongoose: conn,
//     }

//     // Verify the connection by attempting a simple operation
//     await conn.connection.db.admin().ping()
//     console.log('MongoDB connection verified')

//     return cachedConnection
//   } catch (error) {
//     console.error('MongoDB connection failed:', error)

//     // If we still have attempts left, try again with backoff
//     if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
//       const backoffTime = Math.min(1000 * Math.pow(2, connectionAttempts), 10000)
//       console.log(`Retrying connection in ${backoffTime / 1000} seconds...`)

//       await new Promise(resolve => setTimeout(resolve, backoffTime))
//       isConnecting = false
//       return connectToDatabase()
//     }

//     throw error
//   } finally {
//     isConnecting = false
//   }
// }

// export function isDbConnected() {
//   return mongoose.connection.readyState === 1
// }

// // Export connect as an alias for connectToDatabase to maintain backward compatibility
// export const connect = connectToDatabase

// // Helper to close all connections - useful for testing
// export async function closeDbConnection() {
//   if (mongoose.connection.readyState === 1) {
//     console.log('Closing MongoDB connection')
//     await mongoose.connection.close()
//     cachedConnection = null
//     connectionAttempts = 0
//   }
// }

// // Simple function to check database health
// export async function checkDatabaseHealth() {
//   try {
//     await connectToDatabase()
//     return { status: 'ok', message: 'Database connection is healthy' }
//   } catch (error) {
//     return { status: 'error', message: error.message }
//   }
// }

// // Export the db object
// export const db = {
//   connect: connectToDatabase,
//   isConnected: isDbConnected,
//   close: closeDbConnection,
//   checkHealth: checkDatabaseHealth,
// }

// export default db

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Global connection state
let cachedConnection = null
let isConnecting = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3
const CONNECTION_POOL_SIZE = 20

// Performance monitoring
const connectionStats = {
  totalConnections: 0,
  successfulConnections: 0,
  failedConnections: 0,
  averageConnectionTime: 0,
  lastConnectionTime: null,
}

// Optimized mongoose configuration for maximum performance
const setupMongooseConfig = () => {
  // Disable buffering for faster operations
  mongoose.set('bufferCommands', false)

  // Optimize query execution
  mongoose.set('strictQuery', true)

  // Enable query optimization
  mongoose.set('autoCreate', true)
  mongoose.set('autoIndex', false) // Disable in production for faster startup

  // Set global connection options
  mongoose.set('maxTimeMS', 30000)
}

// Enhanced event listeners with performance monitoring
const setupEventListeners = () => {
  // Remove existing listeners to prevent duplicates
  mongoose.connection.removeAllListeners()

  // Set max listeners to prevent warnings
  mongoose.connection.setMaxListeners(20)

  // Connection successful
  mongoose.connection.on('connected', () => {
    console.log('🚀 MongoDB connected successfully!')
    connectionStats.successfulConnections++
    connectionStats.lastConnectionTime = Date.now()
  })

  // Connection error
  mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err.message)
    connectionStats.failedConnections++
    cachedConnection = null
  })

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB disconnected')
    cachedConnection = null
  })

  // Connection reconnected
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected')
    connectionStats.successfulConnections++
  })

  // Connection ready
  mongoose.connection.on('open', () => {
    console.log('✅ MongoDB connection is ready for operations')
  })
}

// Super fast connection function with optimizations
export async function connectToDatabase() {
  const startTime = Date.now()

  // If we're already connecting, wait more efficiently
  if (isConnecting) {
    console.log('⏳ Connection in progress, waiting...')
    return new Promise(resolve => {
      const checkConnection = () => {
        if (!isConnecting && cachedConnection) {
          resolve(cachedConnection)
        } else if (!isConnecting && !cachedConnection) {
          resolve(connectToDatabase())
        } else {
          setTimeout(checkConnection, 100) // Check every 100ms instead of 1s
        }
      }
      checkConnection()
    })
  }

  // If we already have a healthy connection, return it immediately
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('⚡ Using existing MongoDB connection (super fast!)')
    return cachedConnection
  }

  // Reset cached connection if it's not connected
  if (cachedConnection && mongoose.connection.readyState !== 1) {
    console.log('🔄 Previous connection no longer active, reconnecting...')
    cachedConnection = null
    connectionAttempts = 0
  }

  isConnecting = true
  connectionAttempts++
  connectionStats.totalConnections++

  try {
    console.log(`🔌 MongoDB connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`)

    // Fail fast if too many attempts
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      throw new Error(`Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts`)
    }

    // Validate MONGODB_URI
    if (!MONGODB_URI || !MONGODB_URI.startsWith('mongodb')) {
      throw new Error('Invalid MONGODB_URI environment variable')
    }

    // Setup mongoose configuration
    setupMongooseConfig()

    // Optimized connection options (removed deprecated options)
    const opts = {
      // Connection pool settings for high performance
      maxPoolSize: CONNECTION_POOL_SIZE,
      minPoolSize: 5,

      // Timeout settings optimized for speed
      connectTimeoutMS: 5000, // Reduced from 10000
      socketTimeoutMS: 30000, // Reduced from 45000
      serverSelectionTimeoutMS: 3000, // Reduced from 5000
      heartbeatFrequencyMS: 10000, // How often to check server status

      // Performance optimizations
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      waitQueueTimeoutMS: 5000, // How long to wait for a connection from the pool

      // Network settings
      family: 4, // Use IPv4

      // Write/Read settings
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary', // Read from primary for consistency

      // Compression for better network performance
      compressors: ['zlib'],

      // Advanced settings
      directConnection: false,
      appName: 'NextJS-App', // Helps with monitoring
    }

    const conn = await mongoose.connect(MONGODB_URI, opts)
    console.log('🎉 New MongoDB connection established')

    // Set up event listeners
    setupEventListeners()

    // Reset connection attempts on success
    connectionAttempts = 0
    cachedConnection = {
      db: conn.connection.db,
      connection: conn.connection,
      mongoose: conn,
    }

    // Quick health check
    await conn.connection.db.admin().ping()

    const connectionTime = Date.now() - startTime
    connectionStats.averageConnectionTime =
      (connectionStats.averageConnectionTime * (connectionStats.successfulConnections - 1) +
        connectionTime) /
      connectionStats.successfulConnections

    console.log(`✅ MongoDB connection verified in ${connectionTime}ms`)
    console.log(`📊 Connection pool size: ${CONNECTION_POOL_SIZE}`)

    return cachedConnection
  } catch (error) {
    console.error('💥 MongoDB connection failed:', error.message)

    // Exponential backoff with jitter for retries
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      const baseDelay = Math.min(500 * Math.pow(2, connectionAttempts), 3000)
      const jitter = Math.random() * 200 // Add randomness to prevent thundering herd
      const backoffTime = baseDelay + jitter

      console.log(`⏰ Retrying connection in ${Math.round(backoffTime)}ms...`)

      await new Promise(resolve => setTimeout(resolve, backoffTime))
      isConnecting = false
      return connectToDatabase()
    }

    connectionStats.failedConnections++
    throw error
  } finally {
    isConnecting = false
  }
}

// Fast connection status check
export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

// Get connection state with detailed info
export function getConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  }

  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    stats: connectionStats,
  }
}

// Performance monitoring function
export function getConnectionStats() {
  return {
    ...connectionStats,
    currentConnections: mongoose.connection.readyState === 1 ? 1 : 0,
    poolSize: CONNECTION_POOL_SIZE,
    connectionState: getConnectionState(),
  }
}

// Optimized health check
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now()

    if (!isDbConnected()) {
      await connectToDatabase()
    }

    // Quick ping test
    await mongoose.connection.db.admin().ping()

    const responseTime = Date.now() - startTime

    return {
      status: 'ok',
      message: 'Database connection is healthy',
      responseTime: `${responseTime}ms`,
      connectionState: getConnectionState(),
      stats: connectionStats,
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      connectionState: getConnectionState(),
      stats: connectionStats,
    }
  }
}

// Enhanced close function with cleanup
export async function closeDbConnection() {
  if (mongoose.connection.readyState === 1) {
    console.log('🔌 Closing MongoDB connection...')
    await mongoose.connection.close()
    cachedConnection = null
    connectionAttempts = 0
    console.log('✅ MongoDB connection closed')
  }
}

// Graceful shutdown handler
export async function gracefulShutdown() {
  console.log('🛑 Initiating graceful shutdown...')

  try {
    // Close all connections
    await closeDbConnection()

    // Clean up any remaining listeners
    mongoose.connection.removeAllListeners()

    console.log('✅ Graceful shutdown completed')
    return true
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
    return false
  }
}

// Connection warmup function for even faster subsequent connections
export async function warmupConnection() {
  console.log('🔥 Warming up MongoDB connection...')

  try {
    await connectToDatabase()

    // Perform a few lightweight operations to warm up the connection
    await mongoose.connection.db.admin().ping()
    await mongoose.connection.db.listCollections().toArray()

    console.log('✅ Connection warmup completed')
    return true
  } catch (error) {
    console.error('❌ Connection warmup failed:', error)
    return false
  }
}

// Export convenience object with all functions
export const db = {
  connect: connectToDatabase,
  isConnected: isDbConnected,
  getState: getConnectionState,
  getStats: getConnectionStats,
  checkHealth: checkDatabaseHealth,
  close: closeDbConnection,
  gracefulShutdown,
  warmup: warmupConnection,
}

// Aliases for backward compatibility
export const connect = connectToDatabase

export default db

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cachedConnection = null
let isConnecting = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 5

// Set up event listeners only once
const setupEventListeners = () => {
  // Remove existing listeners to prevent duplicates
  mongoose.connection.removeAllListeners('error')
  mongoose.connection.removeAllListeners('disconnected')

  // Set max listeners to prevent warnings
  mongoose.connection.setMaxListeners(15)

  // Add new listeners
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err)
    cachedConnection = null
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
    cachedConnection = null
  })
}

export async function connectToDatabase() {
  // If we're already connecting, wait for that connection
  if (isConnecting) {
    console.log('Connection in progress, waiting...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    return connectToDatabase()
  }

  // If we already have a connection, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection')
    return cachedConnection
  }

  // Reset cached connection if it's not connected
  if (cachedConnection && mongoose.connection.readyState !== 1) {
    console.log('Previous connection no longer active, reconnecting...')
    cachedConnection = null
    connectionAttempts = 0
  }

  isConnecting = true
  connectionAttempts++

  try {
    console.log(`MongoDB connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`)

    // If we've tried too many times, throw an error
    if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      throw new Error(`Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts`)
    }

    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
      family: 4, // Use IPv4, skip trying IPv6
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      maxPoolSize: 10, // Maximum number of connections in the pool
    }

    const conn = await mongoose.connect(MONGODB_URI, opts)
    console.log('New MongoDB connection established')

    // Set up event listeners
    setupEventListeners()

    // Reset connection attempts on success
    connectionAttempts = 0
    cachedConnection = {
      db: conn.connection.db,
      connection: conn.connection,
      mongoose: conn,
    }

    return cachedConnection
  } catch (error) {
    console.error('MongoDB connection failed:', error)

    // If we still have attempts left, try again with backoff
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      const backoffTime = Math.min(1000 * Math.pow(2, connectionAttempts), 10000)
      console.log(`Retrying connection in ${backoffTime / 1000} seconds...`)

      await new Promise(resolve => setTimeout(resolve, backoffTime))
      isConnecting = false
      return connectToDatabase()
    }

    throw error
  } finally {
    isConnecting = false
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

// Export connect as an alias for connectToDatabase to maintain backward compatibility
export const connect = connectToDatabase

// Helper to close all connections - useful for testing
export async function closeDbConnection() {
  if (mongoose.connection.readyState === 1) {
    console.log('Closing MongoDB connection')
    await mongoose.connection.close()
    cachedConnection = null
    connectionAttempts = 0
  }
}

// Simple function to check database health
export async function checkDatabaseHealth() {
  try {
    await connectToDatabase()
    return { status: 'ok', message: 'Database connection is healthy' }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

// Export the db object
export const db = {
  connect: connectToDatabase,
  isConnected: isDbConnected,
  close: closeDbConnection,
  checkHealth: checkDatabaseHealth,
}

export default db

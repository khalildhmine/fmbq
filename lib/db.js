import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop'

// Cache the MongoDB connection to avoid creating new connections on every request
let cachedConnection = null

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

async function connectDb() {
  try {
    // If we have a cached connection and it's ready, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection')
      return mongoose.connection
    }

    // Log the MongoDB URI with sensitive parts masked
    const maskedUri = MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://$1:****@')
    console.log('Using MongoDB URI:', maskedUri)

    console.log('Creating new MongoDB connection...')

    // Set up the connection with reasonable timeouts
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
    })

    cachedConnection = connection
    console.log('MongoDB connection successful')

    // Handle connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err)
      cachedConnection = null
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
      cachedConnection = null
    })

    return mongoose.connection
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

async function disconnectDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
      cachedConnection = null
      console.log('MongoDB disconnected successfully')
    }
  } catch (error) {
    console.error('MongoDB disconnection error:', error)
    throw error
  }
}

// Helper function to get database instance with collection support
async function connectToDatabase() {
  const connection = await connectDb()
  return {
    db: connection.db,
    connection,
  }
}

// Helper function to check connection state and reconnect if needed
async function ensureDbConnection() {
  if (mongoose.connection.readyState !== 1) {
    return connectDb()
  }
  return mongoose.connection
}

export { connectDb, disconnectDb, connectToDatabase, ensureDbConnection }

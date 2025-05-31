import mongoose from 'mongoose'

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop'

// Global variable to cache the connection
let cachedConnection = null

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase() {
  console.log('Connecting to MongoDB at:', MONGODB_URI)

  if (cachedConnection) {
    console.log('Using existing connection')
    return cachedConnection
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    }

    const connection = await mongoose.connect(MONGODB_URI, options)
    console.log('Connected to MongoDB successfully')

    cachedConnection = connection
    return connection
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

/**
 * Check if database is connected
 */
export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

/**
 * Close database connection
 */
export async function closeDbConnection() {
  if (cachedConnection) {
    await mongoose.disconnect()
    cachedConnection = null
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth() {
  try {
    await mongoose.connection.db.admin().ping()
    return true
  } catch (error) {
    return false
  }
}

// Export the connectToDatabase function as the default export
export { connectToDatabase as connectToDB }
export default connectToDatabase

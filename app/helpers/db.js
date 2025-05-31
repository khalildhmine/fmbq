// Import mongoose for MongoDB database connection
import mongoose from 'mongoose'

// Connection configuration options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
}

// Initialize connection variable
let cachedConnection = null

// Main connection function
export async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedConnection) {
    console.log('Using existing database connection')
    return cachedConnection
  }

  // Get the MongoDB URI from environment variables, fallback to localhost if not set
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop'

  // Log the connection attempt
  console.log('Connecting to MongoDB:', uri)

  try {
    // Attempt to connect to MongoDB
    const connection = await mongoose.connect(uri, options)

    // Cache the connection for future use
    cachedConnection = connection

    console.log('Successfully connected to MongoDB')
    return connection
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

// For compatibility with both import styles
export const connect = connectToDatabase

// Default export for CommonJS compatibility
export default {
  connectToDatabase,
  connect,
}

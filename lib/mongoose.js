import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop'

let cachedConnection = null

export async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection')
    return cachedConnection
  }

  console.log('🔌 Connecting to MongoDB at:', MONGODB_URI)

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    }

    const connection = await mongoose.connect(MONGODB_URI, options)
    console.log('✅ Connected to MongoDB successfully')

    cachedConnection = connection
    return connection
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }
}

// Utility exports
export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

export async function closeDbConnection() {
  if (cachedConnection) {
    await mongoose.disconnect()
    cachedConnection = null
  }
}

export async function checkDatabaseHealth() {
  try {
    await mongoose.connection.db.admin().ping()
    return true
  } catch (error) {
    return false
  }
}

// Default and alias export
export { connectToDatabase as connectToDB }
export default connectToDatabase

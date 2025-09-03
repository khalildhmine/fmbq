import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop'

let cachedConnection = null
let connectionPromise = null // Global promise to prevent multiple connections

const MAX_RETRIES = 5
const RETRY_INTERVAL_MS = 1000 // 1 second

async function attemptConnect(retryCount = 0) {
  try {
    console.log(`🔌 MongoDB connection attempt ${retryCount + 1}/${MAX_RETRIES} to: ${MONGODB_URI}`)
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Keep this for initial connection attempts
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      bufferCommands: false, // Disable Mongoose buffering
    }
    const connection = await mongoose.connect(MONGODB_URI, options)
    console.log('🎉 New MongoDB connection established')
    cachedConnection = connection
    return connection
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}):`, error.message)
    if (retryCount < MAX_RETRIES - 1) {
      const delay = RETRY_INTERVAL_MS * Math.pow(2, retryCount) + Math.random() * 1000
      console.log(`Retrying in ${delay / 1000} seconds...`)
      await new Promise(res => setTimeout(res, delay))
      return attemptConnect(retryCount + 1)
    } else {
      console.error('❌ Max MongoDB connection retries reached. Connection failed permanently.')
      throw error
    }
  }
}

export async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    // console.log('✅ Using existing MongoDB connection')
    return cachedConnection
  }

  if (!connectionPromise) {
    connectionPromise = attemptConnect()
  }
  return connectionPromise
}

// --- Connection Events (Optional but Recommended) ---
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose default connection open to', MONGODB_URI)
  console.log('📊 Connection pool size:', mongoose.connection.getClient().options.maxPoolSize)
})

mongoose.connection.on('error', err => {
  console.error('❌ Mongoose default connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('🪫 Mongoose default connection disconnected')
  cachedConnection = null // Clear cached connection on disconnect
  connectionPromise = null // Clear promise so new connection can be attempted
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 Mongoose default connection disconnected through app termination')
  process.exit(0)
})

// Utility exports
export function isDbConnected() {
  return mongoose.connection.readyState === 1
}

export async function closeDbConnection() {
  if (cachedConnection) {
    await mongoose.disconnect()
    cachedConnection = null
    connectionPromise = null
  }
}

export async function checkDatabaseHealth() {
  try {
    if (!isDbConnected()) {
      await connectToDatabase()
    }
    await mongoose.connection.db.admin().ping()
    console.log(
      '✅ MongoDB connection verified in',
      mongoose.connection.db.options.maxIdleTimeMS,
      'ms'
    )
    return true
  } catch (error) {
    console.error('❌ MongoDB health check failed:', error.message)
    return false
  }
}

// Eagerly connect to the database when the module is loaded
// This ensures a connection attempt is made early in the application lifecycle.
connectToDatabase().catch(err => {
  console.error('Initial database connection failed at module load:', err.message)
})

// Default and alias export
export { connectToDatabase as connectToDB }
export default connectToDatabase

import { connectToDatabase } from './mongoose'

/**
 * Connect to MongoDB database
 * This file now acts as a wrapper, ensuring all parts of the application
 * use the central, robust connection logic from mongoose.js.
 * @returns {Promise<Mongoose>} Mongoose connection
 */
export async function connectDB() {
  return connectToDatabase()
}

// Export both functions for compatibility
export { connectToDatabase }
export default connectDB

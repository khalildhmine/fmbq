import mongoose from 'mongoose'

const connectToDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return

    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export default connectToDB

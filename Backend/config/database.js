import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
console.log("MongoDB URI loaded:",(process.env.MONGO_URI));
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log(`MongoDB connected successfully`)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB

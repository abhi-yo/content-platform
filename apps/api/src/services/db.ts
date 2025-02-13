import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(uri)

export async function connectDB() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    return client.db(process.env.DB_NAME || 'content-platform')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export const db = await connectDB()
import { MongoClient, Db } from 'mongodb'

let db: Db

export async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI || '')
    await client.connect()
    db = client.db(process.env.DB_NAME)
    console.log('Connected to MongoDB')
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}
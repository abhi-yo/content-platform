import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { errorHandler } from './middleware/error'
import contentRouter from './routes/content.routes'
import { connectDB } from './services/db.service'

const app = new Hono()

// Connect to database
connectDB()

// Global middleware
app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())
app.use('*', errorHandler)

// Health check
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }))

// Mount routes
app.route('/api/content', contentRouter)

// Error handling for unmatched routes
app.notFound((c) => c.json({ error: 'Not found' }, 404))

export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch
}
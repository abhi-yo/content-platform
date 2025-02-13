import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())
app.use('/api/*', jwt({
  secret: process.env.JWT_SECRET as string
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok' }))

// Routes
app.get('/api/content', async (c) => {
  return c.json({ message: 'Content API' })
})

export default {
  port: 3001,
  fetch: app.fetch
}
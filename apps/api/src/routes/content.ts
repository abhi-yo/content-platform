import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { ContentSchema } from '../models/content'
import { db } from '../services/db'
import { ObjectId } from 'mongodb'  

export const contentRouter = new Hono()

// Get all content
contentRouter.get('/', async (c) => {
  const content = await db.collection('content').find().toArray()
  return c.json(content)
})

// Get content by ID
contentRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const content = await db.collection('content').findOne({ 
      _id: new ObjectId(id)  // Convert string to ObjectId
    })
    if (!content) return c.json({ error: 'Content not found' }, 404)
    return c.json(content)
  } catch (error) {
    return c.json({ error: 'Invalid ID format' }, 400)
  }
})

// Create content
contentRouter.post('/', zValidator('json', ContentSchema), async (c) => {
  const data = await c.req.json()
  const result = await db.collection('content').insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return c.json({ id: result.insertedId.toString() }, 201)
})

// Update content
contentRouter.put('/:id', zValidator('json', ContentSchema), async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  try {
    const result = await db.collection('content').updateOne(
      { _id: new ObjectId(id) },  // Convert string to ObjectId
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    )
    if (!result.matchedCount) return c.json({ error: 'Content not found' }, 404)
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid ID format' }, 400)
  }
})

// Delete content
contentRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await db.collection('content').deleteOne({ 
      _id: new ObjectId(id)  // Convert string to ObjectId
    })
    if (!result.deletedCount) return c.json({ error: 'Content not found' }, 404)
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid ID format' }, 400)
  }
})
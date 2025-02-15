import { Context } from 'hono'
import { ContentService } from '../services/content.service'
import { MLService } from '../services/ml.service'
import { ContentSchema } from '../models/schemas'

export class ContentController {
  private contentService = new ContentService()
  private mlService = new MLService()

  async create(c: Context) {
    try {
      const data = ContentSchema.parse(await c.req.json())
      const user = c.get('jwtPayload')

      // Generate image if requested
      let imageUrl
      if (data.generateImage && data.imagePrompt) {
        const imageResult = await this.mlService.generateImage(data.imagePrompt)
        imageUrl = imageResult.imageUrl
      }

      // Analyze content
      const analysis = await this.mlService.analyzeContent(data.content)

      const id = await this.contentService.create({
        ...data,
        authorId: user.id,
        imageUrl,
        analysis
      })

      return c.json({ id, imageUrl, analysis }, 201)
    } catch (error) {
      console.error('Content creation failed:', error)
      return c.json({ error: 'Content creation failed' }, 400)
    }
  }

  async getById(c: Context) {
    try {
      const content = await this.contentService.findById(c.req.param('id'))
      if (!content) return c.json({ error: 'Content not found' }, 404)
      return c.json(content)
    } catch (error) {
      return c.json({ error: 'Failed to fetch content' }, 500)
    }
  }

  async list(c: Context) {
    const page = Number(c.req.query('page')) || 1
    const limit = Number(c.req.query('limit')) || 10
    try {
      const result = await this.contentService.find({}, page, limit)
      return c.json(result)
    } catch (error) {
      return c.json({ error: 'Failed to fetch content list' }, 500)
    }
  }

  async update(c: Context) {
    try {
      const id = c.req.param('id')
      const data = ContentSchema.partial().parse(await c.req.json())
      const user = c.get('jwtPayload')

      // Verify ownership
      const content = await this.contentService.findById(id)
      if (!content) return c.json({ error: 'Content not found' }, 404)
      if (content.authorId.toString() !== user.id) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const success = await this.contentService.update(id, data)
      return c.json({ success })
    } catch (error) {
      return c.json({ error: 'Failed to update content' }, 500)
    }
  }

  async delete(c: Context) {
    try {
      const id = c.req.param('id')
      const user = c.get('jwtPayload')

      // Verify ownership
      const content = await this.contentService.findById(id)
      if (!content) return c.json({ error: 'Content not found' }, 404)
      if (content.authorId.toString() !== user.id) {
        return c.json({ error: 'Unauthorized' }, 403)
      }

      const success = await this.contentService.delete(id)
      return c.json({ success })
    } catch (error) {
      return c.json({ error: 'Failed to delete content' }, 500)
    }
  }
}
import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const ContentSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),  // MongoDB ID
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export type Content = z.infer<typeof ContentSchema>
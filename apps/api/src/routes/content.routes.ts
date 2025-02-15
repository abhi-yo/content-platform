import { Hono } from 'hono'
import { ContentController } from '../controllers/content.controller'
import { authMiddleware, roleMiddleware } from '../middleware/auth'

const contentRouter = new Hono()
const contentController = new ContentController()

// Apply auth middleware to all routes
contentRouter.use('*', authMiddleware)

// Routes with role-based access
contentRouter.post('/', roleMiddleware(['writer']), (c) => contentController.create(c))
contentRouter.get('/:id', (c) => contentController.getById(c))
contentRouter.get('/', (c) => contentController.list(c))
contentRouter.put('/:id', roleMiddleware(['writer']), (c) => contentController.update(c))
contentRouter.delete('/:id', roleMiddleware(['writer']), (c) => contentController.delete(c))

export default contentRouter
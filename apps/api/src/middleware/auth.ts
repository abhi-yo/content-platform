import { jwt } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'

export const authMiddleware: MiddlewareHandler = jwt({
  secret: process.env.JWT_SECRET as string,
  cookie: 'auth-token'
})
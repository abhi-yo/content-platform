import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler = (): MiddlewareHandler => async (c, next) => {
  try {
    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({
        error: error.message
      }, error.status)
    }
    
    console.error(error)
    return c.json({
      error: 'Internal Server Error'
    }, 500)
  }
}
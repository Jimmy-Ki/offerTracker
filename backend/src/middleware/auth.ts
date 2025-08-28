import { Context } from 'hono'
import { verifyToken } from '../utils/auth'
import { Bindings } from '../index'

type Variables = {
  user: any
}

export async function authMiddleware(c: Context<{ Bindings: Bindings, Variables: Variables }>, next: () => Promise<void>) {
  // 跳过认证的路由
  const publicRoutes = ['/api/register', '/api/login', '/health']
  if (publicRoutes.some(route => c.req.path.startsWith(route))) {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header required' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const decoded = verifyToken(token, c.env.JWT_SECRET)
    c.set('user', decoded)
    return next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
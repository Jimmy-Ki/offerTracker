import { Hono } from 'hono'
import { hashPassword, verifyPassword, generateToken } from '../utils/auth'
import { RegisterRequest, LoginRequest, AuthResponse, User, JwtPayload } from '../types'
import { Bindings } from '../index'

type Variables = {
  user: JwtPayload
}

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 用户注册
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterRequest>()
    
    // 验证密码确认
    if (body.password !== body.confirmPassword) {
      return c.json({ error: 'Passwords do not match' }, 400)
    }

    // 检查邮箱是否已存在
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(body.email).first()

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    // 创建用户
    const userId = crypto.randomUUID()
    const passwordHash = await hashPassword(body.password)
    const createdAt = Math.floor(Date.now() / 1000)

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, plan_type, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, body.email, passwordHash, 'free', createdAt).run()

    // 生成token
    const userForToken: User = {
      id: userId,
      email: body.email,
      password_hash: passwordHash,
      plan_type: 'free',
      created_at: createdAt
    }
    const token = generateToken(userForToken, c.env.JWT_SECRET)

    const response: AuthResponse = {
      token,
      user: {
        id: userId,
        email: body.email,
        plan_type: 'free',
        created_at: createdAt
      }
    }

    return c.json(response, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 用户登录
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>()

    // 查找用户
    const userResult = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(body.email).first<{
      id: string;
      email: string;
      password_hash: string;
      plan_type: string;
      created_at: number;
    }>()

    if (!userResult) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // 验证密码
    const isValidPassword = await verifyPassword(body.password, userResult.password_hash)
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // 生成token
    const user: User = {
      id: userResult.id,
      email: userResult.email,
      password_hash: userResult.password_hash,
      plan_type: userResult.plan_type as 'free' | 'pro' | 'team',
      created_at: userResult.created_at
    }
    const token = generateToken(user, c.env.JWT_SECRET)

    const response: AuthResponse = {
      token,
      user: {
        id: userResult.id,
        email: userResult.email,
        plan_type: userResult.plan_type as 'free' | 'pro' | 'team',
        created_at: userResult.created_at
      }
    }

    return c.json(response)
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取当前用户信息
authRoutes.get('/me', async (c) => {
  const user = c.get('user')
  
  const userData = await c.env.DB.prepare(
    'SELECT id, email, plan_type, created_at FROM users WHERE id = ?'
  ).bind(user.id).first<{
    id: string;
    email: string;
    plan_type: string;
    created_at: number;
  }>()

  if (!userData) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(userData)
})
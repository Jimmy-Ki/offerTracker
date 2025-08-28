import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { resumeRoutes } from './routes/resumes'
import { applicationRoutes } from './routes/applications'
import { dashboardRoutes } from './routes/dashboard'
import { enumRoutes } from './routes/enums'
import { authMiddleware } from './middleware/auth'

export type Bindings = {
  DB: D1Database
  RESUMES_BUCKET: R2Bucket
  ENUMS_KV: KVNamespace
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 全局中间件
app.use('*', cors())
app.use('/api/*', authMiddleware)

// 路由注册
app.route('/api', authRoutes)
app.route('/api', resumeRoutes)
app.route('/api', applicationRoutes)
app.route('/api', dashboardRoutes)
app.route('/api', enumRoutes)

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

export default app
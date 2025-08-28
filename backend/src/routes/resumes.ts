import { Hono } from 'hono'
import { Bindings } from '../index'
import { Resume } from '../types'

type Variables = {
  user: any
}

export const resumeRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 获取简历列表
resumeRoutes.get('/resumes', async (c) => {
  const user = c.get('user')
  
  try {
    const resumes = await c.env.DB.prepare(
      'SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(user.id).all<Resume>()

    return c.json(resumes.results)
  } catch (error) {
    console.error('Get resumes error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 上传简历（生成预签名URL）
resumeRoutes.post('/resumes', async (c) => {
  const user = c.get('user')
  
  try {
    const body = await c.req.json<{ resume_name: string }>()
    const resumeId = crypto.randomUUID()
    const timestamp = Math.floor(Date.now() / 1000)
    
    // 生成唯一的文件名
    const fileName = `resumes/${user.id}/${resumeId}.pdf`
    
    // 保存简历记录到数据库（文件内容将通过单独的PUT请求上传）
    await c.env.DB.prepare(
      'INSERT INTO resumes (id, user_id, resume_name, file_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      resumeId,
      user.id,
      body.resume_name,
      fileName,
      timestamp,
      timestamp
    ).run()

    // 返回简历ID，前端需要通过PUT /api/resumes/:id/file 上传文件内容
    return c.json({
      id: resumeId,
      file_name: fileName,
      message: '请使用PUT /api/resumes/:id/file上传文件内容'
    }, 201)
  } catch (error) {
    console.error('Create resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 更新简历信息
resumeRoutes.patch('/resumes/:id', async (c) => {
  const user = c.get('user')
  const resumeId = c.req.param('id')
  
  try {
    const body = await c.req.json<{ resume_name: string }>()
    const timestamp = Math.floor(Date.now() / 1000)
    
    // 检查简历是否存在且属于当前用户
    const existingResume = await c.env.DB.prepare(
      'SELECT id FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(resumeId, user.id).first()

    if (!existingResume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // 更新简历信息
    await c.env.DB.prepare(
      'UPDATE resumes SET resume_name = ?, updated_at = ? WHERE id = ?'
    ).bind(body.resume_name, timestamp, resumeId).run()

    return c.json({ message: 'Resume updated successfully' })
  } catch (error) {
    console.error('Update resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 删除简历
resumeRoutes.delete('/resumes/:id', async (c) => {
  const user = c.get('user')
  const resumeId = c.req.param('id')
  
  try {
    // 获取简历文件信息
    const resume = await c.env.DB.prepare(
      'SELECT file_url FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(resumeId, user.id).first<{ file_url: string }>()

    if (!resume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // 删除R2中的文件
    await c.env.RESUMES_BUCKET.delete(resume.file_url)

    // 删除数据库记录
    await c.env.DB.prepare(
      'DELETE FROM resumes WHERE id = ?'
    ).bind(resumeId).run()

    return c.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Delete resume error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 上传简历文件内容
resumeRoutes.put('/resumes/:id/file', async (c) => {
  const user = c.get('user')
  const resumeId = c.req.param('id')
  
  try {
    // 检查简历是否存在且属于当前用户
    const resume = await c.env.DB.prepare(
      'SELECT file_url FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(resumeId, user.id).first<{ file_url: string }>()

    if (!resume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // 获取上传的文件内容
    const fileData = await c.req.arrayBuffer()
    
    // 上传文件到R2
    await c.env.RESUMES_BUCKET.put(resume.file_url, fileData, {
      httpMetadata: {
        contentType: c.req.header('Content-Type') || 'application/octet-stream'
      }
    })

    // 更新更新时间
    const timestamp = Math.floor(Date.now() / 1000)
    await c.env.DB.prepare(
      'UPDATE resumes SET updated_at = ? WHERE id = ?'
    ).bind(timestamp, resumeId).run()

    return c.json({ message: 'File uploaded successfully' })
  } catch (error) {
    console.error('File upload error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取简历下载URL
resumeRoutes.get('/resumes/:id/download', async (c) => {
  const user = c.get('user')
  const resumeId = c.req.param('id')
  
  try {
    const resume = await c.env.DB.prepare(
      'SELECT file_url FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(resumeId, user.id).first<{ file_url: string }>()

    if (!resume) {
      return c.json({ error: 'Resume not found' }, 404)
    }

    // 返回文件路径，前端可以通过Cloudflare Workers路由或CDN访问
    // 在实际部署时需要配置相应的路由规则
    return c.json({ file_path: resume.file_url })
  } catch (error) {
    console.error('Get download URL error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
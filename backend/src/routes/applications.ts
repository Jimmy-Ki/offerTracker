import { Hono } from 'hono'
import { Bindings } from '../index'
import { Application } from '../types'

type Variables = {
  user: any
}

export const applicationRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 获取所有求职记录
applicationRoutes.get('/applications', async (c) => {
  const user = c.get('user')
  
  try {
    const applications = await c.env.DB.prepare(
      `SELECT a.*, r.resume_name 
       FROM applications a 
       LEFT JOIN resumes r ON a.resume_id = r.id 
       WHERE a.user_id = ? 
       ORDER BY a.application_date DESC`
    ).bind(user.id).all<Application & { resume_name?: string }>()

    return c.json(applications.results)
  } catch (error) {
    console.error('Get applications error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取单条求职记录
applicationRoutes.get('/applications/:id', async (c) => {
  const user = c.get('user')
  const applicationId = c.req.param('id')
  
  try {
    const application = await c.env.DB.prepare(
      `SELECT a.*, r.resume_name 
       FROM applications a 
       LEFT JOIN resumes r ON a.resume_id = r.id 
       WHERE a.id = ? AND a.user_id = ?`
    ).bind(applicationId, user.id).first<Application & { resume_name?: string }>()

    if (!application) {
      return c.json({ error: 'Application not found' }, 404)
    }

    return c.json(application)
  } catch (error) {
    console.error('Get application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 创建求职记录
applicationRoutes.post('/applications', async (c) => {
  const user = c.get('user')
  
  try {
    const body = await c.req.json<Partial<Application>>()
    const applicationId = crypto.randomUUID()
    const timestamp = Math.floor(Date.now() / 1000)
    
    // 验证简历ID是否属于当前用户
    if (body.resume_id) {
      const resume = await c.env.DB.prepare(
        'SELECT id FROM resumes WHERE id = ? AND user_id = ?'
      ).bind(body.resume_id, user.id).first()
      
      if (!resume) {
        return c.json({ error: 'Resume not found' }, 404)
      }
    }

    await c.env.DB.prepare(
      `INSERT INTO applications (
        id, user_id, resume_id, company_name, position_title, status, 
        city, salary_range, channel, contact_name, contact_email,
        application_date, last_update, interview_date, offer_status,
        rejection_reason, notes, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      applicationId,
      user.id,
      body.resume_id || null,
      body.company_name,
      body.position_title,
      body.status || 'applied',
      body.city || null,
      body.salary_range || null,
      body.channel || null,
      body.contact_name || null,
      body.contact_email || null,
      body.application_date || timestamp,
      timestamp,
      body.interview_date || null,
      body.offer_status || null,
      body.rejection_reason || null,
      body.notes || null,
      body.custom_fields || null
    ).run()

    // 返回创建的记录
    const newApplication = await c.env.DB.prepare(
      'SELECT * FROM applications WHERE id = ?'
    ).bind(applicationId).first<Application>()

    return c.json(newApplication, 201)
  } catch (error) {
    console.error('Create application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 更新求职记录
applicationRoutes.patch('/applications/:id', async (c) => {
  const user = c.get('user')
  const applicationId = c.req.param('id')
  
  try {
    const body = await c.req.json<Partial<Application>>()
    const timestamp = Math.floor(Date.now() / 1000)
    
    // 检查记录是否存在且属于当前用户
    const existingApplication = await c.env.DB.prepare(
      'SELECT id FROM applications WHERE id = ? AND user_id = ?'
    ).bind(applicationId, user.id).first()

    if (!existingApplication) {
      return c.json({ error: 'Application not found' }, 404)
    }

    // 验证简历ID是否属于当前用户
    if (body.resume_id) {
      const resume = await c.env.DB.prepare(
        'SELECT id FROM resumes WHERE id = ? AND user_id = ?'
      ).bind(body.resume_id, user.id).first()
      
      if (!resume) {
        return c.json({ error: 'Resume not found' }, 404)
      }
    }

    // 构建更新语句
    const updates: string[] = []
    const values: any[] = []
    
    if (body.resume_id !== undefined) {
      updates.push('resume_id = ?')
      values.push(body.resume_id)
    }
    if (body.company_name !== undefined) {
      updates.push('company_name = ?')
      values.push(body.company_name)
    }
    if (body.position_title !== undefined) {
      updates.push('position_title = ?')
      values.push(body.position_title)
    }
    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }
    if (body.city !== undefined) {
      updates.push('city = ?')
      values.push(body.city)
    }
    if (body.salary_range !== undefined) {
      updates.push('salary_range = ?')
      values.push(body.salary_range)
    }
    if (body.channel !== undefined) {
      updates.push('channel = ?')
      values.push(body.channel)
    }
    if (body.contact_name !== undefined) {
      updates.push('contact_name = ?')
      values.push(body.contact_name)
    }
    if (body.contact_email !== undefined) {
      updates.push('contact_email = ?')
      values.push(body.contact_email)
    }
    if (body.application_date !== undefined) {
      updates.push('application_date = ?')
      values.push(body.application_date)
    }
    if (body.interview_date !== undefined) {
      updates.push('interview_date = ?')
      values.push(body.interview_date)
    }
    if (body.offer_status !== undefined) {
      updates.push('offer_status = ?')
      values.push(body.offer_status)
    }
    if (body.rejection_reason !== undefined) {
      updates.push('rejection_reason = ?')
      values.push(body.rejection_reason)
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?')
      values.push(body.notes)
    }
    if (body.custom_fields !== undefined) {
      updates.push('custom_fields = ?')
      values.push(body.custom_fields)
    }

    updates.push('last_update = ?')
    values.push(timestamp)
    
    values.push(applicationId)

    await c.env.DB.prepare(
      `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    // 返回更新后的记录
    const updatedApplication = await c.env.DB.prepare(
      'SELECT * FROM applications WHERE id = ?'
    ).bind(applicationId).first<Application>()

    return c.json(updatedApplication)
  } catch (error) {
    console.error('Update application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 删除求职记录
applicationRoutes.delete('/applications/:id', async (c) => {
  const user = c.get('user')
  const applicationId = c.req.param('id')
  
  try {
    // 检查记录是否存在且属于当前用户
    const existingApplication = await c.env.DB.prepare(
      'SELECT id FROM applications WHERE id = ? AND user_id = ?'
    ).bind(applicationId, user.id).first()

    if (!existingApplication) {
      return c.json({ error: 'Application not found' }, 404)
    }

    await c.env.DB.prepare(
      'DELETE FROM applications WHERE id = ?'
    ).bind(applicationId).run()

    return c.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Delete application error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
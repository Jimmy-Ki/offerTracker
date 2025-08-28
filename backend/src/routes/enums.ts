import { Hono } from 'hono'
import { Bindings } from '../index'
import { EnumItem } from '../types'

type Variables = {
  user: any
}

export const enumRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 获取枚举值
enumRoutes.get('/enums/:type', async (c) => {
  const type = c.req.param('type')
  
  try {
    // 先从KV缓存中获取
    const cached = await c.env.ENUMS_KV.get(`enums:${type}`)
    if (cached) {
      return c.json(JSON.parse(cached))
    }

    // 如果缓存中没有，从数据库获取
    const enums = await c.env.DB.prepare(
      'SELECT type, value, label FROM enums WHERE type = ? ORDER BY value'
    ).bind(type).all<EnumItem>()

    // 缓存到KV（1小时）
    if (enums.results.length > 0) {
      await c.env.ENUMS_KV.put(
        `enums:${type}`,
        JSON.stringify(enums.results),
        { expirationTtl: 3600 }
      )
    }

    return c.json(enums.results)
  } catch (error) {
    console.error('Get enums error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取所有枚举类型
enumRoutes.get('/enums', async (c) => {
  try {
    const enumTypes = await c.env.DB.prepare(
      'SELECT DISTINCT type FROM enums ORDER BY type'
    ).all<{ type: string }>()

    const types = enumTypes.results.map(item => item.type)
    return c.json(types)
  } catch (error) {
    console.error('Get enum types error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 添加枚举值（管理员功能）
enumRoutes.post('/enums/:type', async (c) => {
  const user = c.get('user')
  const type = c.req.param('type')
  
  try {
    // 检查用户权限（这里简单实现，实际应该检查用户角色）
    if (user.plan_type !== 'pro' && user.plan_type !== 'team') {
      return c.json({ error: 'Permission denied' }, 403)
    }

    const body = await c.req.json<{ value: string; label: string }>()

    // 检查是否已存在
    const existing = await c.env.DB.prepare(
      'SELECT id FROM enums WHERE type = ? AND value = ?'
    ).bind(type, body.value).first()

    if (existing) {
      return c.json({ error: 'Enum value already exists' }, 400)
    }

    // 插入新枚举值
    await c.env.DB.prepare(
      'INSERT INTO enums (type, value, label) VALUES (?, ?, ?)'
    ).bind(type, body.value, body.label).run()

    // 清除缓存
    await c.env.ENUMS_KV.delete(`enums:${type}`)

    return c.json({ message: 'Enum value added successfully' }, 201)
  } catch (error) {
    console.error('Add enum error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 更新枚举值
enumRoutes.patch('/enums/:type/:value', async (c) => {
  const user = c.get('user')
  const type = c.req.param('type')
  const value = c.req.param('value')
  
  try {
    // 检查用户权限
    if (user.plan_type !== 'pro' && user.plan_type !== 'team') {
      return c.json({ error: 'Permission denied' }, 403)
    }

    const body = await c.req.json<{ label: string }>()

    // 更新枚举值
    const result = await c.env.DB.prepare(
      'UPDATE enums SET label = ? WHERE type = ? AND value = ?'
    ).bind(body.label, type, value).run()

    if (result.meta.rows_read === 0) {
      return c.json({ error: 'Enum value not found' }, 404)
    }

    // 清除缓存
    await c.env.ENUMS_KV.delete(`enums:${type}`)

    return c.json({ message: 'Enum value updated successfully' })
  } catch (error) {
    console.error('Update enum error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 删除枚举值
enumRoutes.delete('/enums/:type/:value', async (c) => {
  const user = c.get('user')
  const type = c.req.param('type')
  const value = c.req.param('value')
  
  try {
    // 检查用户权限
    if (user.plan_type !== 'pro' && user.plan_type !== 'team') {
      return c.json({ error: 'Permission denied' }, 403)
    }

    // 删除枚举值
    const result = await c.env.DB.prepare(
      'DELETE FROM enums WHERE type = ? AND value = ?'
    ).bind(type, value).run()

    if (result.meta.rows_read === 0) {
      return c.json({ error: 'Enum value not found' }, 404)
    }

    // 清除缓存
    await c.env.ENUMS_KV.delete(`enums:${type}`)

    return c.json({ message: 'Enum value deleted successfully' })
  } catch (error) {
    console.error('Delete enum error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 批量获取多个枚举类型
enumRoutes.post('/enums/batch', async (c) => {
  try {
    const body = await c.req.json<{ types: string[] }>()
    const result: Record<string, EnumItem[]> = {}

    for (const type of body.types) {
      // 先从KV缓存中获取
      const cached = await c.env.ENUMS_KV.get(`enums:${type}`)
      if (cached) {
        result[type] = JSON.parse(cached)
        continue
      }

      // 从数据库获取
      const enums = await c.env.DB.prepare(
        'SELECT type, value, label FROM enums WHERE type = ? ORDER BY value'
      ).bind(type).all<EnumItem>()

      result[type] = enums.results

      // 缓存到KV
      if (enums.results.length > 0) {
        await c.env.ENUMS_KV.put(
          `enums:${type}`,
          JSON.stringify(enums.results),
          { expirationTtl: 3600 }
        )
      }
    }

    return c.json(result)
  } catch (error) {
    console.error('Batch get enums error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
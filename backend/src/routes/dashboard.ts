import { Hono } from 'hono'
import { Bindings } from '../index'
import { DashboardSummary } from '../types'

type Variables = {
  user: any
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// 获取Dashboard汇总数据
dashboardRoutes.get('/dashboard/summary', async (c) => {
  const user = c.get('user')
  
  try {
    // 获取状态分布
    const statusDistribution = await c.env.DB.prepare(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       WHERE user_id = ? 
       GROUP BY status`
    ).bind(user.id).all<{ status: string; count: number }>()

    // 获取城市分布
    const cityDistribution = await c.env.DB.prepare(
      `SELECT city, COUNT(*) as count 
       FROM applications 
       WHERE user_id = ? AND city IS NOT NULL 
       GROUP BY city`
    ).bind(user.id).all<{ city: string; count: number }>()

    // 获取渠道分布
    const channelDistribution = await c.env.DB.prepare(
      `SELECT channel, COUNT(*) as count 
       FROM applications 
       WHERE user_id = ? AND channel IS NOT NULL 
       GROUP BY channel`
    ).bind(user.id).all<{ channel: string; count: number }>()

    // 获取总申请数
    const totalApplications = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = ?'
    ).bind(user.id).first<{ count: number }>()

    // 获取成功率（收到Offer的比例）
    const successRate = await c.env.DB.prepare(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN offer_status = 'accepted' THEN 1 ELSE 0 END) as success
       FROM applications 
       WHERE user_id = ? AND offer_status IS NOT NULL`
    ).bind(user.id).first<{ total: number; success: number }>()

    // 获取平均响应时间（从投递到第一次状态更新的时间）
    const avgResponseTime = await c.env.DB.prepare(
      `SELECT AVG(last_update - application_date) as avg_days 
       FROM applications 
       WHERE user_id = ? AND last_update > application_date`
    ).bind(user.id).first<{ avg_days: number }>()

    // 转换分布数据为对象格式
    const statusDistObj: Record<string, number> = {}
    statusDistribution.results.forEach(item => {
      statusDistObj[item.status] = item.count
    })

    const cityDistObj: Record<string, number> = {}
    cityDistribution.results.forEach(item => {
      cityDistObj[item.city] = item.count
    })

    const channelDistObj: Record<string, number> = {}
    channelDistribution.results.forEach(item => {
      channelDistObj[item.channel] = item.count
    })

    const summary: DashboardSummary = {
      status_distribution: statusDistObj,
      city_distribution: cityDistObj,
      channel_distribution: channelDistObj,
      total_applications: totalApplications?.count || 0,
      success_rate: successRate?.total ? (successRate.success / successRate.total) * 100 : 0,
      average_response_time: avgResponseTime?.avg_days || 0
    }

    return c.json(summary)
  } catch (error) {
    console.error('Get dashboard summary error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取时间线数据
dashboardRoutes.get('/dashboard/timeline', async (c) => {
  const user = c.get('user')
  
  try {
    const timelineData = await c.env.DB.prepare(
      `SELECT 
         id,
         company_name,
         position_title,
         status,
         application_date,
         last_update,
         interview_date,
         offer_status
       FROM applications 
       WHERE user_id = ? 
       ORDER BY application_date DESC 
       LIMIT 50`
    ).bind(user.id).all()

    return c.json(timelineData.results)
  } catch (error) {
    console.error('Get timeline error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// 获取洞察数据（高级分析）
dashboardRoutes.get('/dashboard/insights', async (c) => {
  const user = c.get('user')
  
  try {
    // 月度申请趋势
    const monthlyTrend = await c.env.DB.prepare(
      `SELECT 
         strftime('%Y-%m', datetime(application_date, 'unixepoch')) as month,
         COUNT(*) as count
       FROM applications 
       WHERE user_id = ? 
       GROUP BY month 
       ORDER BY month`
    ).bind(user.id).all<{ month: string; count: number }>()

    // 各状态的平均处理时间
    const statusProcessingTime = await c.env.DB.prepare(
      `SELECT 
         status,
         AVG(last_update - application_date) as avg_days
       FROM applications 
       WHERE user_id = ? AND last_update > application_date
       GROUP BY status`
    ).bind(user.id).all<{ status: string; avg_days: number }>()

    // 各渠道的成功率
    const channelSuccessRate = await c.env.DB.prepare(
      `SELECT 
         channel,
         COUNT(*) as total,
         SUM(CASE WHEN offer_status = 'accepted' THEN 1 ELSE 0 END) as success
       FROM applications 
       WHERE user_id = ? AND channel IS NOT NULL AND offer_status IS NOT NULL
       GROUP BY channel`
    ).bind(user.id).all<{ channel: string; total: number; success: number }>()

    const insights = {
      monthly_trend: monthlyTrend.results,
      status_processing_time: statusProcessingTime.results,
      channel_success_rate: channelSuccessRate.results.map(item => ({
        channel: item.channel,
        success_rate: item.total ? (item.success / item.total) * 100 : 0
      }))
    }

    return c.json(insights)
  } catch (error) {
    console.error('Get insights error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
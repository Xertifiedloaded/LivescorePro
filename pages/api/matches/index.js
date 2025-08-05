import { pool } from '../../../lib/database'
import { errorHandler } from '../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      league,
      status = 'SCHEDULED',
      limit = 50,
      offset = 0,
      dateFrom,
      dateTo,
      stage,
      matchday,
    } = req.query

    let query = `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (status) {
      paramCount++
      query += ` AND m.status = $${paramCount}`
      params.push(status)
    }

    if (league) {
      paramCount++
      query += ` AND (l.name ILIKE $${paramCount} OR l.code ILIKE $${paramCount})`
      params.push(`%${league}%`)
    }

    if (dateFrom) {
      paramCount++
      query += ` AND m.match_date >= $${paramCount}`
      params.push(dateFrom)
    }

    if (dateTo) {
      paramCount++
      query += ` AND m.match_date <= $${paramCount}`
      params.push(dateTo)
    }

    if (stage) {
      paramCount++
      query += ` AND m.stage = $${paramCount}`
      params.push(stage)
    }

    if (matchday) {
      paramCount++
      query += ` AND m.matchday = $${paramCount}`
      params.push(Number.parseInt(matchday))
    }

    if (!dateFrom && !dateTo && status === 'SCHEDULED') {
      paramCount++
      query += ` AND m.match_date > $${paramCount}`
      params.push(new Date())
    }

    query += ` ORDER BY m.match_date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await pool.query(query, params)

    res.status(200).json({
      matches: result.rows,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        total: result.rows.length,
      },
      filters: {
        league,
        status,
        dateFrom,
        dateTo,
        stage,
        matchday,
      },
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

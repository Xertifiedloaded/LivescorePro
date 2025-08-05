import { pool } from '../../../lib/database'
import { authenticateToken, errorHandler } from '../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await authenticateToken(req)
    const { status, limit = 20, offset = 0 } = req.query
    const userId = user.id

    let query = `
      SELECT p.*, m.home_team, m.away_team, m.match_date, m.status as match_status,
             l.name as league_name, l.country
      FROM predictions p
      JOIN matches m ON p.match_id = m.id
      LEFT JOIN leagues l ON m.league_id = l.id
      WHERE p.user_id = $1
    `

    const params = [userId]

    if (status) {
      query += ` AND p.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await pool.query(query, params)

    res.status(200).json({
      predictions: result.rows,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      },
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

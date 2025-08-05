import { pool } from '../../../lib/database'
import { errorHandler } from '../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await pool.query(`
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.status IN ('IN_PLAY', 'PAUSED', 'LIVE') 
      ORDER BY m.match_date DESC
    `)

    res.status(200).json({
      matches: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

import { pool } from '../../../../lib/database'
import { errorHandler } from '../../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN status = 'SCHEDULED' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN status IN ('IN_PLAY', 'PAUSED', 'LIVE') THEN 1 END) as live_matches,
        COUNT(CASE WHEN status = 'FINISHED' THEN 1 END) as finished_matches,
        COUNT(DISTINCT league_id) as total_leagues
      FROM matches
    `)

    const recentMatches = await pool.query(`
      SELECT COUNT(*) as recent_matches
      FROM matches 
      WHERE match_date >= NOW() - INTERVAL '24 hours'
    `)

    res.status(200).json({
      ...stats.rows[0],
      recent_matches: recentMatches.rows[0].recent_matches,
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

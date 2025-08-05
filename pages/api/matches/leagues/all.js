import { pool } from "../../../../lib/database"
import { errorHandler } from "../../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const result = await pool.query(`
      SELECT l.*, COUNT(m.id) as match_count,
             COUNT(CASE WHEN m.status = 'SCHEDULED' THEN 1 END) as upcoming_matches,
             COUNT(CASE WHEN m.status IN ('IN_PLAY', 'PAUSED') THEN 1 END) as live_matches
      FROM leagues l 
      LEFT JOIN matches m ON l.id = m.league_id 
      WHERE l.is_active = true 
      GROUP BY l.id 
      ORDER BY l.country, l.name
    `)

    res.status(200).json({
      leagues: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

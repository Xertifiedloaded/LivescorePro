import { pool } from "../../../../lib/database"
import { errorHandler } from "../../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.match_date >= $1 AND m.match_date <= $2
      AND m.status = 'SCHEDULED'
      ORDER BY m.match_date ASC
    `,
      [today, weekFromNow],
    )

    res.status(200).json({
      matches: result.rows,
      period: "next_7_days",
      count: result.rows.length,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

import { pool } from '../../../lib/database'
import { errorHandler } from '../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.id = $1
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' })
    }

    const match = result.rows[0]

    const predictionCount = await pool.query(
      'SELECT COUNT(*) as count FROM predictions WHERE match_id = $1',
      [id]
    )

    match.prediction_count = Number.parseInt(predictionCount.rows[0].count)

    res.status(200).json({ match })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

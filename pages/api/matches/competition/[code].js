import { pool } from '../../../../lib/database'
import { errorHandler } from '../../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.query
    const { limit = 20, offset = 0, status = 'SCHEDULED' } = req.query

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE l.code = $1 AND m.status = $2
      ORDER BY m.match_date ASC 
      LIMIT $3 OFFSET $4
    `,
      [code.toUpperCase(), status, Number.parseInt(limit), Number.parseInt(offset)]
    )

    res.status(200).json({
      matches: result.rows,
      competition: code.toUpperCase(),
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      },
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

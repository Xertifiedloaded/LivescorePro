import { pool } from "../../../lib/database.js"
import { errorHandler } from "../../../lib/middleware.js"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const popularLeagueCodes = ["PL", "PD", "BL1", "SA", "FL1", "CL"]

    const groupedMatches = {}
    let totalMatches = 0

    for (const code of popularLeagueCodes) {
      const result = await pool.query(
        `
        SELECT 
          m.*, 
          l.name as league_name, 
          l.country, 
          l.code as league_code,
          l.emblem as league_emblem, 
          l.type as league_type
        FROM matches m 
        LEFT JOIN leagues l ON m.league_id = l.id 
        WHERE l.code = $1
          AND m.status = 'SCHEDULED'
          AND m.match_date > NOW()
        ORDER BY m.match_date ASC
        LIMIT 10
        `,
        [code]
      )

      if (result.rows.length > 0) {
        groupedMatches[code] = {
          league: {
            code: result.rows[0].league_code,
            name: result.rows[0].league_name,
            country: result.rows[0].country,
            emblem: result.rows[0].league_emblem,
          },
          matches: result.rows,
        }

        totalMatches += result.rows.length
      }
    }

    const orderedLeagues = popularLeagueCodes
      .map((code) => groupedMatches[code])
      .filter((league) => league !== undefined)

    res.status(200).json({
      leagues: orderedLeagues,
      total_matches: totalMatches,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

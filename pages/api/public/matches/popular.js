import { pool } from "../../../../lib/database"
import { errorHandler } from "../../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const popularLeagueCodes = ["PL", "PD", "BL1", "SA", "FL1", "CL"]

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE l.code = ANY($1) 
      AND m.status = 'SCHEDULED'
      AND m.match_date > NOW()
      ORDER BY l.code, m.match_date ASC
      LIMIT 50
    `,
      [popularLeagueCodes],
    )

    // Group by league
    const groupedMatches = {}
    result.rows.forEach((match) => {
      const leagueCode = match.league_code
      if (!groupedMatches[leagueCode]) {
        groupedMatches[leagueCode] = {
          league: {
            code: match.league_code,
            name: match.league_name,
            country: match.country,
            emblem: match.league_emblem,
          },
          matches: [],
        }
      }
      groupedMatches[leagueCode].matches.push(match)
    })

    res.status(200).json({
      leagues: Object.values(groupedMatches),
      total_matches: result.rows.length,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

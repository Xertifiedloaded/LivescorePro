import { pool } from "../../../../lib/database"
import { authenticateToken, errorHandler } from "../../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = await authenticateToken(req)
    if (!user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const { matchId } = req.query
    const userId = user.id

    // Validate matchId
    const matchIdInt = Number.parseInt(matchId, 10)
    if (isNaN(matchIdInt) || matchIdInt <= 0) {
      return res.status(400).json({ error: "Invalid match ID" })
    }

    // Get existing prediction for this user and match
    const result = await pool.query(
      `SELECT p.*, m.home_team, m.away_team, m.match_date, m.status as match_status,
              l.name as league_name, l.country
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       LEFT JOIN leagues l ON m.league_id = l.id
       WHERE p.user_id = $1 AND p.match_id = $2`,
      [userId, matchIdInt],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No prediction found for this match",
        prediction: null,
      })
    }

    res.status(200).json({
      message: "Prediction found",
      prediction: result.rows[0],
    })
  } catch (error) {
    console.error("Error getting match prediction:", error)
    errorHandler(error, req, res)
  }
}

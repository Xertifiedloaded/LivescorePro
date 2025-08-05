const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")
const router = express.Router()
router.post(
  "/",
  authenticateToken,
  [
    body("matchId").isInt({ min: 1 }),
    body("predictionType").isIn(["HOME", "DRAW", "AWAY"]),
    body("stakeAmount").isFloat({ min: 0.01, max: 10000 }),
  ],
  async (req, res) => {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        await client.query("ROLLBACK")
        return res.status(400).json({ errors: errors.array() })
      }

      const { matchId, predictionType, stakeAmount } = req.body
      const userId = req.user.id
      const matchResult = await client.query(
        `
      SELECT id, match_date, status, odds_home, odds_draw, odds_away 
      FROM matches 
      WHERE id = $1 AND status = 'SCHEDULED' AND match_date > NOW()
    `,
        [matchId],
      )

      if (matchResult.rows.length === 0) {
        await client.query("ROLLBACK")
        return res.status(400).json({ error: "Match not available for betting" })
      }

      const match = matchResult.rows[0]
      const existingPrediction = await client.query("SELECT id FROM predictions WHERE user_id = $1 AND match_id = $2", [
        userId,
        matchId,
      ])

      if (existingPrediction.rows.length > 0) {
        await client.query("ROLLBACK")
        return res.status(400).json({ error: "You already have a prediction for this match" })
      }

      const userResult = await client.query("SELECT balance FROM users WHERE id = $1", [userId])

      const userBalance = Number.parseFloat(userResult.rows[0].balance)

      if (userBalance < Number.parseFloat(stakeAmount)) {
        await client.query("ROLLBACK")
        return res.status(400).json({ error: "Insufficient balance" })
      }
      let odds
      switch (predictionType) {
        case "HOME":
          odds = match.odds_home
          break
        case "DRAW":
          odds = match.odds_draw
          break
        case "AWAY":
          odds = match.odds_away
          break
      }

      if (!odds) {
        await client.query("ROLLBACK")
        return res.status(400).json({ error: "Odds not available for this prediction type" })
      }

      const potentialWinnings = Number.parseFloat(stakeAmount) * Number.parseFloat(odds)
      const predictionResult = await client.query(
        `
      INSERT INTO predictions (user_id, match_id, prediction_type, stake_amount, potential_winnings) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `,
        [userId, matchId, predictionType, stakeAmount, potentialWinnings],
      )
      await client.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [stakeAmount, userId])

      await client.query("COMMIT")

      res.status(201).json({
        message: "Prediction created successfully",
        prediction: predictionResult.rows[0],
      })
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Create prediction error:", error)
      res.status(500).json({ error: "Failed to create prediction" })
    } finally {
      client.release()
    }
  },
)

// Get user's predictions
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query
    const userId = req.user.id

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

    res.json({
      predictions: result.rows,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      },
    })
  } catch (error) {
    console.error("Fetch predictions error:", error)
    res.status(500).json({ error: "Failed to fetch predictions" })
  }
})

// Get prediction statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const statsResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_predictions,
        COUNT(CASE WHEN status = 'WON' THEN 1 END) as won_predictions,
        COUNT(CASE WHEN status = 'LOST' THEN 1 END) as lost_predictions,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_predictions,
        COALESCE(SUM(CASE WHEN status = 'WON' THEN potential_winnings ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(stake_amount), 0) as total_staked
      FROM predictions 
      WHERE user_id = $1
    `,
      [userId],
    )

    const stats = statsResult.rows[0]
    const winRate =
      stats.total_predictions > 0
        ? ((stats.won_predictions / (stats.won_predictions + stats.lost_predictions)) * 100).toFixed(2)
        : 0

    res.json({
      stats: {
        ...stats,
        win_rate: Number.parseFloat(winRate),
        profit_loss: Number.parseFloat(stats.total_winnings) - Number.parseFloat(stats.total_staked),
      },
    })
  } catch (error) {
    console.error("Fetch prediction stats error:", error)
    res.status(500).json({ error: "Failed to fetch prediction statistics" })
  }
})

module.exports = router

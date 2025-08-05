const express = require("express")
const { pool } = require("../config/database")
const { fixtureService } = require("../services/fixtureService")
const router = express.Router()
router.get("/", async (req, res) => {
  try {
    const { league, status = "SCHEDULED", limit = 50, offset = 0, dateFrom, dateTo, stage, matchday } = req.query
    let query = `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE 1=1
    `
    const params = []
    let paramCount = 0

    if (status) {
      paramCount++
      query += ` AND m.status = $${paramCount}`
      params.push(status)
    }

    if (league) {
      paramCount++
      query += ` AND (l.name ILIKE $${paramCount} OR l.code ILIKE $${paramCount})`
      params.push(`%${league}%`)
    }

    if (dateFrom) {
      paramCount++
      query += ` AND m.match_date >= $${paramCount}`
      params.push(dateFrom)
    }

    if (dateTo) {
      paramCount++
      query += ` AND m.match_date <= $${paramCount}`
      params.push(dateTo)
    }

    if (stage) {
      paramCount++
      query += ` AND m.stage = $${paramCount}`
      params.push(stage)
    }

    if (matchday) {
      paramCount++
      query += ` AND m.matchday = $${paramCount}`
      params.push(Number.parseInt(matchday))
    }

    if (!dateFrom && !dateTo && status === "SCHEDULED") {
      paramCount++
      query += ` AND m.match_date > $${paramCount}`
      params.push(new Date())
    }

    query += ` ORDER BY m.match_date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await pool.query(query, params)

    res.json({
      matches: result.rows,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        total: result.rows.length,
      },
      filters: {
        league,
        status,
        dateFrom,
        dateTo,
        stage,
        matchday,
      },
    })
  } catch (error) {
    console.error("Fetch matches error:", error)
    res.status(500).json({ error: "Failed to fetch matches" })
  }
})

// Get live matches
router.get("/live", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.status IN ('IN_PLAY', 'PAUSED', 'LIVE') 
      ORDER BY m.match_date DESC
    `)

    res.json({
      matches: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Fetch live matches error:", error)
    res.status(500).json({ error: "Failed to fetch live matches" })
  }
})

// Get matches by competition code (e.g., PL, CL, etc.)
router.get("/competition/:code", async (req, res) => {
  try {
    const { code } = req.params
    const { limit = 20, offset = 0, status = "SCHEDULED" } = req.query

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
      [code.toUpperCase(), status, Number.parseInt(limit), Number.parseInt(offset)],
    )

    res.json({
      matches: result.rows,
      competition: code.toUpperCase(),
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      },
    })
  } catch (error) {
    console.error("Fetch competition matches error:", error)
    res.status(500).json({ error: "Failed to fetch competition matches" })
  }
})

// Get match by ID with enhanced details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Match not found" })
    }

    const match = result.rows[0]

    // Get prediction count for this match
    const predictionCount = await pool.query("SELECT COUNT(*) as count FROM predictions WHERE match_id = $1", [id])

    match.prediction_count = Number.parseInt(predictionCount.rows[0].count)

    res.json({ match })
  } catch (error) {
    console.error("Fetch match error:", error)
    res.status(500).json({ error: "Failed to fetch match" })
  }
})

// Get all leagues/competitions with enhanced data
router.get("/leagues/all", async (req, res) => {
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

    res.json({
      leagues: result.rows,
      total: result.rows.length,
    })
  } catch (error) {
    console.error("Fetch leagues error:", error)
    res.status(500).json({ error: "Failed to fetch leagues" })
  }
})

// Trigger manual fixture sync (admin endpoint)
router.post("/sync", async (req, res) => {
  try {
    console.log("Manual fixture sync triggered")
    fixtureService.syncFixtures().catch((error) => {
      console.error("Manual sync error:", error)
    })

    res.json({
      message: "Fixture synchronization started",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual sync trigger error:", error)
    res.status(500).json({ error: "Failed to trigger sync" })
  }
})

module.exports = router

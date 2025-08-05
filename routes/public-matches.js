const express = require("express")
const { pool } = require("../config/database")

const router = express.Router()

// Get today's matches
router.get("/today", async (req, res) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const result = await pool.query(
      `
      SELECT m.*, l.name as league_name, l.country, l.code as league_code,
             l.emblem as league_emblem, l.type as league_type
      FROM matches m 
      LEFT JOIN leagues l ON m.league_id = l.id 
      WHERE m.match_date >= $1 AND m.match_date < $2
      ORDER BY m.match_date ASC
    `,
      [startOfDay, endOfDay],
    )

    res.json({
      matches: result.rows,
      date: today.toISOString().split("T")[0],
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Fetch today's matches error:", error)
    res.status(500).json({ error: "Failed to fetch today's matches" })
  }
})

// Get this week's matches
router.get("/week", async (req, res) => {
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

    res.json({
      matches: result.rows,
      period: "next_7_days",
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Fetch week matches error:", error)
    res.status(500).json({ error: "Failed to fetch week matches" })
  }
})

// Get popular leagues with upcoming matches
router.get("/popular", async (req, res) => {
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

    res.json({
      leagues: Object.values(groupedMatches),
      total_matches: result.rows.length,
    })
  } catch (error) {
    console.error("Fetch popular matches error:", error)
    res.status(500).json({ error: "Failed to fetch popular matches" })
  }
})

// Get match statistics (public stats)
router.get("/stats", async (req, res) => {
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

    res.json({
      ...stats.rows[0],
      recent_matches: recentMatches.rows[0].recent_matches,
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Fetch match stats error:", error)
    res.status(500).json({ error: "Failed to fetch match statistics" })
  }
})

module.exports = router

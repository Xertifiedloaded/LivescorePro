const axios = require("axios")
const cron = require("node-cron")
const { pool } = require("../config/database")

class FixtureService {
  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY
    this.apiUrl = process.env.FOOTBALL_API_URL || "https://api.football-data.org/v4"
    this.headers = {
      "X-Auth-Token": this.apiKey,
    }
  }

  // Fetch all available areas
  async fetchAreas() {
    try {
      const response = await axios.get(`${this.apiUrl}/areas/`, {
        headers: this.headers,
      })
      return response.data.areas
    } catch (error) {
      console.error("Error fetching areas:", error.message)
      return []
    }
  }

  // Fetch competitions with optional area filter
  async fetchCompetitions(areas = null) {
    try {
      const params = {}
      if (areas) {
        params.areas = areas // Comma separated list of area ids
      }

      const response = await axios.get(`${this.apiUrl}/competitions/`, {
        headers: this.headers,
        params,
      })

      return response.data.competitions
    } catch (error) {
      console.error("Error fetching competitions:", error.message)
      return []
    }
  }

  // Fetch matches for a specific competition with filters
  async fetchMatches(competitionId, options = {}) {
    try {
      const { dateFrom, dateTo, stage, status, matchday, group, season } = options

      const params = {}

      // Add filters if provided
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (stage) params.stage = stage
      if (status) params.status = status
      if (matchday) params.matchday = matchday
      if (group) params.group = group
      if (season) params.season = season

      // Default date range if not provided
      if (!dateFrom && !dateTo) {
        params.dateFrom = new Date().toISOString().split("T")[0]
        params.dateTo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }

      const response = await axios.get(`${this.apiUrl}/competitions/${competitionId}/matches`, {
        headers: this.headers,
        params,
      })

      return response.data.matches
    } catch (error) {
      console.error(`Error fetching matches for competition ${competitionId}:`, error.message)
      return []
    }
  }

  // Fetch matches across multiple competitions
  async fetchMatchesAcrossCompetitions(options = {}) {
    try {
      const { competitions, ids, dateFrom, dateTo, status } = options

      const params = {}

      if (competitions) params.competitions = competitions // Comma separated competition ids
      if (ids) params.ids = ids // Comma separated match ids
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (status) params.status = status

      // Default to today's matches if no filters
      if (!dateFrom && !dateTo && !competitions) {
        params.dateFrom = new Date().toISOString().split("T")[0]
        params.dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }

      const response = await axios.get(`${this.apiUrl}/matches`, {
        headers: this.headers,
        params,
      })

      return response.data.matches
    } catch (error) {
      console.error("Error fetching matches across competitions:", error.message)
      return []
    }
  }

  // Fetch specific match by ID
  async fetchMatchById(matchId) {
    try {
      const response = await axios.get(`${this.apiUrl}/matches/${matchId}`, {
        headers: this.headers,
      })
      return response.data.match
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error.message)
      return null
    }
  }

  // Fetch teams for a competition
  async fetchTeams(competitionId, season = null) {
    try {
      const params = {}
      if (season) params.season = season

      const response = await axios.get(`${this.apiUrl}/competitions/${competitionId}/teams`, {
        headers: this.headers,
        params,
      })

      return response.data.teams
    } catch (error) {
      console.error(`Error fetching teams for competition ${competitionId}:`, error.message)
      return []
    }
  }

  // Fetch standings for a competition
  async fetchStandings(competitionId, options = {}) {
    try {
      const { matchday, season, date } = options
      const params = {}

      if (matchday) params.matchday = matchday
      if (season) params.season = season
      if (date) params.date = date

      const response = await axios.get(`${this.apiUrl}/competitions/${competitionId}/standings`, {
        headers: this.headers,
        params,
      })

      return response.data.standings
    } catch (error) {
      console.error(`Error fetching standings for competition ${competitionId}:`, error.message)
      return []
    }
  }

  // Save or update area in database
  async saveArea(area) {
    try {
      const result = await pool.query(
        `
        INSERT INTO areas (external_id, name, code, flag) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (external_id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          code = EXCLUDED.code,
          flag = EXCLUDED.flag
        RETURNING id
      `,
        [area.id, area.name, area.code, area.flag],
      )
      return result.rows[0].id
    } catch (error) {
      console.error("Error saving area:", error)
      return null
    }
  }

  // Save or update league in database
  async saveLeague(competition) {
    try {
      const result = await pool.query(
        `
        INSERT INTO leagues (external_id, name, country, season, code, type, emblem, plan, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (external_id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          country = EXCLUDED.country,
          season = EXCLUDED.season,
          code = EXCLUDED.code,
          type = EXCLUDED.type,
          emblem = EXCLUDED.emblem,
          plan = EXCLUDED.plan,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `,
        [
          competition.id,
          competition.name,
          competition.area?.name || "International",
          competition.currentSeason?.startDate?.substring(0, 4) || new Date().getFullYear().toString(),
          competition.code,
          competition.type,
          competition.emblem,
          competition.plan,
          true,
        ],
      )

      return result.rows[0].id
    } catch (error) {
      console.error("Error saving league:", error)
      return null
    }
  }

  // Save or update team in database
  async saveTeam(team) {
    try {
      const result = await pool.query(
        `
        INSERT INTO teams (external_id, name, short_name, tla, crest, address, website, founded, club_colors, venue, area_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (external_id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          short_name = EXCLUDED.short_name,
          tla = EXCLUDED.tla,
          crest = EXCLUDED.crest,
          address = EXCLUDED.address,
          website = EXCLUDED.website,
          founded = EXCLUDED.founded,
          club_colors = EXCLUDED.club_colors,
          venue = EXCLUDED.venue,
          area_name = EXCLUDED.area_name
        RETURNING id
      `,
        [
          team.id,
          team.name,
          team.shortName,
          team.tla,
          team.crest,
          team.address,
          team.website,
          team.founded,
          team.clubColors,
          team.venue,
          team.area?.name,
        ],
      )
      return result.rows[0].id
    } catch (error) {
      console.error("Error saving team:", error)
      return null
    }
  }

  // Save or update match in database
  async saveMatch(match, leagueId) {
    try {
      // Generate simple odds (in real app, you'd get these from odds API)
      const odds = this.generateSimpleOdds()

      await pool.query(
        `
        INSERT INTO matches (
          external_id, league_id, home_team, away_team, match_date, 
          status, home_score, away_score, odds_home, odds_draw, odds_away,
          matchday, stage, group_name, venue, referee, attendance
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (external_id) 
        DO UPDATE SET 
          home_team = EXCLUDED.home_team,
          away_team = EXCLUDED.away_team,
          match_date = EXCLUDED.match_date,
          status = EXCLUDED.status,
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          matchday = EXCLUDED.matchday,
          stage = EXCLUDED.stage,
          group_name = EXCLUDED.group_name,
          venue = EXCLUDED.venue,
          referee = EXCLUDED.referee,
          attendance = EXCLUDED.attendance,
          updated_at = CURRENT_TIMESTAMP
      `,
        [
          match.id,
          leagueId,
          match.homeTeam.name,
          match.awayTeam.name,
          new Date(match.utcDate),
          this.mapMatchStatus(match.status),
          match.score?.fullTime?.home || null,
          match.score?.fullTime?.away || null,
          odds.home,
          odds.draw,
          odds.away,
          match.matchday,
          match.stage,
          match.group,
          match.venue,
          match.referees?.[0]?.name,
          match.attendance,
        ],
      )
    } catch (error) {
      console.error("Error saving match:", error)
    }
  }

  // Map API status to our database status
  mapMatchStatus(apiStatus) {
    const statusMap = {
      SCHEDULED: "SCHEDULED",
      TIMED: "SCHEDULED",
      LIVE: "IN_PLAY",
      IN_PLAY: "IN_PLAY",
      PAUSED: "PAUSED",
      FINISHED: "FINISHED",
      POSTPONED: "POSTPONED",
      SUSPENDED: "POSTPONED",
      CANCELLED: "CANCELLED",
    }

    return statusMap[apiStatus] || "SCHEDULED"
  }

  // Generate simple odds (replace with real odds API)
  generateSimpleOdds() {
    return {
      home: (Math.random() * 3 + 1.2).toFixed(2),
      draw: (Math.random() * 2 + 2.5).toFixed(2),
      away: (Math.random() * 4 + 1.1).toFixed(2),
    }
  }

  // Sync all fixtures with improved API usage
  async syncFixtures() {
    console.log("Starting fixture synchronization...")

    try {
      // Major European leagues and competitions with proper codes
      const competitionCodes = [
        "PL", // Premier League
        "PD", // La Liga
        "BL1", // Bundesliga
        "SA", // Serie A
        "FL1", // Ligue 1
        "CL", // Champions League
        "EC", // European Championship
        "WC", // World Cup
        "ELC", // Championship
        "PPL", // Primeira Liga
        "DED", // Eredivisie
      ]

      // First, get all competitions to map codes to IDs
      const allCompetitions = await this.fetchCompetitions()
      const competitionMap = {}

      allCompetitions.forEach((comp) => {
        if (competitionCodes.includes(comp.code)) {
          competitionMap[comp.code] = comp
        }
      })

      // Sync each competition
      for (const [code, competition] of Object.entries(competitionMap)) {
        try {
          console.log(`Syncing ${competition.name} (${code})...`)

          // Save league
          const leagueId = await this.saveLeague(competition)
          if (!leagueId) {
            console.log(`Failed to save league for ${competition.name}`)
            continue
          }

          // Fetch and save teams for this competition
          const teams = await this.fetchTeams(competition.id)
          for (const team of teams) {
            await this.saveTeam(team)
          }

          // Fetch matches with different filters
          const matchOptions = {
            status: "SCHEDULED,LIVE,IN_PLAY,PAUSED", // Get upcoming and live matches
            dateFrom: new Date().toISOString().split("T")[0],
            dateTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Next 60 days
          }

          const matches = await this.fetchMatches(competition.id, matchOptions)

          for (const match of matches) {
            await this.saveMatch(match, leagueId)
          }

          console.log(`Synced ${matches.length} matches for ${competition.name}`)

          // Add delay to respect API rate limits (10 requests per minute for free tier)
          await new Promise((resolve) => setTimeout(resolve, 6000)) // 6 seconds between requests
        } catch (error) {
          console.error(`Error syncing competition ${code}:`, error.message)
        }
      }

      console.log("Fixture synchronization completed")
    } catch (error) {
      console.error("Error in fixture synchronization:", error)
    }
  }

  // Update match results with proper API usage
  async updateMatchResults() {
    console.log("Updating match results...")

    try {
      // Get matches that might have finished or are live
      const result = await pool.query(`
        SELECT DISTINCT external_id 
        FROM matches 
        WHERE status IN ('IN_PLAY', 'SCHEDULED', 'PAUSED') 
        AND match_date BETWEEN NOW() - INTERVAL '3 hours' AND NOW() + INTERVAL '3 hours'
        LIMIT 20
      `)

      for (const match of result.rows) {
        try {
          const matchData = await this.fetchMatchById(match.external_id)

          if (!matchData) continue

          await pool.query(
            `
            UPDATE matches 
            SET status = $1, home_score = $2, away_score = $3, 
                attendance = $4, updated_at = CURRENT_TIMESTAMP
            WHERE external_id = $5
          `,
            [
              this.mapMatchStatus(matchData.status),
              matchData.score?.fullTime?.home || null,
              matchData.score?.fullTime?.away || null,
              matchData.attendance || null,
              match.external_id,
            ],
          )

          // Update predictions based on results
          if (matchData.status === "FINISHED") {
            await this.updatePredictionResults(match.external_id, matchData)
          }

          // Respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 6000))
        } catch (error) {
          console.error(`Error updating match ${match.external_id}:`, error.message)
        }
      }

      console.log("Match results update completed")
    } catch (error) {
      console.error("Error updating match results:", error)
    }
  }

  // Get live matches across all competitions
  async getLiveMatches() {
    try {
      const liveMatches = await this.fetchMatchesAcrossCompetitions({
        status: "LIVE,IN_PLAY,PAUSED",
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        dateTo: new Date().toISOString().split("T")[0],
      })

      return liveMatches
    } catch (error) {
      console.error("Error fetching live matches:", error)
      return []
    }
  }

  // Update prediction results based on match outcome
  async updatePredictionResults(externalMatchId, matchData) {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      // Get match from database
      const matchResult = await client.query("SELECT id FROM matches WHERE external_id = $1", [externalMatchId])

      if (matchResult.rows.length === 0) {
        await client.query("ROLLBACK")
        return
      }

      const match = matchResult.rows[0]
      const homeScore = matchData.score?.fullTime?.home
      const awayScore = matchData.score?.fullTime?.away

      if (homeScore === null || awayScore === null) {
        await client.query("ROLLBACK")
        return
      }

      // Determine match outcome
      let outcome
      if (homeScore > awayScore) {
        outcome = "HOME"
      } else if (homeScore < awayScore) {
        outcome = "AWAY"
      } else {
        outcome = "DRAW"
      }

      // Get all pending predictions for this match
      const predictions = await client.query(
        "SELECT id, user_id, prediction_type, potential_winnings FROM predictions WHERE match_id = $1 AND status = $2",
        [match.id, "PENDING"],
      )

      for (const prediction of predictions.rows) {
        const isWinner = prediction.prediction_type === outcome
        const newStatus = isWinner ? "WON" : "LOST"

        // Update prediction status
        await client.query("UPDATE predictions SET status = $1 WHERE id = $2", [newStatus, prediction.id])

        // If won, add winnings to user balance
        if (isWinner) {
          await client.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [
            prediction.potential_winnings,
            prediction.user_id,
          ])
        }
      }

      await client.query("COMMIT")
      console.log(`Updated ${predictions.rows.length} predictions for match ${externalMatchId}`)
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Error updating prediction results:", error)
    } finally {
      client.release()
    }
  }
}

const fixtureService = new FixtureService()

// Start fixture synchronization with cron jobs
function startFixtureSync() {
  // Sync fixtures every 6 hours (respecting API limits)
  cron.schedule("0 */6 * * *", () => {
    fixtureService.syncFixtures()
  })

  // Update match results every 30 minutes (more frequent for live matches)
  cron.schedule("*/30 * * * *", () => {
    fixtureService.updateMatchResults()
  })

  // Initial sync on startup (after 30 seconds)
  setTimeout(() => {
    console.log("Starting initial fixture sync...")
    fixtureService.syncFixtures()
  }, 30000)

  console.log("Fixture synchronization cron jobs started")
}

module.exports = {
  fixtureService,
  startFixtureSync,
}

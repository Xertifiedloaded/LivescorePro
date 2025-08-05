const { pool } = require("../config/database")
const bcrypt = require("bcryptjs")

async function seedData() {
  const client = await pool.connect()

  try {
    console.log("Starting data seeding...")

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12)

    await client.query(
      `
      INSERT INTO users (username, email, password_hash, first_name, last_name, balance) VALUES
      ('john_doe', 'john@example.com', $1, 'John', 'Doe', 100.00),
      ('jane_smith', 'jane@example.com', $1, 'Jane', 'Smith', 150.00),
      ('mike_wilson', 'mike@example.com', $1, 'Mike', 'Wilson', 200.00)
      ON CONFLICT (username) DO NOTHING
    `,
      [hashedPassword],
    )

    // Insert sample leagues (if not already exists)
    await client.query(`
      INSERT INTO leagues (external_id, name, country, season, is_active) VALUES
      (2021, 'Premier League', 'England', '2024', true),
      (2014, 'La Liga', 'Spain', '2024', true),
      (2002, 'Bundesliga', 'Germany', '2024', true),
      (2019, 'Serie A', 'Italy', '2024', true),
      (2015, 'Ligue 1', 'France', '2024', true)
      ON CONFLICT (external_id) DO NOTHING
    `)

    // Insert sample matches
    const leagueResult = await client.query("SELECT id FROM leagues WHERE external_id = 2021")
    const leagueId = leagueResult.rows[0]?.id

    if (leagueId) {
      await client.query(
        `
        INSERT INTO matches (
          external_id, league_id, home_team, away_team, match_date, 
          status, odds_home, odds_draw, odds_away
        ) VALUES
        (1001, $1, 'Manchester United', 'Liverpool', NOW() + INTERVAL '2 days', 'SCHEDULED', 2.10, 3.20, 3.50),
        (1002, $1, 'Arsenal', 'Chelsea', NOW() + INTERVAL '3 days', 'SCHEDULED', 1.85, 3.40, 4.20),
        (1003, $1, 'Manchester City', 'Tottenham', NOW() + INTERVAL '4 days', 'SCHEDULED', 1.60, 4.00, 5.50),
        (1004, $1, 'Newcastle', 'Brighton', NOW() + INTERVAL '5 days', 'SCHEDULED', 2.30, 3.10, 3.20)
        ON CONFLICT (external_id) DO NOTHING
      `,
        [leagueId],
      )
    }

    console.log("Data seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding data:", error)
  } finally {
    client.release()
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedData().then(() => process.exit(0))
}

module.exports = { seedData }

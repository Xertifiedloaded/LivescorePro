const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Database connection error:', err)
})

async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('Database connection test successful:', result.rows[0])
    client.release()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error.message)
    return false
  }
}

async function initializeDatabase() {
  const isConnected = await testConnection()
  if (!isConnected) {
    throw new Error('Cannot connect to database. Please check your configuration.')
  }

  const client = await pool.connect()

  try {
    console.log('Creating database tables...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        external_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10),
        flag VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        external_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(50),
        tla VARCHAR(10),
        crest VARCHAR(255),
        address TEXT,
        website VARCHAR(255),
        founded INTEGER,
        club_colors TEXT,
        venue VARCHAR(100),
        area_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        balance DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        external_id INTEGER UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        country VARCHAR(50),
        season VARCHAR(20),
        code VARCHAR(10),
        type VARCHAR(50),
        emblem VARCHAR(255),
        plan VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        external_id INTEGER UNIQUE NOT NULL,
        league_id INTEGER REFERENCES leagues(id),
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        home_team_id INTEGER REFERENCES teams(id),
        away_team_id INTEGER REFERENCES teams(id),
        match_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'SCHEDULED',
        home_score INTEGER,
        away_score INTEGER,
        odds_home DECIMAL(4,2),
        odds_draw DECIMAL(4,2),
        odds_away DECIMAL(4,2),
        matchday INTEGER,
        stage VARCHAR(50),
        group_name VARCHAR(50),
        venue VARCHAR(100),
        referee VARCHAR(100),
        attendance INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
        prediction_type VARCHAR(20) NOT NULL,
        stake_amount DECIMAL(10,2) NOT NULL,
        potential_winnings DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, match_id)
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_areas_code ON areas(code);
      CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
      CREATE INDEX IF NOT EXISTS idx_teams_tla ON teams(tla);
      CREATE INDEX IF NOT EXISTS idx_leagues_code ON leagues(code);
      CREATE INDEX IF NOT EXISTS idx_leagues_external_id ON leagues(external_id);
      CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
      CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
      CREATE INDEX IF NOT EXISTS idx_matches_matchday ON matches(matchday);
      CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
      CREATE INDEX IF NOT EXISTS idx_matches_venue ON matches(venue);
      CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
      CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    `)

    await client.query(`
      INSERT INTO areas (external_id, name, code) VALUES
      (2072, 'England', 'ENG'),
      (2088, 'Germany', 'GER'),
      (2081, 'Spain', 'ESP'),
      (2114, 'Italy', 'ITA'),
      (2080, 'France', 'FRA'),
      (2077, 'Netherlands', 'NED'),
      (2187, 'Portugal', 'POR')
      ON CONFLICT (external_id) DO NOTHING
    `)

    await client.query(`
      INSERT INTO leagues (external_id, name, country, season, code, type, is_active) VALUES
      (2021, 'Premier League', 'England', '2024', 'PL', 'LEAGUE', true),
      (2014, 'La Liga', 'Spain', '2024', 'PD', 'LEAGUE', true),
      (2002, 'Bundesliga', 'Germany', '2024', 'BL1', 'LEAGUE', true),
      (2019, 'Serie A', 'Italy', '2024', 'SA', 'LEAGUE', true),
      (2015, 'Ligue 1', 'France', '2024', 'FL1', 'LEAGUE', true)
      ON CONFLICT (external_id) DO NOTHING
    `)

    console.log('Database tables created successfully')
  } finally {
    client.release()
  }
}

async function migrateDatabase() {
  const client = await pool.connect()

  try {
    console.log('Running database migrations...')

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('areas', 'teams', 'leagues', 'matches', 'users', 'predictions', 'refresh_tokens')
    `)

    const existingTables = tablesResult.rows.map((row) => row.table_name)
    console.log('Existing tables:', existingTables)

    if (existingTables.includes('leagues')) {
      const leagueColumns = [
        'ALTER TABLE leagues ADD COLUMN IF NOT EXISTS code VARCHAR(10)',
        'ALTER TABLE leagues ADD COLUMN IF NOT EXISTS type VARCHAR(50)',
        'ALTER TABLE leagues ADD COLUMN IF NOT EXISTS emblem VARCHAR(255)',
        'ALTER TABLE leagues ADD COLUMN IF NOT EXISTS plan VARCHAR(20)',
        'ALTER TABLE leagues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      ]

      for (const sql of leagueColumns) {
        try {
          await client.query(sql)
        } catch (error) {
          console.log(`Migration warning: ${error.message}`)
        }
      }
    }

    if (existingTables.includes('matches')) {
      const matchColumns = [
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS matchday INTEGER',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage VARCHAR(50)',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name VARCHAR(50)',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue VARCHAR(100)',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS referee VARCHAR(100)',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS attendance INTEGER',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS home_team_id INTEGER',
        'ALTER TABLE matches ADD COLUMN IF NOT EXISTS away_team_id INTEGER',
      ]

      for (const sql of matchColumns) {
        try {
          await client.query(sql)
        } catch (error) {
          console.log(`Migration warning: ${error.message}`)
        }
      }
    }

    console.log('Database migrations completed successfully')
  } catch (error) {
    console.error('Migration error:', error.message)
    // Don't throw error, just log it
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  initializeDatabase,
  testConnection,
  migrateDatabase,
}

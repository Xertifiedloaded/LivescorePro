const { Pool } = require('pg')
require('dotenv').config()

async function checkPostgreSQL() {
  console.log('Checking PostgreSQL configuration...')
  console.log('Current user:', process.env.USER || process.env.USERNAME)

  const configs = [
    {
      name: 'Current user (no password)',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'football_betting',
        user: process.env.USER || process.env.USERNAME,
      },
    },
    {
      name: 'Postgres user',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'football_betting',
        user: 'postgres',
        password: 'postgres',
      },
    },
    {
      name: 'Environment config',
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    },
  ]

  for (const { name, config } of configs) {
    try {
      console.log(`\nTrying ${name}...`)
      console.log(`Config:`, { ...config, password: config.password ? '***' : 'none' })

      const pool = new Pool(config)
      const client = await pool.connect()
      const result = await client.query('SELECT version(), current_user, current_database()')

      console.log('✅ Connection successful!')
      console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0])
      console.log('Connected as user:', result.rows[0].current_user)
      console.log('Database:', result.rows[0].current_database)

      client.release()
      await pool.end()

      console.log('\n🎉 Use this configuration in your .env file:')
      console.log(`DB_HOST=${config.host}`)
      console.log(`DB_PORT=${config.port}`)
      console.log(`DB_NAME=${config.database}`)
      console.log(`DB_USER=${config.user}`)
      console.log(`DB_PASSWORD=${config.password || ''}`)

      return
    } catch (error) {
      console.log('❌ Failed:', error.message)
    }
  }

  console.log('\n❌ Could not connect with any configuration.')
  console.log('\nTroubleshooting steps:')
  console.log('1. Make sure PostgreSQL is installed and running')
  console.log('2. Create the database: createdb football_betting')
  console.log('3. Check your username with: whoami')
  console.log('4. Try connecting manually: psql -d football_betting')
}

checkPostgreSQL().catch(console.error)

-- Test script to verify database setup
-- Run with: psql -d football_betting -f scripts/test-connection.sql

\echo '🔍 Testing Database Connection and Setup'
\echo '======================================='

\echo ''
\echo '1. Connection Information:'
SELECT 
    current_user as "Connected User",
    current_database() as "Database",
    inet_server_addr() as "Server Address",
    inet_server_port() as "Server Port",
    version() as "PostgreSQL Version";

\echo ''
\echo '2. Database Size:'
SELECT 
    pg_database.datname as "Database",
    pg_size_pretty(pg_database_size(pg_database.datname)) as "Size"
FROM pg_database 
WHERE datname = current_database();

\echo ''
\echo '3. Checking if tables exist:'
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

\echo ''
\echo '4. Testing basic operations:'
-- Create a test table
CREATE TABLE IF NOT EXISTS connection_test (
    id SERIAL PRIMARY KEY,
    test_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO connection_test (test_message) VALUES ('Database connection successful!');

-- Select test data
SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1;

-- Clean up
DROP TABLE connection_test;

\echo ''
\echo '✅ Database connection test completed successfully!'
\echo 'You can now run the main setup script.'

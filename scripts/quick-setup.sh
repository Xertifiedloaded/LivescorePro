#!/bin/bash

echo "🏈 Quick PostgreSQL Setup for Football Betting App"
echo "=================================================="

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL is not running. Starting it..."
    brew services start postgresql
    sleep 3
else
    echo "✅ PostgreSQL is running"
fi

# Get current user
CURRENT_USER=$(whoami)
echo "👤 Current user: $CURRENT_USER"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw football_betting; then
    echo "✅ Database 'football_betting' already exists"
else
    echo "📦 Creating database 'football_betting'..."
    createdb football_betting
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
        exit 1
    fi
fi

# Test connection
echo "🔌 Testing database connection..."
if psql -d football_betting -c "SELECT 'Connection successful!' as status;" > /dev/null 2>&1; then
    echo "✅ Connection test passed"
    
    # Show connection info
    echo ""
    echo "📋 Database Information:"
    psql -d football_betting -c "SELECT current_user as user, current_database() as database, version() as postgresql_version;" -t
    
    echo ""
    echo "🎯 Your .env configuration should be:"
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_NAME=football_betting"
    echo "DB_USER=$CURRENT_USER"
    echo "DB_PASSWORD="
    echo "DB_SSL=false"
    
else
    echo "❌ Connection test failed"
    echo "Try running: psql -d football_betting"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Update your .env file with the configuration above"
echo "2. Run: psql -d football_betting -f scripts/setup-database-macos.sql"
echo "3. Run: npm run dev"

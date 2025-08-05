#!/bin/bash

echo "🔍 PostgreSQL Diagnostic Tool"
echo "============================="

echo ""
echo "1. Checking if PostgreSQL is installed..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
    psql --version
else
    echo "❌ PostgreSQL is not installed"
    echo "Install with: brew install postgresql"
    exit 1
fi

echo ""
echo "2. Checking if PostgreSQL is running..."
if pgrep -x "postgres" > /dev/null; then
    echo "✅ PostgreSQL is running"
    echo "Process info:"
    ps aux | grep postgres | grep -v grep | head -3
else
    echo "❌ PostgreSQL is not running"
    echo "Start with: brew services start postgresql"
fi

echo ""
echo "3. Checking PostgreSQL port..."
if lsof -i :5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is listening on port 5432"
    lsof -i :5432
else
    echo "❌ Nothing is listening on port 5432"
fi

echo ""
echo "4. Current user information..."
echo "System user: $(whoami)"
echo "User ID: $(id -u)"

echo ""
echo "5. Listing available databases..."
if psql -l > /dev/null 2>&1; then
    echo "✅ Can connect to PostgreSQL"
    echo "Available databases:"
    psql -l | grep -E "^\s*\w+\s*\|"
else
    echo "❌ Cannot connect to PostgreSQL"
    echo "Error details:"
    psql -l 2>&1 | head -5
fi

echo ""
echo "6. Checking for football_betting database..."
if psql -lqt | cut -d \| -f 1 | grep -qw football_betting; then
    echo "✅ football_betting database exists"
    echo "Testing connection..."
    if psql -d football_betting -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Can connect to football_betting database"
    else
        echo "❌ Cannot connect to football_betting database"
    fi
else
    echo "❌ football_betting database does not exist"
    echo "Create with: createdb football_betting"
fi

echo ""
echo "7. Environment check..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "Database configuration:"
    grep "^DB_" .env || echo "No DB_ variables found"
else
    echo "❌ .env file not found"
fi

echo ""
echo "🎯 Recommended actions:"
echo "1. If PostgreSQL is not running: brew services start postgresql"
echo "2. If database doesn't exist: createdb football_betting"
echo "3. Update .env with: DB_USER=$(whoami)"
echo "4. Test connection: psql -d football_betting"

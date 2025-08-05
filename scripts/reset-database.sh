#!/bin/bash

echo "🔄 Resetting Football Betting Database"
echo "======================================"

# Get current user
CURRENT_USER=$(whoami)

echo "⚠️  This will delete all data in the football_betting database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🗑️  Dropping existing database..."
dropdb football_betting 2>/dev/null || echo "Database didn't exist"

echo "📦 Creating fresh database..."
createdb football_betting

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

echo "🔌 Testing connection..."
if psql -d football_betting -c "SELECT 'Database ready!' as status;" > /dev/null 2>&1; then
    echo "✅ Connection successful"
    
    echo "📋 Your .env should have:"
    echo "DB_HOST=localhost"
    echo "DB_PORT=5432"
    echo "DB_NAME=football_betting"
    echo "DB_USER=$CURRENT_USER"
    echo "DB_PASSWORD="
    echo "DB_SSL=false"
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Make sure your .env file has the correct settings above"
    echo "2. Run: npm run dev"
    
else
    echo "❌ Connection failed"
    exit 1
fi

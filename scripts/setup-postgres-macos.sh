#!/bin/bash

echo "Setting up PostgreSQL on macOS..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing via Homebrew..."
    brew install postgresql
    brew services start postgresql
else
    echo "PostgreSQL is already installed"
fi

# Get the current user
CURRENT_USER=$(whoami)
echo "Current user: $CURRENT_USER"

# Check if PostgreSQL is running
if ! brew services list | grep postgresql | grep started > /dev/null; then
    echo "Starting PostgreSQL service..."
    brew services start postgresql
fi

# Create the database using current user
echo "Creating database with user: $CURRENT_USER"
createdb football_betting

# Create postgres role if it doesn't exist (optional)
echo "Creating postgres role..."
psql -d football_betting -c "CREATE ROLE postgres WITH LOGIN SUPERUSER CREATEDB CREATEROLE PASSWORD 'postgres';" 2>/dev/null || echo "postgres role might already exist"

echo "Database setup completed!"
echo "You can now connect with: psql -d football_betting"

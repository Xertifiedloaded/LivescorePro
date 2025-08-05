#!/bin/bash

# Quick setup script for sports betting backend

echo "🚀 Setting up Sports Betting Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install express cors dotenv bcrypt jsonwebtoken cookie-parser nodemailer node-cron node-fetch prisma @prisma/client pg

# Install dev dependencies
echo "🔧 Installing dev dependencies..."
npm install --save-dev nodemon @types/node @types/pg eslint prettier



echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your DATABASE_URL in .env"
echo "2. Run 'npx prisma db push' to create database schema"
echo "3. Run 'npm run dev' to start development server"

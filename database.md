# Environment Variables Setup Guide

This guide will help you set up all the necessary environment variables for the Football Betting Backend API.

## Quick Start

1. Copy the example file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Edit the `.env` file with your actual values

## Required Variables

### Database (PostgreSQL)

\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_betting
DB_USER=your_username
DB_PASSWORD=your_password
\`\`\`

**Setup Instructions:**

1. Install PostgreSQL
2. Create a database: `createdb football_betting`
3. Create a user with appropriate permissions

### JWT Authentication

\`\`\`env
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
\`\`\`

**Generate Strong Secrets:**
\`\`\`bash

# Generate JWT secret

node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate refresh secret

node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

### Football Data API

\`\`\`env
FOOTBALL_API_KEY=your_api_key
\`\`\`

**Get API Key:**

1. Visit [football-data.org](https://www.football-data.org/client/register)
2. Register for a free account
3. Get your API key from the dashboard
4. Free tier: 10 requests/minute, 100 requests/day

## Optional Variables

### Email Service (for notifications)

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
\`\`\`

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in SMTP_PASS

### Payment Integration

\`\`\`env

# Stripe

STRIPE*SECRET_KEY=sk_test*...
STRIPE*PUBLISHABLE_KEY=pk_test*...

# PayPal

PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
\`\`\`

### Redis (for caching)

\`\`\`env
REDIS_URL=redis://localhost:6379
\`\`\`

## Environment-Specific Files

### Development

Create `.env.development` for development-specific settings:

- Lower security requirements
- Test API keys
- Local database
- Relaxed rate limiting

### Production

Create `.env.production` for production:

- Strong security settings
- Production API keys
- Remote database with SSL
- Strict rate limiting
- Error monitoring

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use strong, unique secrets for production**
3. **Rotate secrets regularly**
4. **Use different secrets for different environments**
5. **Limit API key permissions**

## Validation

The application will validate required environment variables on startup. Missing required variables will cause the application to exit with an error message.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists
- Check firewall settings

### API Key Issues

- Verify API key is correct
- Check API rate limits
- Ensure API key has required permissions

### JWT Issues

- Ensure secrets are at least 32 characters
- Use different secrets for access and refresh tokens
- Don't use simple strings in production

## Environment Loading Order

The application loads environment variables in this order:

1. System environment variables
2. `.env.production` (if NODE_ENV=production)
3. `.env.development` (if NODE_ENV=development)
4. `.env.local` (always loaded, gitignored)
5. `.env` (default file)

Variables loaded later override earlier ones.

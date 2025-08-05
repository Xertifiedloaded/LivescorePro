# REST Client API Tests

This directory contains `.rest` files for testing the Football Betting API using the REST Client extension in VS Code.

## Setup

1. Install the "REST Client" extension in VS Code
2. Make sure your server is running: `npm run dev`
3. Open any `.rest` file and click "Send Request" above each HTTP request

## Files

- `auth.rest` - Authentication endpoints (register, login, profile)
- `matches.rest` - Match viewing endpoints (public, no auth required)
- `predictions.rest` - Betting/prediction endpoints (requires auth)
- `users.rest` - User management endpoints (balance, profile)
- `complete-flow.rest` - Full user journey from registration to betting
- `health.rest` - Health checks and API info

## Usage

1. **Start with `health.rest`** - Test basic connectivity
2. **Run `auth.rest`** - Register and login users
3. **Try `matches.rest`** - Browse available matches
4. **Use `complete-flow.rest`** - Test the entire user journey
5. **Test `predictions.rest`** - Place bets and view predictions

## Variables

The files use variables like:
- `@baseUrl` - API base URL
- `@authToken` - JWT token from login responses
- `@contentType` - Content-Type header

## Tips

- Click "Send Request" above each `###` section
- Variables are automatically populated from previous responses
- Check the Response panel for results
- Use `# @name` to save responses for later use

## Example Flow

1. Register: `POST /auth/register`
2. Login: `POST /auth/login` (saves token)
3. Add funds: `POST /users/add-funds`
4. View matches: `GET /matches`
5. Place bet: `POST /predictions`
6. Check results: `GET /predictions/my`
# LivescorePro
# LivescorePro
# LivescorePro
# LivescorePro
# LivescorePro
# LivescorePro
# LivescorePro

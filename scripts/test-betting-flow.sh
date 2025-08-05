#!/bin/bash

echo "🏈 Testing Complete Betting Flow"
echo "==============================="

BASE_URL="http://localhost:3000/api"

echo ""
echo "1. Viewing Today's Matches (Public)..."
curl -s $BASE_URL/today | python -m json.tool 2>/dev/null

echo ""
echo "2. Registering New User..."
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bettor_'$TIMESTAMP'",
    "email": "bettor'$TIMESTAMP'@example.com",
    "password": "BettingPass123",
    "firstName": "Lucky",
    "lastName": "Bettor"
  }')

echo $REGISTER_RESPONSE | python -m json.tool 2>/dev/null

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo ""
    echo "3. Adding Funds to Account..."
    curl -s -X POST $BASE_URL/users/add-funds \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"amount": 100.00}' | python -m json.tool 2>/dev/null
    
    echo ""
    echo "4. Checking Balance..."
    curl -s -X GET $BASE_URL/users/balance \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" | python -m json.tool 2>/dev/null
    
    echo ""
    echo "5. Viewing Available Matches..."
    curl -s "$BASE_URL/matches?limit=5" | python -m json.tool 2>/dev/null
    
    echo ""
    echo "✅ Betting flow test completed!"
else
    echo "❌ Registration failed, cannot continue"
fi

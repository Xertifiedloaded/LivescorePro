#!/bin/bash

echo "🔐 Testing Authentication Flow"
echo "============================="

BASE_URL="http://localhost:3000/api"

echo ""
echo "1. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "Registration Response:"
echo $REGISTER_RESPONSE | python -m json.tool 2>/dev/null || echo $REGISTER_RESPONSE

# Extract access token from response
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo ""
    echo "✅ Registration successful!"
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
    
    echo ""
    echo "2. Testing Protected Route (User Profile)..."
    curl -s -X GET $BASE_URL/auth/profile \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" | python -m json.tool 2>/dev/null
    
    echo ""
    echo "3. Testing User Balance..."
    curl -s -X GET $BASE_URL/users/balance \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" | python -m json.tool 2>/dev/null
      
else
    echo "❌ Registration failed"
fi

echo ""
echo "4. Testing Login with existing user..."
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "Password123"
  }' | python -m json.tool 2>/dev/null

echo ""
echo "🏁 Authentication tests completed!"

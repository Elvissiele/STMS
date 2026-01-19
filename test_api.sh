#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Registering User..."
REGISTER_RES=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","name":"Test User"}')
echo $REGISTER_RES

echo "\n2. Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}')
echo $LOGIN_RES
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | awk -F':' '{print $2}' | tr -d '"')

if [ -z "$TOKEN" ]; then
    echo "Login failed, no token obtained."
    exit 1
fi

echo "\nToken: $TOKEN"

echo "\n3. Creating Ticket..."
curl -s -X POST "$BASE_URL/api/v1/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"title":"Test Ticket","description":"Help me!","priority":"HIGH"}'

echo "\n4. Getting Tickets..."
curl -s -X GET "$BASE_URL/api/v1/tickets" \
    -H "Authorization: Bearer $TOKEN"

echo "\n5. Checking Admin Interface (Validation)..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$BASE_URL/admin/login")
echo "Admin Login Page Status: $STATUS"

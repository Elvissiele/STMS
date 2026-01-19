#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"

echo "1. Registering Users (Admin & Customer)..."
# Create Admin (if not exists, seed might have handled it but let's register a new one or login)
# We'll rely on the seeded admin: admin@example.com / admin123
# Create Customer
curl -s -X POST $BASE_URL/auth/register -H "Content-Type: application/json" -d '{"email":"customer_dash@example.com","password":"password123","name":"Dash Customer"}' > /dev/null

echo "2. Logging in..."
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')
CUSTOMER_TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email":"customer_dash@example.com","password":"password123"}' | jq -r '.token')

if [ "$ADMIN_TOKEN" == "null" ] || [ "$CUSTOMER_TOKEN" == "null" ]; then
    echo "Login failed. Admin: $ADMIN_TOKEN, Customer: $CUSTOMER_TOKEN"
    exit 1
fi

echo "3. Customer creates a ticket..."
TICKET_ID=$(curl -s -X POST $BASE_URL/tickets -H "Authorization: Bearer $CUSTOMER_TOKEN" -H "Content-Type: application/json" -d '{"title":"Dashboard Test","description":"Testing internal comments","priority":"LOW"}' | jq -r '.id')
echo "Ticket ID: $TICKET_ID"

echo "4. Admin adds INTERNAL comment..."
curl -s -X POST $BASE_URL/tickets/$TICKET_ID/comments -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"content":"This is a secret note","isInternal":true}' | jq '.'

echo "5. Admin adds PUBLIC comment..."
curl -s -X POST $BASE_URL/tickets/$TICKET_ID/comments -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"content":"This is a public reply","isInternal":false}' | jq '.'

echo "6. Verifying Views..."
echo "--- Admin View (Should see 2 comments) ---"
ADMIN_VIEW_COUNT=$(curl -s -X GET $BASE_URL/tickets/$TICKET_ID -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.comments | length')
echo "Admin sees: $ADMIN_VIEW_COUNT comments"

echo "--- Customer View (Should see 1 comment) ---"
CUSTOMER_VIEW_COUNT=$(curl -s -X GET $BASE_URL/tickets/$TICKET_ID -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.comments | length')
echo "Customer sees: $CUSTOMER_VIEW_COUNT comments"

if [ "$ADMIN_VIEW_COUNT" -eq 2 ] && [ "$CUSTOMER_VIEW_COUNT" -eq 1 ]; then
    echo "SUCCESS: Internal comments are correctly filtered."
else
    echo "FAILURE: Comment counts do not match expected values."
    exit 1
fi

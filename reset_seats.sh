#!/bin/bash

# Reset all seats to available state
# Useful for testing and demonstrations

BASE_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Resetting all seats to available state..."

RESPONSE=$(curl -X POST "$BASE_URL/seats/reset" \
    -H "Content-Type: application/json" \
    -s)

if [ $? -eq 0 ]; then
    MESSAGE=$(echo "$RESPONSE" | jq -r '.message // "Reset completed"')
    RESET_COUNT=$(echo "$RESPONSE" | jq -r '.resetCount // "unknown"')
    TIMESTAMP=$(echo "$RESPONSE" | jq -r '.timestamp // "unknown"')
    
    echo -e "${GREEN}✅ SUCCESS${NC}: $MESSAGE"
    if [ "$RESET_COUNT" != "unknown" ]; then
        echo -e "${YELLOW}📊 Reset count${NC}: $RESET_COUNT seats"
    fi
    echo -e "${YELLOW}📅 Timestamp${NC}: $TIMESTAMP"
    
    # Show current seat status
    echo ""
    echo "📊 Current seat status:"
    curl -s "$BASE_URL/seats" | jq '.[] | {id: .id, seatNumber: .seatNumber, isReserved: .isReserved, selectedBy: .selectedBy}'
else
    echo -e "${RED}❌ FAILED${NC}: Could not reset seats"
    exit 1
fi
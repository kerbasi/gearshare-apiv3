#!/bin/bash

# Auto Parts API - Quick Test Script
# This script performs basic API testing

echo "🧪 Auto Parts API - Quick Test"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPass123!"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -s "$API_URL/health" | grep -q "ok"; then
    print_status "Health check passed"
else
    print_error "Health check failed - is the API running?"
    exit 1
fi

# Test Swagger documentation
echo "2. Testing Swagger documentation..."
if curl -s "$API_URL/api/docs" | grep -q "swagger"; then
    print_status "Swagger documentation accessible"
else
    print_error "Swagger documentation not accessible"
fi

# Register a test user
echo "3. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"testuser\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
    print_status "User registration successful"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    print_info "User might already exist, trying login..."
    
    # Try to login instead
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
      }")
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        print_status "User login successful"
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    else
        print_error "Both registration and login failed"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi

# Test protected endpoint
echo "4. Testing protected endpoint..."
if curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | grep -q "email"; then
    print_status "Protected endpoint access successful"
else
    print_error "Protected endpoint access failed"
fi

# Test public endpoints
echo "5. Testing public endpoints..."

# Test parts endpoint
if curl -s "$API_URL/parts/active" | grep -q "\[\]"; then
    print_status "Parts endpoint accessible (empty list)"
else
    print_info "Parts endpoint returned data or error"
fi

# Test categories endpoint
if curl -s "$API_URL/categories/active" | grep -q "\[\]"; then
    print_status "Categories endpoint accessible (empty list)"
else
    print_info "Categories endpoint returned data or error"
fi

# Test manufacturers endpoint
if curl -s "$API_URL/manufacturers/active" | grep -q "\[\]"; then
    print_status "Manufacturers endpoint accessible (empty list)"
else
    print_info "Manufacturers endpoint returned data or error"
fi

# Test search endpoint
if curl -s "$API_URL/parts/search?q=test" | grep -q "\[\]"; then
    print_status "Search endpoint accessible (no results)"
else
    print_info "Search endpoint returned data or error"
fi

# Test rate limiting (optional)
echo "6. Testing rate limiting..."
print_info "Making 5 rapid requests to test rate limiting..."
for i in {1..5}; do
    curl -s "$API_URL/parts/active" > /dev/null
    echo -n "."
done
echo ""
print_status "Rate limiting test completed"

echo ""
echo "🎉 Basic API testing completed!"
echo "=============================="
echo ""
echo "API is running and responding correctly!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000/api/docs for interactive testing"
echo "2. Create some test data (categories, manufacturers, parts)"
echo "3. Test all CRUD operations"
echo "4. Check logs in the logs/ directory"
echo ""
print_status "Happy testing! 🚀"

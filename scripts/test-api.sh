#!/bin/bash

# Test script for Loan Approval API
# Tests various loan approval scenarios

set -e

# Get API URL from CDK outputs
API_URL=$(npx cdk list --json | jq -r '.[0]' | xargs npx cdk output --stack | grep ApiEndpoint | cut -d' ' -f2)

if [ -z "$API_URL" ]; then
    echo "❌ Could not find API URL. Make sure the stack is deployed."
    exit 1
fi

echo "🧪 Testing Loan Approval API"
echo "============================"
echo "API URL: $API_URL"
echo ""

# Test 1: High-quality applicant (should be approved)
echo "Test 1: High-quality applicant"
echo "------------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "income": 100000,
    "credit_score": 780,
    "debt_to_income": 0.2,
    "employment_years": 5
  }' | jq '.'

echo -e "\n"

# Test 2: Marginal applicant (might be approved)
echo "Test 2: Marginal applicant"
echo "--------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "income": 50000,
    "credit_score": 680,
    "debt_to_income": 0.4,
    "employment_years": 2
  }' | jq '.'

echo -e "\n"

# Test 3: Poor credit applicant (should be denied)
echo "Test 3: Poor credit applicant"
echo "-----------------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "income": 30000,
    "credit_score": 580,
    "debt_to_income": 0.6,
    "employment_years": 0
  }' | jq '.'

echo -e "\n"

# Test 4: Invalid request (should return error)
echo "Test 4: Invalid request"
echo "-----------------------"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "income": "invalid",
    "credit_score": 999
  }' | jq '.'

echo -e "\n"
echo "✅ API testing completed!"

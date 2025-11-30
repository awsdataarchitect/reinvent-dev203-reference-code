#!/bin/bash

# Loan Approval Service Deployment Script
# Deploys the financial services microservice with compliance validation

set -e

echo "🏦 Loan Approval Service Deployment"
echo "=================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run compliance validation
echo "🔒 Running compliance validation..."
./scripts/validate-compliance.sh

# Bootstrap CDK (if needed)
echo "🚀 Bootstrapping CDK..."
npx cdk bootstrap

# Deploy the stack
echo "🏗️  Deploying loan approval service..."
npx cdk deploy --require-approval never

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "   - Service: Loan Approval Microservice"
echo "   - Runtime: Python 3.9 Lambda"
echo "   - Database: DynamoDB with encryption"
echo "   - API: REST API with validation"
echo "   - Compliance: CFN Guard validated"
echo ""
echo "🧪 Test your API:"
echo "   curl -X POST [API_URL]/loan-approval \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"income\": 75000, \"credit_score\": 720, \"debt_to_income\": 0.3, \"employment_years\": 3}'"
echo ""
echo "🗑️  To cleanup: npm run destroy"

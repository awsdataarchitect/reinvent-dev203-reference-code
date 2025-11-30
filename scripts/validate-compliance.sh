#!/bin/bash

# Financial Services Compliance Validation Script
# Validates CloudFormation templates against CFN Guard rules

set -e

echo "🔒 Financial Services Compliance Validation"
echo "=========================================="

# Check if cfn-guard is installed
if ! command -v cfn-guard &> /dev/null; then
    echo "❌ cfn-guard is not installed. Please install it first:"
    echo "   cargo install cfn-guard"
    echo "   Or download from: https://github.com/aws-cloudformation/cloudformation-guard"
    exit 1
fi

# Build CDK to generate CloudFormation template
echo "📦 Building CDK stack..."
npm run build

# Synthesize CloudFormation template
echo "🏗️  Synthesizing CloudFormation template..."
npx cdk synth > cdk.out/template.json

# Validate against CFN Guard rules
echo "🛡️  Validating against financial compliance rules..."
cfn-guard validate \
    --data cdk.out/template.json \
    --rules cfn-guard/financial-compliance.guard \
    --show-summary \
    --output-format json > compliance-report.json

# Check validation results
if cfn-guard validate --data cdk.out/template.json --rules cfn-guard/financial-compliance.guard --show-summary; then
    echo "✅ All compliance checks passed!"
    echo ""
    echo "📊 Compliance Summary:"
    echo "   - Lambda encryption: ✅"
    echo "   - DynamoDB security: ✅"
    echo "   - API Gateway logging: ✅"
    echo "   - IAM least privilege: ✅"
    echo "   - No hardcoded secrets: ✅"
    echo ""
    echo "🚀 Ready for deployment!"
else
    echo "❌ Compliance validation failed!"
    echo "📋 Check compliance-report.json for details"
    exit 1
fi

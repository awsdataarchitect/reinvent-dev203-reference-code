# Technology Stack

## Infrastructure

- **AWS CDK 2.170.0** (TypeScript) - Infrastructure as Code
- **Node.js 18+** - Runtime for CDK
- **TypeScript 5.7.2** - CDK stack implementation language

## Application

- **Python 3.13** - Lambda runtime
- **AWS Lambda** - Serverless compute
- **API Gateway** - REST API management
- **DynamoDB** - Audit trail storage with encryption and point-in-time recovery
- **CloudWatch Logs** - Application logging (1 week retention)

## Development Tools

- **CFN Guard** - Policy-as-code compliance validation
- **Jest 29.7.0** - Testing framework
- **AWS CLI** - AWS operations

## Common Commands

### Build & Deploy
```bash
npm install              # Install dependencies
npm run build            # Compile TypeScript
npm run deploy           # Deploy stack to AWS
npm run destroy          # Tear down stack
./scripts/deploy.sh      # Deploy with compliance validation
```

### Development
```bash
npm run watch            # Watch mode for TypeScript compilation
npm test                 # Run tests
npx cdk synth            # Synthesize CloudFormation template
npx cdk diff             # Show stack changes
```

### Testing & Validation
```bash
./scripts/test-api.sh                    # Test deployed API
./scripts/validate-compliance.sh         # Run CFN Guard validation
cfn-guard validate --data cfn-template.json --rules cfn-guard/financial-compliance.guard
```

## Key Dependencies

- `aws-cdk-lib@2.170.0`: CDK constructs library
- `constructs@^10.0.0`: CDK constructs base
- `boto3`: AWS SDK for Python (Lambda runtime)
- `typescript@5.7.2`: TypeScript compiler
- `jest@29.7.0`: Testing framework
- `ts-jest@29.2.5`: TypeScript Jest transformer

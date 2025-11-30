# Project Structure

## Directory Layout

```
loan-approval-service/
├── bin/                          # CDK app entry points
├── lib/                          # CDK stack definitions
│   └── loan-approval-stack.ts    # Main infrastructure stack
├── lambda/                       # Lambda function code
│   └── loan_approval.py          # Python business logic
├── cfn-guard/                    # Compliance rules
│   └── financial-compliance.guard
├── scripts/                      # Deployment and testing scripts
│   ├── deploy.sh                 # Deploy with validation
│   ├── test-api.sh               # API testing
│   └── validate-compliance.sh    # CFN Guard validation
├── test-data/                    # Sample API requests
│   └── sample-requests.json
├── cdk.out/                      # CDK synthesis output (generated)
├── node_modules/                 # Dependencies (generated)
├── package.json                  # Node.js dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── cdk.json                      # CDK configuration
├── cfn-template.json             # Generated CloudFormation template
└── README.md                     # Documentation
```

## Architecture Patterns

### Infrastructure (CDK Stack)
- Single stack pattern in `lib/loan-approval-stack.ts`
- Resources: Lambda, API Gateway, DynamoDB, IAM roles, CloudWatch logs
- Outputs: API URL, endpoint, and table name for easy reference

### Lambda Function
- Single-file Python handler in `lambda/loan_approval.py`
- Stateless design with DynamoDB for persistence
- Environment variables for configuration (table name)
- Decimal conversion for DynamoDB compatibility

### API Design
- RESTful endpoint: POST /loan-approval
- Request validation at API Gateway level with JSON schema
- CORS enabled for cross-origin requests
- Structured error responses

## Code Organization Conventions

- **CDK stacks**: TypeScript in `lib/` directory
- **Lambda handlers**: Python in `lambda/` directory
- **Compliance rules**: CFN Guard rules in `cfn-guard/` directory
- **Automation**: Bash scripts in `scripts/` directory
- **Test data**: JSON fixtures in `test-data/` directory

## Configuration Files

- `cdk.json`: CDK app configuration and context
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and npm scripts

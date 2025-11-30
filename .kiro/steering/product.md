# Product Overview

A loan approval microservice demonstrating AI-driven financial services development with AWS CDK. The service provides a REST API that evaluates loan applications using a credit scoring algorithm and maintains an audit trail for compliance.

## Core Functionality

- REST API endpoint for loan approval decisions
- Credit scoring based on income, credit score, debt-to-income ratio, and employment history
- Approval threshold: score ≥ 70 (out of 100)
- Complete audit trail of all decisions stored in DynamoDB
- Request validation and error handling

## Key Features

- **Security-first**: Encryption at rest, least privilege IAM policies
- **Compliance**: CFN Guard policy-as-code validation for financial services
- **Production-ready**: Proper logging, monitoring, and error handling
- **Demo-optimized**: Simple but realistic use case for showcasing AI-assisted development

## API Contract

POST /loan-approval with JSON body containing:
- `income` (number): Annual income
- `credit_score` (integer, 300-850): Credit score
- `debt_to_income` (number, 0-1): Debt-to-income ratio
- `employment_years` (integer): Years of employment

Returns loan decision with approval status, score, reasoning, and loan ID.

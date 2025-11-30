# Requirements Document

## Introduction

This document specifies the requirements for a Loan Approval Microservice designed as a demonstration of AI-driven development in the financial services domain. The system showcases how Kiro can accelerate secure, compliant financial application development using policy-as-code validation with AWS CloudFormation Guard (CFN Guard). The microservice is optimized for lightning talk demonstrations, featuring a simple yet realistic loan approval workflow with comprehensive security controls.

## Glossary

- **Loan_Approval_System**: The complete microservice including API Gateway, Lambda function, and DynamoDB audit storage
- **API_Gateway**: AWS API Gateway REST API that receives loan approval requests
- **Approval_Engine**: Python Lambda function that evaluates loan applications using a credit scoring algorithm
- **Audit_Store**: DynamoDB table that maintains an immutable audit trail of all loan decisions
- **CFN_Guard**: AWS CloudFormation Guard tool for policy-as-code infrastructure validation
- **Credit_Score**: Numerical value (300-850) representing an applicant's creditworthiness
- **Debt_to_Income_Ratio**: Ratio of monthly debt payments to monthly income (0.0-1.0)
- **Approval_Threshold**: Minimum score of 70 required for loan approval
- **Compliance_Rules**: CFN Guard rules enforcing financial services security requirements

## Requirements

### Requirement 1: Loan Application Processing

**User Story:** As a financial services developer, I want to process loan applications via a REST API, so that I can demonstrate a realistic financial microservice workflow during lightning talks

#### Acceptance Criteria

1. WHEN THE API_Gateway receives a POST request to /loan-approval with valid applicant data, THE Loan_Approval_System SHALL return a loan decision within 30 seconds
2. THE Loan_Approval_System SHALL accept applicant data including income, Credit_Score, Debt_to_Income_Ratio, and employment years
3. THE Loan_Approval_System SHALL validate that Credit_Score values are between 300 and 850
4. THE Loan_Approval_System SHALL validate that Debt_to_Income_Ratio values are between 0.0 and 1.0
5. THE Loan_Approval_System SHALL validate that income and employment years are non-negative numbers

### Requirement 2: Credit Scoring Algorithm

**User Story:** As a demo presenter, I want a transparent credit scoring algorithm, so that I can explain the decision logic during presentations

#### Acceptance Criteria

1. THE Approval_Engine SHALL calculate a score from 0 to 100 based on four weighted factors
2. THE Approval_Engine SHALL assign 40% weight to Credit_Score (40 points for 750+, 30 for 700+, 20 for 650+, 10 for 600+)
3. THE Approval_Engine SHALL assign 25% weight to income (25 points for $100k+, 20 for $75k+, 15 for $50k+, 10 for $30k+)
4. THE Approval_Engine SHALL assign 25% weight to Debt_to_Income_Ratio (25 points for ≤0.2, 20 for ≤0.3, 10 for ≤0.4, 5 for ≤0.5)
5. THE Approval_Engine SHALL assign 10% weight to employment years (10 points for 5+ years, 7 for 2+ years, 5 for 1+ years)

### Requirement 3: Loan Decision Response

**User Story:** As an API consumer, I want detailed loan decision responses, so that I can understand the approval or denial reasoning

#### Acceptance Criteria

1. THE Loan_Approval_System SHALL return a unique loan identifier in format "LN-YYYYMMDD-{uuid}"
2. THE Loan_Approval_System SHALL return an approval boolean indicating whether the score meets the Approval_Threshold
3. THE Loan_Approval_System SHALL return the calculated numerical score
4. THE Loan_Approval_System SHALL return human-readable reasoning explaining the decision
5. THE Loan_Approval_System SHALL return an ISO 8601 timestamp of the decision
6. WHEN the calculated score is 70 or above, THE Approval_Engine SHALL approve the loan
7. WHEN the calculated score is below 70, THE Approval_Engine SHALL deny the loan

### Requirement 4: Audit Trail and Compliance

**User Story:** As a compliance officer, I want all loan decisions logged immutably, so that I can audit decisions for regulatory compliance

#### Acceptance Criteria

1. WHEN THE Approval_Engine makes a loan decision, THE Loan_Approval_System SHALL log the complete request and response to the Audit_Store
2. THE Audit_Store SHALL store the loan identifier, timestamp, request data, response data, and time-to-live value
3. THE Audit_Store SHALL retain audit records for 365 days using DynamoDB TTL
4. THE Audit_Store SHALL use encryption at rest for all stored data
5. THE Audit_Store SHALL enable point-in-time recovery for data protection
6. IF THE Audit_Store is unavailable, THEN THE Approval_Engine SHALL continue processing and log the failure without blocking the response

### Requirement 5: Infrastructure Security

**User Story:** As a security engineer, I want the infrastructure to follow financial services security best practices, so that the demo represents production-grade security

#### Acceptance Criteria

1. THE Loan_Approval_System SHALL encrypt Lambda environment variables using AWS managed keys
2. THE Loan_Approval_System SHALL encrypt the Audit_Store at rest using AWS managed encryption
3. THE Loan_Approval_System SHALL configure CloudWatch log retention for Lambda execution logs
4. THE Loan_Approval_System SHALL enable API Gateway request logging at INFO level
5. THE Loan_Approval_System SHALL enable API Gateway metrics and data tracing
6. THE Loan_Approval_System SHALL grant Lambda only write permissions to the Audit_Store following least privilege principles

### Requirement 6: Policy-as-Code Validation

**User Story:** As a DevOps engineer, I want automated compliance validation using CFN Guard, so that I can demonstrate policy-as-code in the financial services domain

#### Acceptance Criteria

1. THE Loan_Approval_System SHALL include Compliance_Rules that validate Lambda encryption requirements
2. THE Loan_Approval_System SHALL include Compliance_Rules that validate DynamoDB encryption and backup configuration
3. THE Loan_Approval_System SHALL include Compliance_Rules that validate API Gateway logging and throttling
4. THE Loan_Approval_System SHALL include Compliance_Rules that validate IAM least privilege policies
5. THE Loan_Approval_System SHALL include Compliance_Rules that detect hardcoded secrets
6. WHEN infrastructure is deployed, THE Loan_Approval_System SHALL validate the CloudFormation template against all Compliance_Rules
7. IF any Compliance_Rules fail validation, THEN THE Loan_Approval_System SHALL prevent deployment and report violations

### Requirement 7: API Request Validation

**User Story:** As an API developer, I want request validation at the API Gateway level, so that invalid requests are rejected before reaching the Lambda function

#### Acceptance Criteria

1. THE API_Gateway SHALL validate that all required fields (income, credit_score, debt_to_income, employment_years) are present
2. THE API_Gateway SHALL validate that income is a number with minimum value of 0
3. THE API_Gateway SHALL validate that credit_score is an integer between 300 and 850
4. THE API_Gateway SHALL validate that debt_to_income is a number between 0 and 1
5. THE API_Gateway SHALL validate that employment_years is an integer with minimum value of 0
6. WHEN validation fails, THE API_Gateway SHALL return a 400 status code with error details

### Requirement 8: Error Handling

**User Story:** As a system operator, I want graceful error handling, so that the system provides meaningful feedback when failures occur

#### Acceptance Criteria

1. WHEN THE Approval_Engine encounters an exception during processing, THE Loan_Approval_System SHALL return a 400 status code
2. WHEN THE Approval_Engine encounters an exception, THE Loan_Approval_System SHALL return a JSON response containing the error message
3. WHEN THE Audit_Store logging fails, THE Approval_Engine SHALL log the failure to CloudWatch and continue processing
4. THE Loan_Approval_System SHALL return appropriate HTTP status codes (200 for success, 400 for client errors)
5. THE Loan_Approval_System SHALL include CORS headers to support browser-based testing

### Requirement 9: Demo and Testing Support

**User Story:** As a demo presenter, I want pre-configured test scenarios and scripts, so that I can quickly demonstrate the system during lightning talks

#### Acceptance Criteria

1. THE Loan_Approval_System SHALL include test data for high-quality applicants (expected approval with score 90+)
2. THE Loan_Approval_System SHALL include test data for marginal applicants (expected approval with score 70-84)
3. THE Loan_Approval_System SHALL include test data for poor credit applicants (expected denial with score <70)
4. THE Loan_Approval_System SHALL include automated test scripts that exercise all test scenarios
5. THE Loan_Approval_System SHALL include a deployment script that validates compliance before deployment
6. THE Loan_Approval_System SHALL provide clear output URLs and endpoints after deployment for immediate testing

### Requirement 10: Infrastructure as Code

**User Story:** As a cloud architect, I want the entire infrastructure defined in CDK TypeScript, so that the system is reproducible and maintainable

#### Acceptance Criteria

1. THE Loan_Approval_System SHALL define all infrastructure using AWS CDK with TypeScript
2. THE Loan_Approval_System SHALL create the API_Gateway with regional endpoint configuration
3. THE Loan_Approval_System SHALL create the Approval_Engine with Python 3.9 runtime and 256MB memory
4. THE Loan_Approval_System SHALL create the Audit_Store with on-demand billing mode
5. THE Loan_Approval_System SHALL output the API URL, endpoint, and audit table name after deployment
6. THE Loan_Approval_System SHALL support single-command deployment and destruction

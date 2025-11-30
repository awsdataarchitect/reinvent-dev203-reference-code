# Implementation Plan

- [ ] 1. Set up CDK project structure and configuration
  - Create CDK TypeScript project with package.json defining dependencies (aws-cdk-lib, constructs)
  - Create CDK app entry point at bin/loan-approval.ts that instantiates the stack
  - Configure TypeScript compiler options for CDK compatibility
  - Add npm scripts for build, deploy, and destroy operations
  - _Requirements: 10.1, 10.2, 10.6_

- [ ] 2. Implement DynamoDB audit table infrastructure
  - Create DynamoDB table with composite key (loan_id as partition key, timestamp as sort key)
  - Configure on-demand billing mode for cost-effective demo usage
  - Enable AWS managed encryption at rest for data protection
  - Enable point-in-time recovery for data durability
  - Configure TTL attribute for automatic 365-day retention
  - Set removal policy to DESTROY for easy cleanup after demos
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.2, 10.4_

- [ ] 3. Implement Lambda function for loan approval logic
  - [ ] 3.1 Create Python Lambda handler function
    - Write lambda_handler function that parses API Gateway event body
    - Extract applicant data fields (income, credit_score, debt_to_income, employment_years)
    - Generate unique loan ID in format "LN-YYYYMMDD-{uuid}"
    - Structure response with loan_id, approved, score, reasoning, and timestamp
    - Return proper HTTP response with 200 status and CORS headers
    - Implement exception handling that returns 400 status with error message
    - _Requirements: 1.1, 1.2, 3.1, 3.5, 8.1, 8.2, 8.4, 8.5_

  - [ ] 3.2 Implement credit scoring algorithm
    - Write calculate_credit_score function with four weighted factors
    - Implement credit score evaluation (40% weight: 40pts for 750+, 30pts for 700+, 20pts for 650+, 10pts for 600+)
    - Implement income evaluation (25% weight: 25pts for $100k+, 20pts for $75k+, 15pts for $50k+, 10pts for $30k+)
    - Implement debt-to-income evaluation (25% weight: 25pts for ≤0.2, 20pts for ≤0.3, 10pts for ≤0.4, 5pts for ≤0.5)
    - Implement employment stability evaluation (10% weight: 10pts for 5+yrs, 7pts for 2+yrs, 5pts for 1+yrs)
    - Cap total score at 100 and return calculated value
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.3 Implement decision logic and reasoning
    - Apply approval threshold of 70 to determine approval boolean
    - Write get_reasoning function that returns explanations based on score ranges
    - Return "Excellent credit profile..." for scores 90+
    - Return "Strong credit score..." for scores 80-89
    - Return "Meets minimum requirements..." for scores 70-79
    - Return "High risk..." for scores below 50
    - Return "Does not meet minimum..." for scores 50-69
    - _Requirements: 3.2, 3.4, 3.6, 3.7_

  - [ ] 3.4 Implement audit logging to DynamoDB
    - Write log_decision function that retrieves table name from environment variable
    - Create DynamoDB item with loan_id, timestamp, request_data, response_data, and ttl
    - Calculate TTL as current timestamp plus 365 days in seconds
    - Implement try-catch to handle audit failures gracefully without blocking response
    - Log audit failures to CloudWatch for monitoring
    - _Requirements: 4.1, 4.2, 4.6, 8.3_

- [ ] 4. Create CDK infrastructure stack for Lambda and API Gateway
  - [ ] 4.1 Configure Lambda function resource in CDK
    - Define Lambda function with Python 3.9 runtime and 256MB memory
    - Set handler to loan_approval.lambda_handler
    - Configure 30-second timeout
    - Set code source to lambda directory
    - Pass AUDIT_TABLE_NAME as environment variable
    - Enable AWS managed key encryption for environment variables
    - Configure CloudWatch log retention to 7 days
    - Add descriptive metadata for the function
    - _Requirements: 1.1, 5.1, 5.3, 10.3_

  - [ ] 4.2 Grant Lambda IAM permissions
    - Grant Lambda function write-only access to DynamoDB audit table using grantWriteData
    - Verify IAM role follows least privilege (only PutItem permission)
    - Ensure no wildcard permissions are granted
    - _Requirements: 5.6_

  - [ ] 4.3 Create API Gateway REST API
    - Create REST API with descriptive name and description
    - Configure regional endpoint type for low latency
    - Set deployment stage to 'prod'
    - Enable CloudWatch role for API Gateway logging
    - Configure INFO level logging for all requests
    - Enable data tracing and metrics collection
    - _Requirements: 5.4, 5.5, 10.2_

  - [ ] 4.4 Configure API Gateway request validation
    - Create request validator that validates request body
    - Define JSON schema model with required fields (income, credit_score, debt_to_income, employment_years)
    - Set income as number type with minimum 0
    - Set credit_score as integer type with minimum 300 and maximum 850
    - Set debt_to_income as number type with minimum 0 and maximum 1
    - Set employment_years as integer type with minimum 0
    - Attach validator and model to POST method
    - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 4.5 Create API Gateway resource and method
    - Add /loan-approval resource to API root
    - Create POST method with Lambda integration
    - Configure Lambda proxy integration for request/response mapping
    - Attach request validator and model to method
    - _Requirements: 1.1_

  - [ ] 4.6 Configure CORS for API Gateway
    - Add CORS preflight configuration to /loan-approval resource
    - Allow all origins (*) for demo purposes
    - Allow POST and OPTIONS methods
    - Allow Content-Type, X-Amz-Date, Authorization, and X-Api-Key headers
    - _Requirements: 8.5_

  - [ ] 4.7 Add CDK stack outputs
    - Output API base URL
    - Output complete API endpoint URL (base URL + /loan-approval)
    - Output DynamoDB audit table name
    - Add descriptions to all outputs for clarity
    - _Requirements: 9.6, 10.5_

- [ ] 5. Create CFN Guard compliance rules
  - [ ] 5.1 Implement Lambda security rules
    - Write rule to validate Lambda environment variable encryption (KmsKeyArn exists)
    - Write rule to validate Lambda logging configuration exists
    - Write rule to validate Lambda timeout is between 3 and 300 seconds
    - _Requirements: 6.1_

  - [ ] 5.2 Implement DynamoDB security rules
    - Write rule to validate DynamoDB encryption at rest (SSESpecification.SSEEnabled == true)
    - Write rule to validate point-in-time recovery is enabled
    - Write rule to validate backup policy or PITR is configured
    - _Requirements: 6.2_

  - [ ] 5.3 Implement API Gateway security rules
    - Write rule to validate API Gateway logging is enabled (AccessLogSetting or MethodSettings exists)
    - Write rule to validate throttling configuration exists
    - Write rule to validate request validation is configured (RequestValidatorId or RequestModels exists)
    - _Requirements: 6.3_

  - [ ] 5.4 Implement IAM security rules
    - Write rule to validate IAM policies follow least privilege
    - Write rule to prevent wildcard actions on wildcard resources
    - Write rule to prevent inline policies with admin access
    - _Requirements: 6.4_

  - [ ] 5.5 Implement general security rules
    - Write rule to validate CloudWatch log retention is set (7-365 days)
    - Write rule to detect hardcoded secrets using regex pattern
    - Write rule to encourage resource tagging for governance
    - Add comments explaining each rule's purpose
    - _Requirements: 6.5_

- [ ] 6. Create compliance validation script
  - Write bash script that checks for cfn-guard installation
  - Add step to build CDK TypeScript code
  - Add step to synthesize CloudFormation template using cdk synth
  - Add step to run cfn-guard validate against synthesized template
  - Configure output format as JSON for compliance report
  - Add conditional logic to check validation results and exit with appropriate code
  - Display compliance summary with checkmarks for passed rules
  - _Requirements: 6.6, 6.7_

- [ ] 7. Create deployment automation script
  - Write bash script that installs npm dependencies
  - Add step to run compliance validation script
  - Add step to bootstrap CDK if needed
  - Add step to deploy CDK stack with --require-approval never flag
  - Display deployment summary with service information
  - Output API endpoint URL and testing instructions
  - Add cleanup instructions
  - _Requirements: 9.5, 9.6_

- [ ] 8. Create API testing script and test data
  - [ ] 8.1 Create automated API test script
    - Write bash script that retrieves API URL from CDK outputs
    - Add test case for high-quality applicant (income=$100k, credit=780, DTI=0.2, employment=5yrs)
    - Add test case for marginal applicant (income=$50k, credit=680, DTI=0.4, employment=2yrs)
    - Add test case for poor credit applicant (income=$30k, credit=580, DTI=0.6, employment=0yrs)
    - Add test case for invalid request with malformed data
    - Format output using jq for readability
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 8.2 Create test data file with demo scenarios
    - Create JSON file with high-quality applicant test data and expected results
    - Add good applicant test data with expected score range 75-89
    - Add marginal applicant test data with expected score range 70-74
    - Add borderline applicant test data with expected denial
    - Add poor credit applicant test data with expected denial
    - Add lightning talk demo scenario with clear approval case
    - Add edge case demo scenario at approval threshold
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Create comprehensive documentation
  - [ ] 9.1 Write README with project overview
    - Add project description highlighting AI-driven development and policy-as-code
    - Include architecture diagram showing API Gateway → Lambda → DynamoDB flow
    - Document security and compliance features (encryption, audit trail, CFN Guard)
    - Add prerequisites section (Node.js, AWS CLI, CDK CLI, CFN Guard)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.2 Document deployment and testing procedures
    - Add quick start deployment instructions using deployment script
    - Add manual deployment steps as alternative
    - Document automated testing using test script
    - Add manual curl examples for API testing
    - Include expected request and response formats
    - _Requirements: 9.4, 9.5, 9.6_

  - [ ] 9.3 Document credit scoring algorithm
    - Explain weighted factor system with percentages
    - Document credit score factor thresholds and points
    - Document income factor thresholds and points
    - Document debt-to-income factor thresholds and points
    - Document employment stability factor thresholds and points
    - Specify approval threshold of 70
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 9.4 Create lightning talk demo guide
    - Document 5-minute demo flow with timing
    - Add step to show Python Lambda function and explain algorithm
    - Add step to demonstrate CFN Guard rules and compliance validation
    - Add step to run deployment script and show real-time output
    - Add step to execute live API tests with different scenarios
    - Include test case descriptions (approved, marginal, denied, invalid)
    - Add cleanup instructions
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 9.5 Document project structure
    - List all directories and key files with descriptions
    - Explain purpose of bin/, lib/, lambda/, cfn-guard/, and scripts/ directories
    - Document configuration files (package.json, tsconfig.json, cdk.json)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 9.6 Add key features summary for demo
    - Highlight simplicity and realistic use case
    - Emphasize AI-generated development approach
    - Highlight policy-as-code compliance validation
    - Emphasize security-first design
    - Note production-ready patterns (error handling, logging, monitoring)
    - Highlight fast single-command deployment
    - Note live testing capability during demos
    - _Requirements: 1.1, 2.1, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

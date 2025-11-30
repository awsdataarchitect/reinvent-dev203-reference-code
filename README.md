# Loan Approval Microservice — Reference Code for DEV302

**Transforming FinServ AI DLC with Kiro Agentic IDE**

This repository accompanies the re:Invent DEV302 lightning talk, demonstrating how Kiro Agentic IDE, Agent Steering, Agent Hooks, MCP Servers, and CloudFormation Guard accelerate secure and compliant development in financial services.

The project contains a simple but realistic Loan Approval Service implemented using AWS CDK (TypeScript), AWS Lambda (Python), Amazon API Gateway, and Amazon DynamoDB. The codebase intentionally includes components used during the talk to illustrate technical debt, policy enforcement, and automation via agents.

## 📌 What This Repo Demonstrates

**✔️ Kiro Spec-Driven Workflow**

How a developer can bootstrap, improve, and maintain a FinServ workload using:
- Agent Steering for global compliance guidance
- Agent Hooks for automated policy checks
- MCP Servers for diagrams and other tools
- Kiro CLI custom agents for compliance automation
- Open VSX extensions to enhance the developer experience

**✔️ Before-and-After Development Improvements**

The microservice showcases the same gaps highlighted in the session:
- Outdated Lambda runtime → upgraded via steering
- Outdated CDK version → modernized with IDE assistance
- Missing or weak compliance checks → enforced via Agent Hooks
- Manual CFN Guard workflows → automated inside IDE and CLI

## 🏗️ Architecture (As shown in the talk)

```
API Gateway → Lambda (Python) → DynamoDB (Audit Trail)
```

The repository also includes the architecture diagram auto-generated with the Diagrams MCP Server.

## 🔒 Security & Compliance (FinServ-Ready)

This project is aligned with the Agent Steering rules discussed in the session:
- Least-privilege IAM artifacts
- No hardcoded secrets
- Encrypted Lambda environment variables
- Encrypted DynamoDB table with PITR
- Structured audit-log table
- API Gateway access logging & throttling
- CFN Guard rules included (`/cfn-guard/financial-compliance.guard`)
- Kiro-driven compliance validation via Agent Hooks

## 🚀 Deployment Workflow (Agentic + Policy-as-Code)

**1. Install Dependencies**
```bash
npm install
```

**2. Validate Compliance (Manual or Automated)**

You can run CFN Guard manually:
```bash
./scripts/validate-compliance.sh
```

Or rely on Kiro Agent Hooks, which automatically run this validation on synth/deploy inside the IDE.

**3. Deploy the Stack**
```bash
./scripts/deploy.sh
```

This deploys:
- API Gateway REST endpoint
- Python 3.13 Lambda function
- Audit DynamoDB table
- IAM roles with least-privilege

## 🧪 Testing the API

**Automated Smoke Test**
```bash
./scripts/test-api.sh
```

**Manual Test**
```bash
curl -X POST [API_URL]/loan-approval \
  -H 'Content-Type: application/json' \
  -d '{
    "income": 85000,
    "credit_score": 740,
    "debt_to_income": 0.28,
    "employment_years": 3
  }'
```

## 🛡️ CFN Guard Rules (Financial Compliance)

The repo includes sample FinServ-aligned rules used to demonstrate:
- Catching missing encryption
- Enforcing mandatory tags
- Blocking public resources
- Guarding IAM expansions
- Validating API Gateway logging and throttling

Rules are located here: `/cfn-guard/financial-compliance.guard`

## 🗂️ Project Structure

```
loan-approval-service/
├── bin/loan-approval.ts          # CDK app entry
├── lib/loan-approval-stack.ts    # Main infra stack
├── lambda/loan_approval.py       # Business logic
├── cfn-guard/                    # Guard rules
├── scripts/                      # Deploy, test & compliance scripts
├── generated-diagrams/           # Output from Diagrams MCP server
└── README.md                     # This file
```

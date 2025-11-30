# Design Document

## Overview

This design addresses compliance issues in the loan-approval-service by updating dependencies to their latest stable versions, removing unused code, and upgrading the Python runtime. The changes ensure adherence to the tech-debt-proof steering rules while maintaining full backward compatibility and functionality.

## Architecture

The changes are isolated to configuration files and do not affect the overall system architecture:

```
Configuration Layer (Updated)
├── package.json (dependency versions)
├── package-lock.json (locked versions)
└── lib/loan-approval-stack.ts (Lambda runtime, unused imports)

Application Layer (Unchanged)
├── Lambda function logic
├── API Gateway configuration
└── DynamoDB configuration
```

## Components and Interfaces

### 1. Dependency Management

**Current State:**
- AWS CDK: 2.100.0 (outdated)
- TypeScript: 4.9.5 (outdated)
- Jest: 29.5.0 (slightly outdated)
- Python Runtime: 3.9 (approaching end of support)

**Target State:**
- AWS CDK: 2.170.0 (latest stable as of Nov 2024)
- TypeScript: 5.7.2 (latest stable)
- Jest: 29.7.0 (latest stable)
- Python Runtime: 3.13 (latest stable)

**Update Strategy:**
1. Update package.json with new versions
2. Run `npm install` to regenerate package-lock.json
3. Run `npm run build` to verify TypeScript compilation
4. Run `npx cdk synth` to verify CDK synthesis

### 2. Code Quality Improvements

**Issue:** Unused import in `lib/loan-approval-stack.ts`
```typescript
import * as iam from 'aws-cdk-lib/aws-iam';  // Unused
```

**Solution:** Remove the unused import statement

**Impact:** None - the import is not used anywhere in the code

### 3. Lambda Runtime Upgrade

**Current:** Python 3.9
**Target:** Python 3.13

**Change Location:** `lib/loan-approval-stack.ts`
```typescript
// Before
runtime: lambda.Runtime.PYTHON_3_9

// After
runtime: lambda.Runtime.PYTHON_3_13
```

**Compatibility Analysis:**
- The Lambda function uses standard library modules (json, boto3, uuid, os, datetime, typing, decimal)
- All used features are compatible with Python 3.13
- No breaking changes affect the existing code
- boto3 is provided by AWS Lambda runtime and supports Python 3.13

## Data Models

No changes to data models. All existing interfaces remain unchanged:
- API Gateway request/response schemas
- DynamoDB table structure
- Lambda event/response formats

## Error Handling

No changes to error handling logic. All existing error handling remains in place:
- Lambda try-catch blocks
- API Gateway validation
- DynamoDB error handling

## Testing Strategy

### Pre-Deployment Validation

1. **TypeScript Compilation**
   ```bash
   npm run build
   ```
   Expected: Clean compilation with no errors or warnings

2. **CDK Synthesis**
   ```bash
   npx cdk synth
   ```
   Expected: Valid CloudFormation template generation

3. **CFN Guard Validation**
   ```bash
   npx cdk synth --json > cfn-template.json
   cfn-guard validate --data cfn-template.json --rules cfn-guard/financial-compliance.guard
   ```
   Expected: All compliance rules pass

### Post-Deployment Validation

1. **Functional Testing**
   - Deploy the updated stack
   - Run existing test scripts
   - Verify API responses match expected format
   - Confirm DynamoDB audit logging works

2. **Regression Testing**
   - Test all sample requests from test-data/
   - Verify credit scoring algorithm produces same results
   - Confirm error handling works correctly

## Implementation Notes

### Dependency Update Order

1. Update TypeScript first (may affect CDK compilation)
2. Update AWS CDK packages (cdk-lib and aws-cdk)
3. Update Jest and testing dependencies
4. Update type definitions to match

### Rollback Plan

If issues arise:
1. Revert package.json to previous versions
2. Run `npm install` to restore package-lock.json
3. Rebuild and redeploy

### Breaking Change Considerations

**AWS CDK 2.100.0 → 2.170.0:**
- CDK v2 maintains backward compatibility within major version
- No breaking changes expected for constructs used (Lambda, API Gateway, DynamoDB)
- Feature flags in cdk.json ensure consistent behavior

**TypeScript 4.9.5 → 5.7.2:**
- TypeScript 5.x maintains backward compatibility for most code
- Stricter type checking may reveal hidden issues (beneficial)
- No breaking changes expected for CDK TypeScript code

**Python 3.9 → 3.13:**
- Python maintains backward compatibility for standard library
- boto3 SDK is runtime-provided and compatible
- No deprecated features used in current code

## Security Considerations

### Dependency Updates
- Latest versions include security patches
- Reduces exposure to known vulnerabilities
- Aligns with tech-debt-proof steering rule

### Runtime Updates
- Python 3.13 includes security improvements
- Python 3.9 approaches end of standard support (Oct 2025)
- Proactive upgrade reduces future technical debt

## Compliance Validation

All changes align with steering rules:

✅ **Use latest stable versions** (tech-debt-proof.md)
✅ **Keep dependencies updated** (tech-debt-proof.md)
✅ **Remove unused dependencies/imports** (tech-debt-proof.md)
✅ **Maintain clean directory structures** (tech-debt-proof.md)
✅ **Use lock files** (tech-debt-proof.md)

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class LoanApprovalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for audit trail
    const auditTable = new dynamodb.Table(this, 'LoanAuditTable', {
      tableName: 'loan-approval-audit',
      partitionKey: { name: 'loan_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl'
    });

    // Lambda function
    const loanApprovalFunction = new lambda.Function(this, 'LoanApprovalFunction', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'loan_approval.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        AUDIT_TABLE_NAME: auditTable.tableName
      },
      // Environment encryption handled by AWS managed keys by default
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'Loan approval microservice for financial services demo'
    });

    // Grant Lambda permissions to write to DynamoDB
    auditTable.grantWriteData(loanApprovalFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'LoanApprovalApi', {
      restApiName: 'Loan Approval Service',
      description: 'Simple loan approval microservice API',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true
      },
      cloudWatchRole: true,
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL]
      }
    });

    // Lambda integration
    const loanApprovalIntegration = new apigateway.LambdaIntegration(loanApprovalFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    // API Gateway resource and method
    const loanResource = api.root.addResource('loan-approval');
    loanResource.addMethod('POST', loanApprovalIntegration, {
      requestValidator: new apigateway.RequestValidator(this, 'RequestValidator', {
        restApi: api,
        validateRequestBody: true,
        validateRequestParameters: false
      }),
      requestModels: {
        'application/json': new apigateway.Model(this, 'LoanRequestModel', {
          restApi: api,
          contentType: 'application/json',
          schema: {
            type: apigateway.JsonSchemaType.OBJECT,
            properties: {
              income: { type: apigateway.JsonSchemaType.NUMBER, minimum: 0 },
              credit_score: { type: apigateway.JsonSchemaType.INTEGER, minimum: 300, maximum: 850 },
              debt_to_income: { type: apigateway.JsonSchemaType.NUMBER, minimum: 0, maximum: 1 },
              employment_years: { type: apigateway.JsonSchemaType.INTEGER, minimum: 0 }
            },
            required: ['income', 'credit_score', 'debt_to_income', 'employment_years']
          }
        })
      }
    });

    // CORS for the resource
    loanResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Loan Approval API URL'
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: `${api.url}loan-approval`,
      description: 'Loan Approval Endpoint'
    });

    new cdk.CfnOutput(this, 'AuditTableName', {
      value: auditTable.tableName,
      description: 'DynamoDB Audit Table Name'
    });
  }
}

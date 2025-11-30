"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanApprovalStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const logs = require("aws-cdk-lib/aws-logs");
class LoanApprovalStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.LoanApprovalStack = LoanApprovalStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hbi1hcHByb3ZhbC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvYW4tYXBwcm92YWwtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQscURBQXFEO0FBQ3JELDZDQUE2QztBQUc3QyxNQUFhLGlCQUFrQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsaUNBQWlDO1FBQ2pDLE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDNUQsU0FBUyxFQUFFLHFCQUFxQjtZQUNoQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN0RSxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNuRSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELFVBQVUsRUFBRSxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVc7WUFDaEQsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLG1CQUFtQixFQUFFLEtBQUs7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCO1FBQ2xCLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM3RSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8s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QUM7UUFFSCx3QkFBd0I7UUFDeEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDO1lBQzVCLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNuQixZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDO1lBQ2pDLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQztTQUMzRSxDQUFDLENBQUM7UUFFSCxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHO1lBQ2QsV0FBVyxFQUFFLHVCQUF1QjtTQUNyQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxlQUFlO1lBQ2hDLFdBQVcsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDM0IsV0FBVyxFQUFFLDJCQUEyQjtTQUN6QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF4R0QsOENBd0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBjbGFzcyBMb2FuQXBwcm92YWxTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIER5bmFtb0RCIHRhYmxlIGZvciBhdWRpdCB0cmFpbFxuICAgIGNvbnN0IGF1ZGl0VGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0xvYW5BdWRpdFRhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiAnbG9hbi1hcHByb3ZhbC1hdWRpdCcsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2xvYW5faWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc29ydEtleTogeyBuYW1lOiAndGltZXN0YW1wJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICBlbmNyeXB0aW9uOiBkeW5hbW9kYi5UYWJsZUVuY3J5cHRpb24uQVdTX01BTkFHRUQsXG4gICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIHRpbWVUb0xpdmVBdHRyaWJ1dGU6ICd0dGwnXG4gICAgfSk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb25cbiAgICBjb25zdCBsb2FuQXBwcm92YWxGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0xvYW5BcHByb3ZhbEZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTMsXG4gICAgICBoYW5kbGVyOiAnbG9hbl9hcHByb3ZhbC5sYW1iZGFfaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVVESVRfVEFCTEVfTkFNRTogYXVkaXRUYWJsZS50YWJsZU5hbWVcbiAgICAgIH0sXG4gICAgICAvLyBFbnZpcm9ubWVudCBlbmNyeXB0aW9uIGhhbmRsZWQgYnkgQVdTIG1hbmFnZWQga2V5cyBieSBkZWZhdWx0XG4gICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTG9hbiBhcHByb3ZhbCBtaWNyb3NlcnZpY2UgZm9yIGZpbmFuY2lhbCBzZXJ2aWNlcyBkZW1vJ1xuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgTGFtYmRhIHBlcm1pc3Npb25zIHRvIHdyaXRlIHRvIER5bmFtb0RCXG4gICAgYXVkaXRUYWJsZS5ncmFudFdyaXRlRGF0YShsb2FuQXBwcm92YWxGdW5jdGlvbik7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0xvYW5BcHByb3ZhbEFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnTG9hbiBBcHByb3ZhbCBTZXJ2aWNlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2ltcGxlIGxvYW4gYXBwcm92YWwgbWljcm9zZXJ2aWNlIEFQSScsXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3Byb2QnLFxuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgIGRhdGFUcmFjZUVuYWJsZWQ6IHRydWUsXG4gICAgICAgIG1ldHJpY3NFbmFibGVkOiB0cnVlXG4gICAgICB9LFxuICAgICAgY2xvdWRXYXRjaFJvbGU6IHRydWUsXG4gICAgICBlbmRwb2ludENvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgdHlwZXM6IFthcGlnYXRld2F5LkVuZHBvaW50VHlwZS5SRUdJT05BTF1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSBpbnRlZ3JhdGlvblxuICAgIGNvbnN0IGxvYW5BcHByb3ZhbEludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24obG9hbkFwcHJvdmFsRnVuY3Rpb24sIHtcbiAgICAgIHJlcXVlc3RUZW1wbGF0ZXM6IHsgJ2FwcGxpY2F0aW9uL2pzb24nOiAneyBcInN0YXR1c0NvZGVcIjogXCIyMDBcIiB9JyB9XG4gICAgfSk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheSByZXNvdXJjZSBhbmQgbWV0aG9kXG4gICAgY29uc3QgbG9hblJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2xvYW4tYXBwcm92YWwnKTtcbiAgICBsb2FuUmVzb3VyY2UuYWRkTWV0aG9kKCdQT1NUJywgbG9hbkFwcHJvdmFsSW50ZWdyYXRpb24sIHtcbiAgICAgIHJlcXVlc3RWYWxpZGF0b3I6IG5ldyBhcGlnYXRld2F5LlJlcXVlc3RWYWxpZGF0b3IodGhpcywgJ1JlcXVlc3RWYWxpZGF0b3InLCB7XG4gICAgICAgIHJlc3RBcGk6IGFwaSxcbiAgICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keTogdHJ1ZSxcbiAgICAgICAgdmFsaWRhdGVSZXF1ZXN0UGFyYW1ldGVyczogZmFsc2VcbiAgICAgIH0pLFxuICAgICAgcmVxdWVzdE1vZGVsczoge1xuICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IG5ldyBhcGlnYXRld2F5Lk1vZGVsKHRoaXMsICdMb2FuUmVxdWVzdE1vZGVsJywge1xuICAgICAgICAgIHJlc3RBcGk6IGFwaSxcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIHNjaGVtYToge1xuICAgICAgICAgICAgdHlwZTogYXBpZ2F0ZXdheS5Kc29uU2NoZW1hVHlwZS5PQkpFQ1QsXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIGluY29tZTogeyB0eXBlOiBhcGlnYXRld2F5Lkpzb25TY2hlbWFUeXBlLk5VTUJFUiwgbWluaW11bTogMCB9LFxuICAgICAgICAgICAgICBjcmVkaXRfc2NvcmU6IHsgdHlwZTogYXBpZ2F0ZXdheS5Kc29uU2NoZW1hVHlwZS5JTlRFR0VSLCBtaW5pbXVtOiAzMDAsIG1heGltdW06IDg1MCB9LFxuICAgICAgICAgICAgICBkZWJ0X3RvX2luY29tZTogeyB0eXBlOiBhcGlnYXRld2F5Lkpzb25TY2hlbWFUeXBlLk5VTUJFUiwgbWluaW11bTogMCwgbWF4aW11bTogMSB9LFxuICAgICAgICAgICAgICBlbXBsb3ltZW50X3llYXJzOiB7IHR5cGU6IGFwaWdhdGV3YXkuSnNvblNjaGVtYVR5cGUuSU5URUdFUiwgbWluaW11bTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVxdWlyZWQ6IFsnaW5jb21lJywgJ2NyZWRpdF9zY29yZScsICdkZWJ0X3RvX2luY29tZScsICdlbXBsb3ltZW50X3llYXJzJ11cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDT1JTIGZvciB0aGUgcmVzb3VyY2VcbiAgICBsb2FuUmVzb3VyY2UuYWRkQ29yc1ByZWZsaWdodCh7XG4gICAgICBhbGxvd09yaWdpbnM6IFsnKiddLFxuICAgICAgYWxsb3dNZXRob2RzOiBbJ1BPU1QnLCAnT1BUSU9OUyddLFxuICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdYLUFtei1EYXRlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1BcGktS2V5J11cbiAgICB9KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpVXJsJywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0xvYW4gQXBwcm92YWwgQVBJIFVSTCdcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlFbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiBgJHthcGkudXJsfWxvYW4tYXBwcm92YWxgLFxuICAgICAgZGVzY3JpcHRpb246ICdMb2FuIEFwcHJvdmFsIEVuZHBvaW50J1xuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0F1ZGl0VGFibGVOYW1lJywge1xuICAgICAgdmFsdWU6IGF1ZGl0VGFibGUudGFibGVOYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdEeW5hbW9EQiBBdWRpdCBUYWJsZSBOYW1lJ1xuICAgIH0pO1xuICB9XG59XG4iXX0=
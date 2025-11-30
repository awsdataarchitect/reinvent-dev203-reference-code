import json
import boto3
import uuid
import os
from datetime import datetime
from typing import Dict, Any
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    Simple loan approval microservice
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract applicant data
        income = body.get('income', 0)
        credit_score = body.get('credit_score', 0)
        debt_to_income = body.get('debt_to_income', 0)
        employment_years = body.get('employment_years', 0)
        
        # Simple credit scoring algorithm
        score = calculate_credit_score(income, credit_score, debt_to_income, employment_years)
        approved = score >= 70
        
        # Generate loan ID
        loan_id = f"LN-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        
        # Create response
        response_data = {
            'loan_id': loan_id,
            'approved': approved,
            'score': score,
            'reasoning': get_reasoning(score, approved),
            'timestamp': datetime.now().isoformat()
        }
        
        # Log to DynamoDB for audit trail
        log_decision(loan_id, body, response_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }

def calculate_credit_score(income: float, credit_score: int, debt_to_income: float, employment_years: int) -> int:
    """Calculate loan approval score based on applicant data"""
    score = 0
    
    # Credit score weight (40%)
    if credit_score >= 750:
        score += 40
    elif credit_score >= 700:
        score += 30
    elif credit_score >= 650:
        score += 20
    elif credit_score >= 600:
        score += 10
    
    # Income weight (25%)
    if income >= 100000:
        score += 25
    elif income >= 75000:
        score += 20
    elif income >= 50000:
        score += 15
    elif income >= 30000:
        score += 10
    
    # Debt-to-income ratio weight (25%)
    if debt_to_income <= 0.2:
        score += 25
    elif debt_to_income <= 0.3:
        score += 20
    elif debt_to_income <= 0.4:
        score += 10
    elif debt_to_income <= 0.5:
        score += 5
    
    # Employment stability weight (10%)
    if employment_years >= 5:
        score += 10
    elif employment_years >= 2:
        score += 7
    elif employment_years >= 1:
        score += 5
    
    return min(score, 100)

def get_reasoning(score: int, approved: bool) -> str:
    """Generate human-readable reasoning for the decision"""
    if approved:
        if score >= 90:
            return "Excellent credit profile with strong income and low debt"
        elif score >= 80:
            return "Strong credit score and stable financial position"
        else:
            return "Meets minimum requirements for loan approval"
    else:
        if score < 50:
            return "High risk due to low credit score or high debt-to-income ratio"
        else:
            return "Does not meet minimum credit requirements"

def convert_floats_to_decimal(obj):
    """Convert float values to Decimal for DynamoDB compatibility"""
    if isinstance(obj, dict):
        return {k: convert_floats_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimal(v) for v in obj]
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj

def log_decision(loan_id: str, request_data: Dict, response_data: Dict):
    """Log loan decision to DynamoDB for audit trail"""
    try:
        table_name = os.environ.get('AUDIT_TABLE_NAME')
        if not table_name:
            return
            
        table = dynamodb.Table(table_name)
        
        # Convert floats to Decimals for DynamoDB
        safe_request_data = convert_floats_to_decimal(request_data)
        safe_response_data = convert_floats_to_decimal(response_data)
        
        table.put_item(
            Item={
                'loan_id': loan_id,
                'timestamp': datetime.now().isoformat(),
                'request_data': safe_request_data,
                'response_data': safe_response_data,
                'ttl': int((datetime.now().timestamp() + 86400 * 365))  # 1 year retention
            }
        )
    except Exception as e:
        print(f"Failed to log decision: {e}")

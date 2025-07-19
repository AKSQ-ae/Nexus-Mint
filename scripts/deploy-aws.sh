#!/bin/bash

# AWS Deployment Script for Nexus Mint
# Usage: ./scripts/deploy-aws.sh [environment] [stack-name]

set -e

# Configuration
ENVIRONMENT=${1:-prod}
STACK_NAME=${2:-nexus-mint-$ENVIRONMENT}
TEMPLATE_FILE="aws/cloudformation-template.yml"
REGION=${AWS_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Nexus Mint to AWS${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Stack Name: ${YELLOW}$STACK_NAME${NC}"
echo -e "Region: ${YELLOW}$REGION${NC}"

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI is required but not installed.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }

# Validate Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

# Build the application
echo -e "\n${YELLOW}Building application...${NC}"
npm ci --prefer-offline --no-audit
npm run build:prod

# Check build output
if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed: dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful! Size: $(du -sh dist/)${NC}"

# Create/Update CloudFormation stack
echo -e "\n${YELLOW}Deploying CloudFormation stack...${NC}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION >/dev/null 2>&1; then
    # Update existing stack
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    echo -e "${YELLOW}Waiting for stack update to complete...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION
else
    # Create new stack
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
fi

# Get stack outputs
echo -e "\n${YELLOW}Getting stack outputs...${NC}"
OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output json)

S3_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="S3BucketName") | .OutputValue')
CLOUDFRONT_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="CloudFrontDistributionId") | .OutputValue')
WEBSITE_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue')

# Deploy to S3
echo -e "\n${YELLOW}Deploying to S3 bucket: $S3_BUCKET${NC}"

# Sync static assets with cache headers
aws s3 sync dist/ s3://$S3_BUCKET/ \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.json" \
    --exclude "build-info.json"

# Upload HTML and JSON files with no-cache headers
aws s3 cp dist/index.html s3://$S3_BUCKET/ \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

find dist -name "*.json" -exec aws s3 cp {} s3://$S3_BUCKET/{} \
    --cache-control "no-cache" \
    --content-type "application/json" \;

# Create CloudFront invalidation
echo -e "\n${YELLOW}Creating CloudFront invalidation...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}Invalidation created: $INVALIDATION_ID${NC}"

# Summary
echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo -e "Website URL: ${YELLOW}$WEBSITE_URL${NC}"
echo -e "S3 Bucket: ${YELLOW}$S3_BUCKET${NC}"
echo -e "CloudFront Distribution: ${YELLOW}$CLOUDFRONT_ID${NC}"
echo -e "\nNote: CloudFront invalidation may take 5-10 minutes to complete."

# Optional: Open website
if command -v open >/dev/null 2>&1; then
    echo -e "\n${YELLOW}Opening website in browser...${NC}"
    open $WEBSITE_URL
fi
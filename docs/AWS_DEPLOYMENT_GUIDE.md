# AWS Deployment Guide for Nexus Mint

This guide provides step-by-step instructions for deploying Nexus Mint to AWS using CodePipeline, CodeBuild, S3, and CloudFront.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [CloudFormation Deployment](#cloudformation-deployment)
4. [Manual Deployment](#manual-deployment)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Environment Variables](#environment-variables)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18.x installed
- GitHub repository access
- Domain name (optional, for custom domain)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nexus-mint.git
cd nexus-mint
```

### 2. Install Dependencies

```bash
npm install --no-audit --no-fund
```

### 3. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter output format (json)
```

## CloudFormation Deployment

### 1. Using the Deployment Script

The easiest way to deploy is using the provided script:

```bash
./scripts/deploy-aws.sh prod nexus-mint-prod
```

### 2. Manual CloudFormation Deployment

```bash
# Create the stack
aws cloudformation create-stack \
  --stack-name nexus-mint-prod \
  --template-body file://aws/cloudformation-template.yml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=prod \
  --capabilities CAPABILITY_IAM

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name nexus-mint-prod
```

### 3. With Custom Domain

```bash
aws cloudformation create-stack \
  --stack-name nexus-mint-prod \
  --template-body file://aws/cloudformation-template.yml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=prod \
    ParameterKey=DomainName,ParameterValue=app.nexus-mint.com \
    ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:123456789012:certificate/xxx \
  --capabilities CAPABILITY_IAM
```

## Manual Deployment

If you prefer to deploy manually without CloudFormation:

### 1. Create S3 Bucket

```bash
aws s3 mb s3://nexus-mint-prod-123456789012
```

### 2. Build the Application

```bash
npm run build:prod
```

### 3. Deploy to S3

```bash
# Sync build files
aws s3 sync dist/ s3://nexus-mint-prod-123456789012/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://nexus-mint-prod-123456789012/ \
  --cache-control "no-cache, no-store, must-revalidate"
```

### 4. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name nexus-mint-prod-123456789012.s3.amazonaws.com \
  --default-root-object index.html
```

## CI/CD Pipeline Setup

### 1. Create GitHub Secrets in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name nexus-mint/github \
  --secret-string '{
    "owner": "your-github-org",
    "repo": "nexus-mint",
    "token": "ghp_your_github_personal_access_token"
  }'
```

### 2. Create CodeBuild Environment Variables

In the AWS Console, add these environment variables to your CodeBuild project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_POLYGON_RPC_URL`
- `VITE_CONTRACT_ADDRESS`
- `VITE_STRIPE_PUBLISHABLE_KEY` (optional)
- `VITE_11LABS_API_KEY` (optional)
- `VITE_SENTRY_DSN` (optional)

### 3. Configure Webhooks

The CloudFormation template automatically sets up GitHub webhooks. For manual setup:

1. Go to GitHub repository settings
2. Add webhook: `https://codepipeline.us-east-1.amazonaws.com/webhook`
3. Select events: Push, Pull Request

## Environment Variables

### Local Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Production Deployment

Set environment variables in CodeBuild or use AWS Systems Manager Parameter Store:

```bash
aws ssm put-parameter \
  --name /nexus-mint/prod/VITE_SUPABASE_URL \
  --value "https://your-project.supabase.co" \
  --type SecureString
```

## Monitoring & Maintenance

### 1. CloudWatch Metrics

Monitor your application using CloudWatch:

```bash
# View CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### 2. Build Logs

View CodeBuild logs:

```bash
aws logs tail /aws/codebuild/nexus-mint-build-prod --follow
```

### 3. Cost Monitoring

Set up billing alerts:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name nexus-mint-billing-alarm \
  --alarm-description "Alert when Nexus Mint costs exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 100
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Memory Issues:**
```yaml
# In buildspec.yml, increase memory:
NODE_OPTIONS: "--max-old-space-size=8192"
```

**Dependency Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. CloudFront 403/404 Errors

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### 3. CORS Issues

Update S3 bucket CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

### Debug Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name nexus-mint-prod

# View stack events
aws cloudformation describe-stack-events --stack-name nexus-mint-prod

# Test S3 access
aws s3 ls s3://nexus-mint-prod-123456789012/

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

## Security Best Practices

1. **Enable S3 Bucket Versioning** - Already enabled in CloudFormation
2. **Use CloudFront Origin Access Control** - Configured in template
3. **Enable AWS WAF** for DDoS protection
4. **Regular Security Audits** using AWS Security Hub
5. **Encrypt sensitive data** using AWS KMS

## Performance Optimization

1. **Enable CloudFront Compression** - Already configured
2. **Use CloudFront Cache Behaviors** for different content types
3. **Enable HTTP/2 and HTTP/3** - Configured in template
4. **Monitor with AWS X-Ray** for performance insights

## Backup and Disaster Recovery

1. **S3 Cross-Region Replication**:
```bash
aws s3api put-bucket-replication \
  --bucket nexus-mint-prod-123456789012 \
  --replication-configuration file://replication.json
```

2. **Regular Backups**:
```bash
# Backup S3 bucket
aws s3 sync s3://nexus-mint-prod-123456789012/ s3://nexus-mint-backup/
```

3. **Infrastructure as Code**: All infrastructure is defined in CloudFormation

## Cost Optimization

1. **Use S3 Intelligent-Tiering** for infrequently accessed files
2. **CloudFront Price Class**: Set to PriceClass_100 in template
3. **Enable S3 Lifecycle Policies** for old build artifacts
4. **Use Reserved Capacity** for predictable workloads

## Support

For issues or questions:
1. Check CloudWatch Logs
2. Review this documentation
3. Check AWS Service Health Dashboard
4. Contact AWS Support (if you have a support plan)
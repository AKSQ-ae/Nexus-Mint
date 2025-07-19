# Nexus Mint

[![Build Status](https://github.com/AKSQ-ae/Nexus-Mint/workflows/Build%20and%20Test/badge.svg)](https://github.com/AKSQ-ae/Nexus-Mint/actions)
[![Coverage](https://codecov.io/gh/AKSQ-ae/Nexus-Mint/branch/main/graph/badge.svg)](https://codecov.io/gh/AKSQ-ae/Nexus-Mint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/PNPM-8.15.0-orange.svg)](https://pnpm.io/)

> Enterprise-grade real estate tokenization platform with AI-powered investment assistant, built for AWS deployment.

**Repository**: https://github.com/AKSQ-ae/Nexus-Mint

---

## 🏗️ Architecture Overview

Nexus Mint is a modern, enterprise-grade web application built with the following architecture:

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.x with optimized bundling
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Package Manager**: PNPM for fast, efficient dependency management

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Blockchain**: Polygon Network (ERC-1155 tokens)
- **AI Services**: OpenAI GPT-4 integration
- **Payment Processing**: Stripe + MetaMask
- **Deployment**: AWS CodePipeline + CodeBuild + S3/CloudFront

### Security & Compliance
- **KYC/AML**: Integrated compliance workflows
- **Audit Trail**: Complete transaction logging
- **Data Protection**: GDPR-compliant data handling
- **Security**: OWASP Top 10 compliance

---

## 🚀 Key Features

- 🏢 **Real Estate Tokenization**: ERC-1155 tokens on Polygon blockchain
- 🤖 **AI Investment Assistant**: TOKO - your personal investment advisor
- 💳 **Multi-Payment Support**: Stripe + MetaMask integration
- 📊 **Advanced Analytics**: Real-time portfolio tracking
- 🔒 **Regulatory Compliance**: KYC/AML with audit trails
- 📱 **Progressive Web App**: Mobile-first responsive design
- 🚀 **Enterprise Ready**: AWS-native deployment architecture

---

## 🛠️ Prerequisites

### Development Environment
- **Node.js**: 18.20.4 (specified in `.nvmrc`)
- **PNPM**: 8.15.0 (recommended package manager)
- **Git**: Latest version
- **Docker**: Optional, for containerized development

### AWS Infrastructure (for deployment)
- **AWS Account**: With appropriate permissions
- **CodePipeline**: For CI/CD automation
- **CodeBuild**: For build automation
- **S3**: For static asset hosting
- **CloudFront**: For CDN and HTTPS
- **IAM**: Proper roles and policies

### External Services
- **Supabase**: Database and authentication
- **OpenAI**: AI assistant functionality
- **Stripe**: Payment processing
- **Polygon Network**: Blockchain infrastructure

---

## ⚙️ Local Development Setup

### 1. Environment Setup

```bash
# Install Node.js 18.x (if using nvm)
nvm install 18.20.4
nvm use 18.20.4

# Install PNPM globally
npm install -g pnpm@8.15.0

# Clone repository
git clone https://github.com/AKSQ-ae/Nexus-Mint.git
cd Nexus-Mint

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Create `.env.local` for local development:

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your local values
nano .env.local
```

**Required Environment Variables:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Blockchain Configuration
VITE_POLYGON_RPC_URL=your_polygon_rpc_url
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run end-to-end tests
pnpm test:e2e

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Format code
pnpm format

# Check formatting
pnpm format:check
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Framework**: Jest with React Testing Library
- **Coverage**: Minimum 80% coverage required
- **Location**: `src/__tests__/` and `tests/unit/`

### Integration Tests
- **API Testing**: Supabase Edge Functions
- **Database Testing**: Supabase local development
- **Blockchain Testing**: Hardhat test environment

### End-to-End Tests
- **Framework**: Playwright
- **Coverage**: Critical user journeys
- **Location**: `tests/e2e/`

### Performance & Quality
- **Lighthouse CI**: Performance, accessibility, SEO
- **Bundle Analysis**: Source map explorer
- **Type Safety**: TypeScript strict mode

### Running Tests
```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Lighthouse audit
pnpm lighthouse
```

---

## 🚢 AWS Deployment

### Infrastructure as Code

The project is designed for AWS deployment using the following services:

1. **AWS CodePipeline**: CI/CD automation
2. **AWS CodeBuild**: Build automation with `buildspec.yml`
3. **Amazon S3**: Static asset hosting
4. **Amazon CloudFront**: CDN and HTTPS termination
5. **AWS Certificate Manager**: SSL certificates

### Deployment Process

#### 1. CodePipeline Setup

Create a CodePipeline with the following stages:
- **Source**: GitHub repository
- **Build**: CodeBuild project using `buildspec.yml`
- **Deploy**: S3 deployment with CloudFront invalidation

#### 2. CodeBuild Configuration

The `buildspec.yml` file handles:
- Node.js 18.x runtime
- PNPM package manager
- Type checking and linting
- Production build optimization
- Artifact generation

#### 3. S3/CloudFront Setup

```bash
# Create S3 bucket for static hosting
aws s3 mb s3://your-app-bucket-name

# Configure bucket for static website hosting
aws s3 website s3://your-app-bucket-name --index-document index.html --error-document index.html

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

#### 4. Environment Variables

Configure these in AWS Systems Manager Parameter Store:
- `/nexus-mint/supabase/url`
- `/nexus-mint/supabase/anon-key`
- `/nexus-mint/openai/api-key`
- `/nexus-mint/stripe/publishable-key`

### Manual Deployment

```bash
# Build the application
pnpm build:prod

# Deploy to S3
aws s3 sync dist/ s3://your-app-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## 🔧 Development Workflow

### Git Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   pnpm lint && pnpm typecheck && pnpm test
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

2. **Pull Request Process**:
   - Create PR to `main` branch
   - Automated CI/CD pipeline runs
   - Code review required
   - Merge after approval

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb + React Hooks rules
- **Prettier**: Consistent code formatting
- **EditorConfig**: Editor consistency
- **Commit Messages**: Conventional commits

### Performance Optimization

- **Bundle Splitting**: Vendor chunks for better caching
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **CDN**: CloudFront for global distribution

---

## 📚 Documentation

- **API Documentation**: [docs/api.md](docs/api.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)
- **Deployment**: [docs/deployment.md](docs/deployment.md)
- **Testing**: [docs/testing.md](docs/testing.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/AKSQ-ae/Nexus-Mint/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AKSQ-ae/Nexus-Mint/discussions)
- **Documentation**: [Project Wiki](https://github.com/AKSQ-ae/Nexus-Mint/wiki)

---

## 🔗 Links

- **Live Application**: [https://nexus-mint.vercel.app](https://nexus-mint.vercel.app)
- **API Documentation**: [https://nexus-mint.vercel.app/api/docs](https://nexus-mint.vercel.app/api/docs)
- **Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
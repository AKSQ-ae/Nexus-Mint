# Nexus Mint

[![Build Status](https://github.com/AKSQ-ae/Nexus-Mint/workflows/CI/badge.svg)](https://github.com/AKSQ-ae/Nexus-Mint/actions)
[![Coverage](https://codecov.io/gh/AKSQ-ae/Nexus-Mint/branch/main/graph/badge.svg)](https://codecov.io/gh/AKSQ-ae/Nexus-Mint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Your AI buddy that knows your money, watches the market, and tells you exactly what to buy next.

**Repository**: https://github.com/AKSQ-ae/Nexus-Mint

---

## 🚀 Overview

A one-stop platform for tokenizing, buying and managing real-estate assets on Polygon, with an AI "TOKO" assistant guiding you end-to-end. Built on modern web technologies with enterprise-grade security and compliance features.

**Key Features:**
- 🏢 Real estate tokenization on Polygon blockchain
- 🤖 AI-powered investment assistant (TOKO)
- 💳 Integrated payment processing (Stripe + MetaMask)
- 📊 Advanced analytics and portfolio management
- 🔒 KYC/AML compliance and regulatory documentation
- 📱 Progressive Web App with mobile support

---

## 🛠️ Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18+)
- **npm** or **yarn** package manager
- **Hardhat** CLI installed globally (`npm install -g hardhat`)
- **Supabase** project with service-role key & URL
- **Vercel** or hosting platform account
- **MetaMask** wallet (for blockchain interactions)

---

## ⚙️ Setup & Local Development

### 1. Clone & Install

```bash
git clone https://github.com/AKSQ-ae/Nexus-Mint.git
cd nexus-mint
npm install
```

### 2. Supabase Configuration

This project uses Supabase's secure secrets management instead of traditional `.env` files. Configure these secrets in your Supabase Dashboard → Settings → Edge Functions:

| Secret Name | Description |
|-------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe payment processing API key |
| `OPENAI_API_KEY` | OpenAI API key for AI assistant |
| `RESEND_API_KEY` | Email service API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

> **Note**: No local `.env` file required. Authentication and API keys are managed through Supabase Edge Functions.

### 3. Smart Contracts (Hardhat)

Navigate to the contracts directory and configure your blockchain deployment:

```bash
cd contracts
npm install
```

**Key Scripts:**
- **`scripts/deploy.ts`** - Deploy ERC-1155 property token contracts to selected network
- **`scripts/verify.ts`** - Auto-verify contract source on Polygonscan
- **`scripts/testnet-deploy.ts`** - Deploy to Mumbai testnet for testing

**Supported Networks:**
- Mumbai Testnet (for development)
- Polygon Mainnet (for production)

Update `hardhat.config.ts` with your RPC endpoints and deployer private key for contract deployment.

### 4. Supabase Backend

The platform uses Supabase Edge Functions for server-side logic:

**Key Functions:**
- **`live-tokenization-deploy`** - Deploys & records new property token contracts
- **`regulatory-evidence-export`** - Generates compliance documentation bundles
- **`live-investment-flow`** - Processes on-chain investment transactions
- **`ai-buddy-chat`** - Powers the AI assistant conversations

**Database Management:**
```bash
# Push schema & policies to Supabase
supabase db push

# Pull production data locally (for development)
supabase db pull

# Deploy edge functions (automatically deployed via Lovable integration)
supabase functions deploy
```

### 5. Frontend (Vite + React)

Built with modern web technologies:
- **Vite** - Fast build tool and dev server
- **React 18** - UI framework with TypeScript
- **shadcn/ui** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first styling
- **Tanstack Query** - Data fetching and caching

**App Structure:**
- **/** - Hero page with platform overview
- **/properties** - Browse available real estate investments
- **/tokenization** - Interactive property tokenization wizard
- **/dashboard** - Portfolio management and analytics
- **/ai-buddy** - AI assistant chat interface
- **/documentation** - Regulatory and technical documentation

**Development Commands:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

---

## 🔍 Testing

Comprehensive testing suite covering all application layers:

**Unit Tests:**
- Jest configuration in `contracts/` and `src/`
- Component testing with React Testing Library

**Integration Tests:**
- API endpoint testing
- Database interaction testing

**End-to-End Tests:**
- Playwright specs under `tests/e2e/`
- Full user journey testing

**Commands:**
```bash
npm run lint          # Code quality checks
npm run build         # Build and type checking
```

---

## 🚢 Deployment

### Smart Contracts

1. Configure your target network in `contracts/hardhat.config.ts`
2. Deploy contracts using Hardhat:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.ts --network mumbai
   ```
3. Update frontend with deployed contract addresses

### Supabase

1. Database migrations and RLS policies are automatically synced
2. Edge functions are deployed via Lovable integration
3. Verify deployment in Supabase Dashboard → Edge Functions

### Frontend

**Vercel Deployment:**
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Manual Deployment:**
```bash
npm run build
# Deploy dist/ folder to your hosting platform
```

---

## 🎯 Development Workflow

### For Lovable Development (Optional)
1. Visit [Lovable Project](https://lovable.dev/projects/8da2f6ad-10c8-46bc-86fd-5c6d7f52edd9)
2. Use AI-powered editing and real-time preview
3. Changes automatically sync to GitHub

### For Local Development
1. `git clone` and `npm install`
2. `npm run dev` for local development
3. Create feature branches and submit PRs
4. Follow [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat:`, `fix:`, `docs:`)

---

## 🙌 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

**Code Standards:**
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Open issues for bugs and feature requests
- Review our [Code of Conduct](CODE_OF_CONDUCT.md) for community guidelines

---

## 📋 Cheat Sheet

Common commands for daily development:

```bash
# Frontend Development
npm run dev                    # Start local development server
npm run build                  # Production build
npm run preview               # Preview production build

# Smart Contracts
cd contracts && npx hardhat compile    # Compile contracts
cd contracts && npx hardhat run scripts/deploy.ts --network mumbai   # Deploy to testnet
cd contracts && npx hardhat run scripts/deploy.ts --network polygon  # Deploy to mainnet

# Database
supabase db push              # Push schema changes
supabase db pull              # Pull remote schema
supabase functions deploy     # Deploy edge functions

# Testing
npm run lint                 # Code quality

# Mobile (Capacitor)
npx cap sync                 # Sync web assets to mobile
npx cap run ios             # Run on iOS simulator
npx cap run android         # Run on Android emulator
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Platform**: [app.nexus-mint.com](https://app.nexus-mint.com)
- **Documentation**: [/documentation](/documentation)
- **Phase 1 Validation**: [/phase1-validation](/phase1-validation)
- **System Health**: [/system-health](/system-health)
- **Lovable Project**: https://lovable.dev/projects/8da2f6ad-10c8-46bc-86fd-5c6d7f52edd9
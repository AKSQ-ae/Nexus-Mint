// Environment Configuration for Nexus Mint Sharia Deployment
// This file shows what environment variables are needed
// For production, use Supabase Secrets instead of .env files

export const DEPLOYMENT_CONFIG = {
  // Required for deployment
  PRIVATE_KEY: "your_deployer_private_key_here",
  SHARIA_BOARD_ADDRESS: "0x...sharia_board_address_here", 
  NEXUS_ADMIN_ADDRESS: "0x...nexus_admin_address_here",
  
  // Network URLs
  INFURA_API_KEY: "your_infura_api_key",
  ALCHEMY_API_KEY: "your_alchemy_api_key",
  
  // Block explorer APIs
  ETHERSCAN_API_KEY: "your_etherscan_api_key",
  POLYGONSCAN_API_KEY: "your_polygonscan_api_key",
  
  // Network URLs (auto-generated from API keys)
  GOERLI_URL: "https://goerli.infura.io/v3/${INFURA_API_KEY}",
  MAINNET_URL: "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
  POLYGON_URL: "https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}",
};

// Package.json scripts you can add:
export const DEPLOYMENT_SCRIPTS = {
  "deploy:local": "npx hardhat run scripts/01-deploy-infrastructure.js --network localhost",
  "deploy:testnet": "npx hardhat run scripts/01-deploy-infrastructure.js --network goerli", 
  "deploy:polygon": "npx hardhat run scripts/01-deploy-infrastructure.js --network polygon",
  "deploy:mainnet": "npx hardhat run scripts/01-deploy-infrastructure.js --network mainnet",
  "test:deployment": "npx hardhat run scripts/02-test-deployment.js --network localhost",
  "verify:testnet": "npx hardhat verify --network goerli",
  "verify:polygon": "npx hardhat verify --network polygon",
  "compile": "npx hardhat compile",
  "node": "npx hardhat node",
  "clean": "npx hardhat clean"
};
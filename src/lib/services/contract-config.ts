// Smart Contract Configuration for Nexus Mint Tokenisation
// This file centralizes all contract ABIs and addresses

export interface ContractConfig {
  address: string;
  abi: any[];
  network: 'mainnet' | 'polygon' | 'arbitrum' | 'testnet';
  blockExplorer: string;
}

export interface AssetFractionFactoryConfig extends ContractConfig {
  // AssetFractionFactory specific methods
  validateFraction: (assetId: string, amount: number) => Promise<boolean>;
  mintFraction: (assetId: string, amount: number, userAddress: string) => Promise<string>;
  getUserHoldings: (userAddress: string, assetId: string) => Promise<number>;
}

export interface AssetTokenConfig extends ContractConfig {
  // AssetToken specific methods
  balanceOf: (address: string) => Promise<number>;
  transfer: (to: string, amount: number) => Promise<boolean>;
  totalSupply: () => Promise<number>;
}

// Contract ABIs (simplified versions - full ABIs would be loaded from artifacts)
export const ASSET_FRACTION_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "assetId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "validateFraction",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "assetId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "mintFraction",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "assetId",
        "type": "string"
      }
    ],
    "name": "getUserHoldings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ASSET_TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    assetFractionFactory: '0x1234567890123456789012345678901234567890', // Replace with actual address
    assetToken: '0x0987654321098765432109876543210987654321', // Replace with actual address
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    assetFractionFactory: '0xabcdef1234567890abcdef1234567890abcdef12', // Replace with actual address
    assetToken: '0xfedcba0987654321fedcba0987654321fedcba09', // Replace with actual address
    blockExplorer: 'https://polygonscan.com'
  },
  arbitrum: {
    assetFractionFactory: '0x1111111111111111111111111111111111111111', // Replace with actual address
    assetToken: '0x2222222222222222222222222222222222222222', // Replace with actual address
    blockExplorer: 'https://arbiscan.io'
  },
  testnet: {
    assetFractionFactory: '0x3333333333333333333333333333333333333333', // Replace with actual address
    assetToken: '0x4444444444444444444444444444444444444444', // Replace with actual address
    blockExplorer: 'https://goerli.etherscan.io'
  }
} as const;

// Get contract configuration for a specific network
export function getContractConfig(network: keyof typeof CONTRACT_ADDRESSES): {
  assetFractionFactory: AssetFractionFactoryConfig;
  assetToken: AssetTokenConfig;
} {
  const addresses = CONTRACT_ADDRESSES[network];
  
  return {
    assetFractionFactory: {
      address: addresses.assetFractionFactory,
      abi: ASSET_FRACTION_FACTORY_ABI,
      network,
      blockExplorer: addresses.blockExplorer,
      validateFraction: async (assetId: string, amount: number) => {
        // Implementation would use ethers.js to call the contract
        console.log(`Validating fraction for asset ${assetId}, amount ${amount}`);
        return true;
      },
      mintFraction: async (assetId: string, amount: number, userAddress: string) => {
        // Implementation would use ethers.js to call the contract
        console.log(`Minting fraction for asset ${assetId}, amount ${amount}, user ${userAddress}`);
        return '0x' + Math.random().toString(16).substr(2, 64); // Mock transaction hash
      },
      getUserHoldings: async (userAddress: string, assetId: string) => {
        // Implementation would use ethers.js to call the contract
        console.log(`Getting holdings for user ${userAddress}, asset ${assetId}`);
        return Math.floor(Math.random() * 1000); // Mock holdings
      }
    },
    assetToken: {
      address: addresses.assetToken,
      abi: ASSET_TOKEN_ABI,
      network,
      blockExplorer: addresses.blockExplorer,
      balanceOf: async (address: string) => {
        // Implementation would use ethers.js to call the contract
        console.log(`Getting balance for address ${address}`);
        return Math.floor(Math.random() * 10000); // Mock balance
      },
      transfer: async (to: string, amount: number) => {
        // Implementation would use ethers.js to call the contract
        console.log(`Transferring ${amount} tokens to ${to}`);
        return true;
      },
      totalSupply: async () => {
        // Implementation would use ethers.js to call the contract
        console.log('Getting total supply');
        return 1000000; // Mock total supply
      }
    }
  };
}

// Get the optimal network based on user preferences and gas prices
export function getOptimalNetwork(userPreference?: 'mainnet' | 'polygon' | 'arbitrum'): keyof typeof CONTRACT_ADDRESSES {
  // In a real implementation, this would check gas prices and user preferences
  return userPreference || 'polygon'; // Default to Polygon for lower fees
}

// Validate contract addresses
export function validateContractAddresses(network: keyof typeof CONTRACT_ADDRESSES): boolean {
  const addresses = CONTRACT_ADDRESSES[network];
  
  // Check if addresses are valid Ethereum addresses
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  return isValidAddress(addresses.assetFractionFactory) && isValidAddress(addresses.assetToken);
}

// Get block explorer URL for a transaction
export function getBlockExplorerUrl(network: keyof typeof CONTRACT_ADDRESSES, txHash: string): string {
  const addresses = CONTRACT_ADDRESSES[network];
  return `${addresses.blockExplorer}/tx/${txHash}`;
}

// Get block explorer URL for a contract
export function getContractExplorerUrl(network: keyof typeof CONTRACT_ADDRESSES, contractAddress: string): string {
  const addresses = CONTRACT_ADDRESSES[network];
  return `${addresses.blockExplorer}/address/${contractAddress}`;
}

// Contract interaction utilities
export class ContractInteractionService {
  private config: ReturnType<typeof getContractConfig>;
  
  constructor(network: keyof typeof CONTRACT_ADDRESSES) {
    this.config = getContractConfig(network);
  }
  
  async validateFraction(assetId: string, amount: number): Promise<boolean> {
    return this.config.assetFractionFactory.validateFraction(assetId, amount);
  }
  
  async mintFraction(assetId: string, amount: number, userAddress: string): Promise<string> {
    return this.config.assetFractionFactory.mintFraction(assetId, amount, userAddress);
  }
  
  async getUserHoldings(userAddress: string, assetId: string): Promise<number> {
    return this.config.assetFractionFactory.getUserHoldings(userAddress, assetId);
  }
  
  async getTokenBalance(address: string): Promise<number> {
    return this.config.assetToken.balanceOf(address);
  }
  
  async transferTokens(to: string, amount: number): Promise<boolean> {
    return this.config.assetToken.transfer(to, amount);
  }
  
  async getTotalSupply(): Promise<number> {
    return this.config.assetToken.totalSupply();
  }
  
  getConfig() {
    return this.config;
  }
}
// Smart Contract Configuration for Nexus Mint Tokenisation
// This file centralizes all contract ABIs and addresses

export interface ContractConfig {
  address: string;
  abi: any[];
  network: 'mainnet' | 'polygon' | 'arbitrum' | 'testnet';
  blockExplorer: string;
  version: string;
  deployedAt: string;
  upgradeable: boolean;
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

// Contract addresses by network with version mapping
export const CONTRACT_ADDRESSES = {
  mainnet: {
    assetFractionFactory: {
      v1: '0x1234567890123456789012345678901234567890',
      v2: '0x2345678901234567890123456789012345678901',
      current: 'v2'
    },
    assetToken: {
      v1: '0x0987654321098765432109876543210987654321',
      v2: '0x1876543210987654321098765432109876543210',
      current: 'v2'
    },
    blockExplorer: 'https://etherscan.io'
  },
  polygon: {
    assetFractionFactory: {
      v1: '0xabcdef1234567890abcdef1234567890abcdef12',
      v2: '0xbcdef1234567890abcdef1234567890abcdef123',
      current: 'v2'
    },
    assetToken: {
      v1: '0xfedcba0987654321fedcba0987654321fedcba09',
      v2: '0xedcba0987654321fedcba0987654321fedcba098',
      current: 'v2'
    },
    blockExplorer: 'https://polygonscan.com'
  },
  arbitrum: {
    assetFractionFactory: {
      v1: '0x1111111111111111111111111111111111111111',
      v2: '0x2222222222222222222222222222222222222222',
      current: 'v1'
    },
    assetToken: {
      v1: '0x3333333333333333333333333333333333333333',
      v2: '0x4444444444444444444444444444444444444444',
      current: 'v1'
    },
    blockExplorer: 'https://arbiscan.io'
  },
  testnet: {
    assetFractionFactory: {
      v1: '0x5555555555555555555555555555555555555555',
      v2: '0x6666666666666666666666666666666666666666',
      current: 'v2'
    },
    assetToken: {
      v1: '0x7777777777777777777777777777777777777777',
      v2: '0x8888888888888888888888888888888888888888',
      current: 'v2'
    },
    blockExplorer: 'https://goerli.etherscan.io'
  }
} as const;

// Contract version history and upgrade notes
export const CONTRACT_VERSIONS = {
  v1: {
    deployedAt: '2024-01-01',
    features: ['Basic tokenisation', 'Fraction validation', 'User holdings'],
    knownIssues: ['Gas optimization needed', 'Limited upgradeability'],
    upgradeable: false
  },
  v2: {
    deployedAt: '2024-03-15',
    features: ['Gas optimization', 'Enhanced security', 'Upgradeable contracts', 'Multi-asset support'],
    knownIssues: [],
    upgradeable: true,
    upgradePath: 'v1 -> v2: Data migration required'
  }
};

// Get contract configuration for a specific network
export function getContractConfig(network: keyof typeof CONTRACT_ADDRESSES): {
  assetFractionFactory: AssetFractionFactoryConfig;
  assetToken: AssetTokenConfig;
} {
  const addresses = CONTRACT_ADDRESSES[network];
  const factoryVersion = addresses.assetFractionFactory.current;
  const tokenVersion = addresses.assetToken.current;
  
  return {
    assetFractionFactory: {
      address: addresses.assetFractionFactory[factoryVersion as keyof typeof addresses.assetFractionFactory],
      abi: ASSET_FRACTION_FACTORY_ABI,
      network,
      blockExplorer: addresses.blockExplorer,
      version: factoryVersion,
      deployedAt: CONTRACT_VERSIONS[factoryVersion as keyof typeof CONTRACT_VERSIONS].deployedAt,
      upgradeable: CONTRACT_VERSIONS[factoryVersion as keyof typeof CONTRACT_VERSIONS].upgradeable,
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
      address: addresses.assetToken[tokenVersion as keyof typeof addresses.assetToken],
      abi: ASSET_TOKEN_ABI,
      network,
      blockExplorer: addresses.blockExplorer,
      version: tokenVersion,
      deployedAt: CONTRACT_VERSIONS[tokenVersion as keyof typeof CONTRACT_VERSIONS].deployedAt,
      upgradeable: CONTRACT_VERSIONS[tokenVersion as keyof typeof CONTRACT_VERSIONS].upgradeable,
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
  
  const factoryAddress = addresses.assetFractionFactory[addresses.assetFractionFactory.current as keyof typeof addresses.assetFractionFactory];
  const tokenAddress = addresses.assetToken[addresses.assetToken.current as keyof typeof addresses.assetToken];
  
  return isValidAddress(factoryAddress) && isValidAddress(tokenAddress);
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

// Get contract version information
export function getContractVersionInfo(network: keyof typeof CONTRACT_ADDRESSES, contractType: 'assetFractionFactory' | 'assetToken') {
  const addresses = CONTRACT_ADDRESSES[network];
  const version = addresses[contractType].current;
  return {
    version,
    ...CONTRACT_VERSIONS[version as keyof typeof CONTRACT_VERSIONS]
  };
}

// Check if contract upgrade is available
export function isUpgradeAvailable(network: keyof typeof CONTRACT_ADDRESSES, contractType: 'assetFractionFactory' | 'assetToken'): boolean {
  const addresses = CONTRACT_ADDRESSES[network];
  const currentVersion = addresses[contractType].current;
  const versionInfo = CONTRACT_VERSIONS[currentVersion as keyof typeof CONTRACT_VERSIONS];
  
  // Check if there's a newer version available
  const availableVersions = Object.keys(CONTRACT_VERSIONS);
  const currentIndex = availableVersions.indexOf(currentVersion);
  const hasNewerVersion = currentIndex < availableVersions.length - 1;
  
  return versionInfo.upgradeable && hasNewerVersion;
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
  
  getVersionInfo() {
    return {
      factory: getContractVersionInfo(this.config.assetFractionFactory.network, 'assetFractionFactory'),
      token: getContractVersionInfo(this.config.assetToken.network, 'assetToken')
    };
  }
}
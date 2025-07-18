import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

// MetaMask SDK integration
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from 'react';

export interface TokenizationData {
  property_id: string;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  price_per_token: number;
  contract_address?: string;
  blockchain_network: string;
}

export interface WalletConnection {
  address: string;
  chain_id: number;
  is_connected: boolean;
}

// MetaMask connection hook
export function useMetaMaskConnection() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        const network = await provider.getNetwork();
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
          setChainId(Number(network.chainId));
          setProvider(provider);
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
          setProvider(null);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload(); // Recommended by MetaMask
      });
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setAccount(address);
      setIsConnected(true);
      setChainId(Number(network.chainId));
      setProvider(provider);

      return { address, chainId: Number(network.chainId) };
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setProvider(null);
  };

  const switchToEthereum = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x1',
            chainName: 'Ethereum Mainnet',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.infura.io/v3/'],
            blockExplorerUrls: ['https://etherscan.io/']
          }]
        });
      }
    }
  };

  const switchToPolygon = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // Polygon Mainnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      }
    }
  };

  return {
    account,
    isConnected,
    chainId,
    provider,
    connectWallet,
    disconnectWallet,
    switchToEthereum,
    switchToPolygon,
    isMetaMaskInstalled: !!window.ethereum
  };
}

export function useWalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();

  const connectWallet = (connectorId?: string) => {
    const connector = connectors.find(c => c.id === connectorId) || connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const linkWalletToProfile = async (userId: string) => {
    if (!address) throw new Error('No wallet connected');

    // Sign a message to verify wallet ownership
    const message = `Link wallet ${address} to Nexus Platform account`;
    
    try {
    const signature = await signMessage({ 
      message,
      account: address as `0x${string}`
    });
      
      // Update user profile with wallet address
      const { error } = await supabase
        .from('users')
        .update({ wallet_address: address })
        .eq('id', userId);

      if (error) throw error;
      
      return { address, signature };
    } catch (error) {
      console.error('Failed to link wallet:', error);
      throw error;
    }
  };

  return {
    address,
    isConnected,
    chainId: chain?.id,
    chainName: chain?.name,
    connect: connectWallet,
    disconnect,
    linkWallet: linkWalletToProfile,
    connectors
  };
}

export async function createPropertyToken(tokenData: TokenizationData) {
  // This would integrate with smart contract deployment
  // For now, we'll create a database record
  
  const { data, error } = await supabase
    .from('property_tokens')
    .insert({
      property_id: tokenData.property_id,
      token_name: tokenData.token_name,
      token_symbol: tokenData.token_symbol,
      total_supply: tokenData.total_supply,
      available_supply: tokenData.total_supply,
      initial_price: tokenData.price_per_token,
      current_price: tokenData.price_per_token,
      contract_address: tokenData.contract_address || `0x${Math.random().toString(16).substr(2, 40)}`,
      token_address: tokenData.contract_address || `0x${Math.random().toString(16).substr(2, 40)}`,
      blockchain_network: tokenData.blockchain_network,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPropertyTokens(propertyId: string) {
  const { data, error } = await supabase
    .from('property_tokens')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data || [];
}

export async function transferTokens(fromAddress: string, toAddress: string, tokenAmount: number, propertyId: string) {
  // This would interact with the smart contract
  // For now, we'll simulate the transfer in our database
  
  const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  // Create transaction record
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      from_address: fromAddress,
      to_address: toAddress,
      token_amount: tokenAmount,
      property_id: propertyId,
      transaction_type: 'transfer',
      transaction_hash: transactionHash,
      status: 'confirmed',
      price_per_token: 100, // Default value
      total_amount: tokenAmount * 100 // Calculate total amount
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWalletTransactions(walletAddress: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      properties(title, city, country)
    `)
    .or(`from_address.eq.${walletAddress},to_address.eq.${walletAddress}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function formatWalletAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Gas monitoring and network optimization
export function useGasMonitoring() {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isHighGas, setIsHighGas] = useState(false);
  const [recommendedNetwork, setRecommendedNetwork] = useState<'ethereum' | 'polygon'>('polygon');
  const { toast } = useToast();

  const GAS_THRESHOLD_GWEI = 50n; // 50 gwei threshold

  const checkGasPrice = async (provider: ethers.BrowserProvider) => {
    try {
      const feeData = await provider.getFeeData();
      const currentGasPrice = feeData.gasPrice || 0n;
      
      setGasPrice(currentGasPrice);
      
      const gasPriceGwei = currentGasPrice / 1000000000n; // Convert to gwei
      const isHigh = gasPriceGwei > GAS_THRESHOLD_GWEI;
      
      setIsHighGas(isHigh);
      setRecommendedNetwork(isHigh ? 'polygon' : 'ethereum');

      if (isHigh) {
        toast({
          title: "High Gas Fees Detected",
          description: `Current gas: ${gasPriceGwei} gwei. Consider using Polygon for lower fees.`,
          variant: "destructive",
        });
      }

      return { gasPrice: currentGasPrice, isHighGas: isHigh, recommendedNetwork: isHigh ? 'polygon' : 'ethereum' };
    } catch (error) {
      console.error('Error checking gas price:', error);
      return null;
    }
  };

  return {
    gasPrice,
    isHighGas,
    recommendedNetwork,
    checkGasPrice
  };
}

// Network configuration with fallback logic
export const NETWORK_CONFIG = {
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/'],
    gasMultiplier: 1.0
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    gasMultiplier: 0.1 // Much cheaper gas
  }
};

export async function switchToOptimalNetwork(provider: ethers.BrowserProvider) {
  const { checkGasPrice } = useGasMonitoring();
  const gasInfo = await checkGasPrice(provider);
  
  if (!gasInfo) return 'ethereum';
  
  const optimalNetwork = gasInfo.recommendedNetwork;
  
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG[optimalNetwork].chainId }],
      });
      return optimalNetwork;
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG[optimalNetwork]]
        });
        return optimalNetwork;
      }
      console.error('Failed to switch network:', error);
      return 'ethereum';
    }
  }
  
  return 'ethereum';
}

export function getBlockchainExplorerUrl(txHash: string, network: string = 'ethereum') {
  const explorers = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    base: 'https://basescan.org/tx/',
    arbitrum: 'https://arbiscan.io/tx/'
  };
  
  return `${explorers[network] || explorers.ethereum}${txHash}`;
}
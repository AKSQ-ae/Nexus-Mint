import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

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

export function getBlockchainExplorerUrl(txHash: string, network: string = 'ethereum') {
  const explorers = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    base: 'https://basescan.org/tx/',
    arbitrum: 'https://arbiscan.io/tx/'
  };
  
  return `${explorers[network] || explorers.ethereum}${txHash}`;
}
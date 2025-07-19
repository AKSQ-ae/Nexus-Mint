import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base],
  [
    alchemyProvider({ apiKey: '-QZUEEgJJVteHF7GTszRr9casXWZ_qZD' }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Nexus Platform',
  projectId: '21b1b7e40b664f5bdd0b41f881dddef1',
  chains,
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'Nexus Platform',
  projectId: '21b1b7e40b664f5bdd0b41f881dddef1',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/-QZUEEgJJVteHF7GTszRr9casXWZ_qZD`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/-QZUEEgJJVteHF7GTszRr9casXWZ_qZD`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/-QZUEEgJJVteHF7GTszRr9casXWZ_qZD`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/-QZUEEgJJVteHF7GTszRr9casXWZ_qZD`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/-QZUEEgJJVteHF7GTszRr9casXWZ_qZD`),
  },
  ssr: false,
});
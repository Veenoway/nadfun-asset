import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'nadfun+',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [monadTestnet],
  ssr: true,
  transports: {
    [monadTestnet.id]: http(),
  },
});

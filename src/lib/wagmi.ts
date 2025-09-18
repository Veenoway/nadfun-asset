import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Create a WalletConnect Cloud project at https://cloud.walletconnect.com and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local.'
  );
}

export const config = getDefaultConfig({
  appName: 'nadfun+',
  projectId,
  chains: [monadTestnet],
  ssr: true,
  transports: {
    [monadTestnet.id]: http(),
  },
});

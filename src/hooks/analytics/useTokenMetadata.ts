import { useQuery } from '@tanstack/react-query';

interface TokenMetadata {
  token_metadata: {
    token_address: string;
    name: string;
    symbol: string;
    image_uri: string;
    description: string;
    twitter: string;
    telegram: string;
    website: string;
    is_listing: boolean;
    created_at: number;
    transaction_hash: string;
    creator: string;
    total_supply: string;
  };
}

const fetchTokenMetadata = async (tokenAddress: string): Promise<TokenMetadata> => {
  if (!tokenAddress || tokenAddress.length < 40 || !tokenAddress.startsWith('0x')) {
    throw new Error('Invalid token address');
  }

  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = `https://testnet-v3-api.nad.fun/token/metadata/${tokenAddress}`;
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }
};

export const useTokenMetadata = (tokenAddress: string = '') => {
  return useQuery<TokenMetadata>({
    queryKey: ['tokenMetadata', tokenAddress],
    queryFn: () => fetchTokenMetadata(tokenAddress),
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export default useTokenMetadata;

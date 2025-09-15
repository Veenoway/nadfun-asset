import { useQuery } from '@tanstack/react-query';

interface MarketData {
  market_type: string;
  token_id: string;
  market_id: string;
  price: string;
  total_supply: string;
}

const fetchMarketData = async (tokenAddress: string): Promise<MarketData> => {
  if (!tokenAddress || tokenAddress.length < 40 || !tokenAddress.startsWith('0x')) {
    throw new Error('Invalid token address');
  }

  try {
    // Using CORS proxy to bypass CORS restrictions
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = `https://testnet-v3-api.nad.fun/trade/market/${tokenAddress}`;
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

export const useMarketData = (tokenAddress: string = '') => {
  return useQuery<MarketData>({
    queryKey: ['marketData', tokenAddress],
    queryFn: () => fetchMarketData(tokenAddress),
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

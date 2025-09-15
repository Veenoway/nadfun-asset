import { useQuery } from '@tanstack/react-query';

interface MarketData {
  market_type: string;
  token_id: string;
  market_id: string;
  price: string;
  total_supply: string;
}

interface MarketDataResponse {
  [tokenId: string]: MarketData | null;
}

const fetchMarketData = async (tokenId: string): Promise<MarketData | null> => {
  try {
    const response = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://testnet-v3-api.nad.fun/trade/market/${tokenId}`)}`,
    );

    if (!response.ok) {
      console.warn(`Failed to fetch market data for token ${tokenId}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Error fetching market data for token ${tokenId}:`, error);
    return null;
  }
};

const fetchMultipleMarketData = async (tokenIds: string[]): Promise<MarketDataResponse> => {
  const results: MarketDataResponse = {};

  // Fetch all market data in parallel
  const promises = tokenIds.map(async (tokenId) => {
    const data = await fetchMarketData(tokenId);
    return { tokenId, data };
  });

  const responses = await Promise.all(promises);

  responses.forEach(({ tokenId, data }) => {
    results[tokenId] = data;
  });

  return results;
};

export const useMultipleMarketData = (tokenIds: string[]) => {
  return useQuery({
    queryKey: ['multipleMarketData', tokenIds],
    queryFn: () => fetchMultipleMarketData(tokenIds),
    enabled: tokenIds.length > 0,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

// Helper function to calculate market cap
export const calculateMarketCap = (price: string, totalSupply: string): number => {
  try {
    const priceNum = parseFloat(price);
    const supplyNum = parseFloat(totalSupply);

    // Convert from wei (assuming 18 decimals)
    const supplyInTokens = supplyNum / 1e18;
    const marketCap = priceNum * supplyInTokens;

    return marketCap;
  } catch (error) {
    console.warn('Error calculating market cap:', error);
    return 0;
  }
};

// Helper function to format market cap
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap === 0) return 'N/A';

  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

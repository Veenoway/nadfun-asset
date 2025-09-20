import { useQuery } from '@tanstack/react-query';

interface SearchTokenInfo {
  token_id: string;
  name: string;
  symbol: string;
  image_uri: string;
}

interface SearchToken {
  token_info: SearchTokenInfo;
  price: string;
  market_cap: string;
  created_at: number;
}

interface SearchResponse {
  tokens: {
    tokens: SearchToken[];
    total_count: number;
  };
  accounts: {
    accounts: any[];
    total_count: number;
  };
}

const searchTokens = async (query: string): Promise<SearchResponse> => {
  if (!query.trim()) {
    return {
      tokens: { tokens: [], total_count: 0 },
      accounts: { accounts: [], total_count: 0 },
    };
  }

  const response = await fetch(`/api/tokens/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`Search failed with status: ${response.status}`);
  }

  return response.json();
};

export const useTokenSearch = (query: string) => {
  return useQuery({
    queryKey: ['tokenSearch', query],
    queryFn: () => searchTokens(query),
    enabled: query.trim().length > 0,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

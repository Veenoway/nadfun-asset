import { MarketData, OrderTokenResponse, UserTokenBalancesResponse } from '@/lib/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

///order/latest_trade
//https://testnet-v3-api.nad.fun/profile/hold-token/0xe329ce7EcB851c09948e5F507F1a6FfA40De055B?account_id=0xe329ce7EcB851c09948e5F507F1a6FfA40De055B&page=1&limit=10
//https://testnet-v3-api.nad.fun/profile/swap-history/0xe329ce7EcB851c09948e5F507F1a6FfA40De055B?account_id=0xe329ce7EcB851c09948e5F507F1a6FfA40De055B&page=1&limit=10

//https://testnet-v3-api.nad.fun/trade/chart/0x4c8503B32DbaFAE7ec645b397F716BCA47d2a9a1?resolution=1&from=0&to=1757525520&countback=300

// Fetch tokens by creation time
const useTokensByCreationTime = (
  page: number = 1,
  limit: number = 20,
  initialData?: OrderTokenResponse,
): UseQueryResult<OrderTokenResponse> => {
  return useQuery({
    queryKey: ['tokens', 'creation_time', page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/order/creation_time`, {
        params: { page, limit },
      });
      return response.data;
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch tokens by market cap
const useTokensByMarketCap = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['tokens', 'market_cap', page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/order/market_cap`, {
        params: { page, limit },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch token info
const useTokenInfo = (tokenAddress: string): UseQueryResult<MarketData> => {
  return useQuery({
    queryKey: ['token', 'info', tokenAddress],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/trade/market/${tokenAddress}`);
      return response.data;
    },
    enabled: !!tokenAddress,
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch token chart data
// In useTokens.ts
const useTokenChart = (tokenAddress: string, resolution: number = 1, countback: number = 300) => {
  const to = Math.floor(Date.now() / 1000);

  return useQuery({
    queryKey: ['token', 'chart', tokenAddress, resolution, to, countback],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/trade/chart/${tokenAddress}`, {
        params: {
          resolution,
          from: 0,
          to,
          countback,
        },
      });

      // Format the data for the chart
      const data = response.data;
      return {
        t: data.t || [], // timestamps
        o: data.o || [], // open prices
        h: data.h || [], // high prices
        l: data.l || [], // low prices
        c: data.c || [], // close prices
        v: data.v || [], // volumes
      };
    },
    enabled: !!tokenAddress,
    staleTime: resolution * 1000,
    refetchInterval: resolution * 1000,
  });
};

// Fetch multiple token prices at once
const useMultipleTokenPrices = (tokenAddresses: string[]) => {
  return useQuery({
    queryKey: ['tokens', 'prices', tokenAddresses],
    queryFn: async () => {
      const pricePromises = tokenAddresses.map(async (address) => {
        if (!address) return { address, price: null };
        try {
          const response = await axios.get(`/api/nadfun/trade/market/${address}`);
          return { address, price: response.data.price };
        } catch (error) {
          console.error(`Failed to fetch price for token ${address}:`, error);
          return { address, price: null };
        }
      });

      const results = await Promise.all(pricePromises);
      return results.reduce(
        (acc, { address, price }) => {
          acc[address] = price;
          return acc;
        },
        {} as Record<string, string | null>,
      );
    },
    enabled: tokenAddresses.length > 0 && tokenAddresses.some((addr) => !!addr),
    staleTime: 2 * 60 * 1000,
  });
};

// Fetch user token balances
const useUserTokenBalances = (
  accountAddress?: string,
): UseQueryResult<UserTokenBalancesResponse> => {
  return useQuery({
    queryKey: ['user', 'token-balances', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return null;
      //profile/hold-token/0xe329ce7EcB851c09948e5F507F1a6FfA40De055B?account_id=0xe329ce7EcB851c09948e5F507F1a6FfA40De055B&page=1&limit=10
      const response = await axios.get(`/api/nadfun/profile/hold-token/${accountAddress}`, {
        params: { account_id: accountAddress, page: 1, limit: 15 },
      });
      return response.data;
    },
    enabled: !!accountAddress,
    staleTime: 30 * 1000, // Refresh every 30 seconds
    gcTime: 5 * 60 * 1000,
  });
};

export {
  useTokensByCreationTime,
  useTokensByMarketCap,
  useTokenInfo,
  useTokenChart,
  useMultipleTokenPrices,
  useUserTokenBalances,
};

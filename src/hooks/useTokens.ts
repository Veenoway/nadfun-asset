import { MarketDataResponse, OrderTokenResponse } from '@/modules/home/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

// Fetch tokens by creation time
export const useTokensByCreationTime = (
  page: number = 1,
  limit: number = 20
): UseQueryResult<OrderTokenResponse> => {
  return useQuery({
    queryKey: ['tokens', 'creation_time', page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/order/creation_time`, {
        params: { page, limit },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch tokens by market cap
export const useTokensByMarketCap = (page: number = 1, limit: number = 10) => {
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
export const useTokenInfo = (tokenAddress: string): UseQueryResult<MarketDataResponse> => {
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
export const useTokenChart = (
  tokenAddress: string,
  interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' = '1h'
) => {
  return useQuery({
    queryKey: ['token', 'chart', tokenAddress, interval],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/token/chart/${tokenAddress}`, {
        params: { interval },
      });
      return response.data;
    },
    enabled: !!tokenAddress,
    staleTime: 1 * 60 * 1000,
  });
};

// Fetch account positions
export const useAccountPositions = (
  accountAddress: string,
  positionType: 'all' | 'open' | 'close' = 'open',
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['account', 'positions', accountAddress, positionType, page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/account/position/${accountAddress}`, {
        params: { position_type: positionType, page, limit },
      });
      return response.data;
    },
    enabled: !!accountAddress,
    staleTime: 30 * 1000,
  });
};

// Fetch multiple token prices at once
export const useMultipleTokenPrices = (tokenAddresses: string[]) => {
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
      return results.reduce((acc, { address, price }) => {
        acc[address] = price;
        return acc;
      }, {} as Record<string, string | null>);
    },
    enabled: tokenAddresses.length > 0 && tokenAddresses.some((addr) => !!addr),
    staleTime: 2 * 60 * 1000,
  });
};

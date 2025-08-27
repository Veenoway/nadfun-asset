import { OrderTokenResponse } from '@/modules/home/types';
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
export const useTokenInfo = (tokenAddress: string) => {
  return useQuery({
    queryKey: ['token', 'info', tokenAddress],
    queryFn: async () => {
      const response = await axios.get(`/api/nadfun/token/${tokenAddress}`);
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

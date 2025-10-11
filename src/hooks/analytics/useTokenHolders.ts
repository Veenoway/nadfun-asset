import { useQuery } from '@tanstack/react-query';
import {
  fetchAllTokenHolders,
  fetchTokenHoldersGraphQL,
  ProcessedTokenHolder,
  processTokenHolder,
  calculateTotalHolders,
} from '@/lib/api';
import { useWalletHoldingAnalytics } from './useWalletHoldingAnalytics';

const isValidAddress = (addr?: string) => !!addr && addr.startsWith('0x') && addr.length === 42;

// New GraphQL-based hook for token holders
export const useTokenHoldersGraphQL = (tokenId: string = '') => {
  return useQuery({
    queryKey: ['tokenHoldersGraphQL', tokenId],
    queryFn: () => fetchTokenHoldersGraphQL(tokenId),
    enabled: isValidAddress(tokenId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Legacy hook (now uses GraphQL API)
export const useTokenHolders = (
  contractAddress: string = '',
  page: number = 1,
  offset: number = 100,
) => {
  return useQuery({
    queryKey: ['tokenHolders', contractAddress, page, offset],
    queryFn: async () => {
      const allHolders = await fetchAllTokenHolders(contractAddress);
      // Simulate pagination by slicing the results
      const startIndex = (page - 1) * offset;
      const endIndex = startIndex + offset;
      const paginatedHolders = allHolders.slice(startIndex, endIndex);

      return {
        status: '1',
        message: 'OK',
        result: paginatedHolders,
      };
    },
    enabled: isValidAddress(contractAddress),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useTokenHoldersStats = (tokenId: string = '', timeframe: string = '24h') => {
  const {
    data: holdersData,
    isLoading: holdersLoading,
    error: holdersError,
  } = useQuery({
    queryKey: ['allTokenHolders', tokenId],
    queryFn: () => fetchAllTokenHolders(tokenId),
    enabled: isValidAddress(tokenId),
    staleTime: 10000,
    refetchInterval: 15000,
    retry: (failureCount, error) => {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Get real wallet holding analytics
  const {
    data: holdingAnalytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useWalletHoldingAnalytics(tokenId, timeframe);

  const stats = {
    totalHolders: 0,
    newHolders: 0,
    isLoading: holdersLoading || analyticsLoading,
    error: holdersError || analyticsError,
  };

  if (holdersData) {
    stats.totalHolders = calculateTotalHolders(holdersData);
  }

  // Use real analytics data for new holders
  if (holdingAnalytics) {
    stats.newHolders = holdingAnalytics.totalNewHolders;
  }

  return stats;
};

export const useTopTokenHolders = (tokenId: string = '', limit: number = 10) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['topTokenHolders', tokenId, limit],
    queryFn: async () => {
      const allHolders = await fetchAllTokenHolders(tokenId);
      return { result: allHolders };
    },
    enabled: isValidAddress(tokenId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const processedHolders: ProcessedTokenHolder[] = data?.result
    ? data.result.slice(0, limit).map((holder, index) => processTokenHolder(holder, index + 1))
    : [];

  return {
    holders: processedHolders,
    isLoading,
    error,
  };
};

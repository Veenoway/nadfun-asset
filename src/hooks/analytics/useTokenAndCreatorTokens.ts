import { useQuery } from '@tanstack/react-query';
import { fetchTokenAndCreatorTokens, TokenAndCreatorResponse } from '@/lib/trades-api';

const isValidAddress = (addr?: string) => !!addr && addr.startsWith('0x') && addr.length >= 40;

export const useTokenAndCreatorTokens = (tokenAddress: string = '') => {
  return useQuery<TokenAndCreatorResponse>({
    queryKey: ['tokenAndCreatorTokens', tokenAddress],
    queryFn: () => fetchTokenAndCreatorTokens(tokenAddress),
    enabled: isValidAddress(tokenAddress),
    staleTime: 30000, // 30 seconds - creator data doesn't change as frequently
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

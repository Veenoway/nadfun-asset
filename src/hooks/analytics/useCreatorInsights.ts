import { useQuery } from '@tanstack/react-query';
import { fetchCreatorInsights, CreatorInsightsResponse } from '@/lib/trades-api';

const isValidAddress = (addr?: string) => !!addr && addr.startsWith('0x') && addr.length >= 40;

export const useCreatorInsights = (creatorAddress: string = '') => {
  return useQuery<CreatorInsightsResponse>({
    queryKey: ['creatorInsights', creatorAddress],
    queryFn: () => fetchCreatorInsights(creatorAddress),
    enabled: isValidAddress(creatorAddress),
    staleTime: 30000, // 30 seconds - creator data doesn't change as frequently
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

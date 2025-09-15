import { useQuery } from '@tanstack/react-query';
import { fetchAverageHoldingTime, HoldingTimeData } from '@/lib/api';

const isValidAddress = (addr?: string) => !!addr && addr.startsWith('0x') && addr.length >= 40;

export const useAverageHoldingTime = (tokenAddress: string = '') => {
  return useQuery<HoldingTimeData>({
    queryKey: ['averageHoldingTime', tokenAddress],
    queryFn: () => fetchAverageHoldingTime(tokenAddress),
    enabled: isValidAddress(tokenAddress),
    staleTime: 5 * 60 * 1000, // 5 minutes - holding time data doesn't change frequently
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

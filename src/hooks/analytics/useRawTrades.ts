import { useQuery } from '@tanstack/react-query';
import { getTradingAnalytics, TradingAnalytics } from '@/lib/trades-api';

export const useRawTrades = (tokenAddress: string, timeFrame: string) => {
  return useQuery<TradingAnalytics>({
    queryKey: ['rawTrades', tokenAddress, timeFrame],
    queryFn: () => getTradingAnalytics(tokenAddress, timeFrame),
    enabled:
      !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x') && !!timeFrame,
    staleTime: 5000, // 5 seconds - data is fresh for only 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    refetchOnMount: true, // Always refetch when component mounts
  });
};

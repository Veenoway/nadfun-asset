import { useQuery } from '@tanstack/react-query';
import { fetchTrades, processTrades, TradingAnalytics } from '@/lib/trading-api';

export const useTradingData = (tokenAddress: string, timeFrame: string) => {
  return useQuery<TradingAnalytics>({
    queryKey: ['tradingData', tokenAddress, timeFrame],
    queryFn: async () => {
      const trades = await fetchTrades(tokenAddress, timeFrame);
      return processTrades(trades);
    },
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 2,
    retryDelay: 1000,
  });
};

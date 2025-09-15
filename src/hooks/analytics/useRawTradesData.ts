import { useQuery } from '@tanstack/react-query';
import { fetchRawTrades, RawTrade } from '@/lib/trades-api';

const isValidAddress = (addr?: string) => !!addr && addr.startsWith('0x') && addr.length >= 40;

export const useRawTradesData = (tokenAddress: string = '', timeframe: string = '5m') => {
  return useQuery<RawTrade[]>({
    queryKey: ['rawTradesData', tokenAddress, timeframe],
    queryFn: () => fetchRawTrades(tokenAddress, timeframe),
    enabled: isValidAddress(tokenAddress) && !!timeframe,
    staleTime: 5000, // 5 seconds - data is fresh for only 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    refetchOnMount: true, // Always refetch when component mounts
  });
};

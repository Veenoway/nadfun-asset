import { useQuery } from '@tanstack/react-query';
import { nadfunClient } from '@/lib/nadfun-client';

export const useCurveSummary = (tokenAddress: string | null) => {
  return useQuery({
    queryKey: ['curve-summary', tokenAddress],
    queryFn: () => nadfunClient.getCurveSummary(tokenAddress!),
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useDexSwaps = (tokenAddress: string | null) => {
  return useQuery({
    queryKey: ['dex-swaps', tokenAddress],
    queryFn: () => nadfunClient.getDexSwaps(tokenAddress!),
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

export const useCurveEvents = (tokenAddress: string | null) => {
  return useQuery({
    queryKey: ['curve-events', tokenAddress],
    queryFn: () => nadfunClient.getCurveEvents(tokenAddress!),
    enabled: !!tokenAddress && tokenAddress.length >= 40 && tokenAddress.startsWith('0x'),
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

// Combined hook for all trading data
export const useTradingData = (tokenAddress: string | null) => {
  const curveSummary = useCurveSummary(tokenAddress);
  const dexSwaps = useDexSwaps(tokenAddress);
  const curveEvents = useCurveEvents(tokenAddress);

  return {
    curveSummary,
    dexSwaps,
    curveEvents,
    isLoading: curveSummary.isLoading || dexSwaps.isLoading || curveEvents.isLoading,
    error: curveSummary.error || dexSwaps.error || curveEvents.error,
  };
};

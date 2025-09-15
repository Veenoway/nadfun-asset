import { useQuery } from '@tanstack/react-query';
import { nadfunClient } from '@/lib/nadfun-client';

export interface TimeSeriesPoint {
  t: number;
  holders?: number;
  buys?: number;
  sells?: number;
  buy_volume?: number;
  sell_volume?: number;
  swaps?: number;
  volume_mon?: number;
  volume_token?: number;
  unique_traders?: number;
}

const useDexData = (token: string, timeframe: string, interval: string) => {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ['dexTimeseries', token, timeframe, interval],
    queryFn: async () => {
      // Get DEX swaps and convert to timeseries format
      const swaps = await nadfunClient.getDexSwaps(token);

      // For now, return a simple timeseries with total swaps
      // We can implement proper time-based aggregation later
      return [
        {
          t: Date.now(),
          swaps: swaps.length,
          unique_traders: new Set(swaps.map((s) => s.sender)).size,
        },
      ];
    },
    enabled: !!token && token.length === 42,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
};

export { useDexData };

import { useQuery } from '@tanstack/react-query';

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

const useHoldersHistory = (token: string, timeframe: string, interval: string) => {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ['holdersTimeseries', token, timeframe, interval],
    queryFn: () => {
      // Return empty data since we're not using the old backend API
      return [];
    },
    enabled: false, // Disabled since we're not using this data
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
};

export { useHoldersHistory };

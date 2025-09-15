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

export interface CurveSummary {
  buys_24h: number;
  sells_24h: number;
  buy_volume_24h: number;
  sell_volume_24h: number;
  unique_buyers_24h: number;
  unique_sellers_24h: number;
}

export const useCurveSummary = (token: string) => {
  return useQuery<CurveSummary>({
    queryKey: ['curveSummary', token],
    queryFn: () => {
      // Return empty data since we're not using the old backend API
      return {
        buys_24h: 0,
        sells_24h: 0,
        buy_volume_24h: 0,
        sell_volume_24h: 0,
        unique_buyers_24h: 0,
        unique_sellers_24h: 0,
      };
    },
    enabled: false, // Disabled since we're not using this data
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
};

export const useCurveTimeseries = (token: string, timeframe: string, interval: string) => {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ['curveTimeseries', token, timeframe, interval],
    queryFn: () => {
      // Return empty data since we're not using the old backend API
      return [];
    },
    enabled: false, // Disabled since we're not using this data
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
};

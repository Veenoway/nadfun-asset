import { useQuery } from '@tanstack/react-query';
import { getTradingAnalytics, TradingAnalytics } from '@/lib/trades-api';

export interface WalletGrowthData {
  time: string;
  value: number; // total unique traders at this time
  newWallets: number;
  departedWallets: number;
  growthRate: number;
}

export interface WalletGrowthStats {
  currentTotal: number;
  totalGrowth: number;
  averageGrowthRate: number;
  peakGrowth: number;
  totalNewWallets: number;
  totalDepartedWallets: number;
  retentionRate: number;
}

// Map frontend timeframes to API timeframes
const getApiTimeframe = (timeframe: string): string => {
  switch (timeframe) {
    case '5m':
      return '5min';
    case '1h':
      return '1h';
    case '6h':
      return '6h';
    case '24h':
      return '24h';
    default:
      return '5min';
  }
};

// Generate mock time series data based on analytics
const generateTimeSeriesData = (
  analytics: TradingAnalytics,
  timeframe: string,
): WalletGrowthData[] => {
  const timeLabels = getTimeLabels(timeframe);
  const totalUniqueTraders = analytics.uniqueBuyers + analytics.uniqueSellers;

  // Generate realistic time series data
  return timeLabels.map((time, index) => {
    const progress = index / (timeLabels.length - 1);
    const baseValue = Math.floor(totalUniqueTraders * (0.3 + 0.7 * progress));
    const newWallets = Math.floor(analytics.uniqueBuyers * 0.1 * (1 - progress));
    const departedWallets = Math.floor(analytics.uniqueSellers * 0.05 * progress);

    return {
      time,
      value: baseValue,
      newWallets,
      departedWallets,
      growthRate: newWallets > 0 ? ((newWallets - departedWallets) / baseValue) * 100 : 0,
    };
  });
};

// Get time labels based on timeframe
const getTimeLabels = (timeframe: string): string[] => {
  switch (timeframe) {
    case '5m':
      return ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
    case '10m':
      return ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'];
    case '1h':
      return [
        '00:00',
        '05:00',
        '10:00',
        '15:00',
        '20:00',
        '25:00',
        '30:00',
        '35:00',
        '40:00',
        '45:00',
        '50:00',
        '55:00',
      ];
    case '6h':
      return [
        '00:00',
        '10:00',
        '20:00',
        '30:00',
        '40:00',
        '50:00',
        '01:00',
        '01:10',
        '01:20',
        '01:30',
        '01:40',
        '01:50',
        '02:00',
        '02:10',
        '02:20',
        '02:30',
        '02:40',
        '02:50',
        '03:00',
        '03:10',
        '03:20',
        '03:30',
        '03:40',
        '03:50',
        '04:00',
        '04:10',
        '04:20',
        '04:30',
        '04:40',
        '04:50',
        '05:00',
        '05:10',
        '05:20',
        '05:30',
        '05:40',
        '05:50',
      ];
    case '24h':
      return [
        '00:00',
        '00:30',
        '01:00',
        '01:30',
        '02:00',
        '02:30',
        '03:00',
        '03:30',
        '04:00',
        '04:30',
        '05:00',
        '05:30',
        '06:00',
        '06:30',
        '07:00',
        '07:30',
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
        '21:30',
        '22:00',
        '22:30',
        '23:00',
        '23:30',
      ];
    default:
      return ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'];
  }
};

// Calculate wallet growth stats from analytics
const calculateWalletStats = (analytics: TradingAnalytics): WalletGrowthStats => {
  const totalUniqueTraders = analytics.uniqueBuyers + analytics.uniqueSellers;
  const totalGrowth = analytics.uniqueBuyers - analytics.uniqueSellers;
  const averageGrowthRate = totalUniqueTraders > 0 ? (totalGrowth / totalUniqueTraders) * 100 : 0;
  const peakGrowth = Math.max(averageGrowthRate, 0);
  const retentionRate =
    analytics.uniqueBuyers > 0
      ? ((analytics.uniqueBuyers - analytics.uniqueSellers) / analytics.uniqueBuyers) * 100
      : 0;

  return {
    currentTotal: totalUniqueTraders,
    totalGrowth,
    averageGrowthRate,
    peakGrowth,
    totalNewWallets: analytics.uniqueBuyers,
    totalDepartedWallets: analytics.uniqueSellers,
    retentionRate: Math.max(retentionRate, 0),
  };
};

export const useWalletGrowth = (timeFrame: string = '5m', contractAddress: string = '') => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<TradingAnalytics>({
    queryKey: ['walletGrowth', contractAddress, timeFrame, 'v1'],
    queryFn: () => getTradingAnalytics(contractAddress, timeFrame),
    enabled:
      !!contractAddress &&
      contractAddress.length >= 40 &&
      contractAddress.startsWith('0x') &&
      !!timeFrame,
    staleTime: 5000, // 5 seconds - data is fresh for only 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    refetchOnMount: true, // Always refetch when component mounts
  });

  const chartData = analytics ? generateTimeSeriesData(analytics, timeFrame) : [];
  const stats = analytics
    ? calculateWalletStats(analytics)
    : {
        currentTotal: 0,
        totalGrowth: 0,
        averageGrowthRate: 0,
        peakGrowth: 0,
        totalNewWallets: 0,
        totalDepartedWallets: 0,
        retentionRate: 0,
      };

  return {
    // Data
    chartData,
    stats,
    analytics,

    // State
    isLoading,
    error,
    isTracking: true, // Always tracking when data is available

    // Actions (stubs for compatibility)
    startTracking: () => {},
    stopTracking: () => {},

    // Time frame info
    timeFrame,
    timeIntervals: {
      interval: 30000,
      maxPoints: chartData.length,
      timeLabels: getTimeLabels(timeFrame),
    },
  };
};

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { TradingAnalytics, RawTrade } from '@/lib/trades-api';

interface TradingActivityChartProps {
  data: TradingAnalytics | null;
  rawTrades?: RawTrade[];
  isLoading: boolean;
  timeFrame: string;
  onTimeFrameChange: (timeframe: string) => void;
}

// Generate time series data from real trade data
const generateTradingActivityDataFromTrades = (rawTrades: RawTrade[], timeframe: string) => {
  if (!rawTrades || rawTrades.length === 0) {
    const timeLabels = getTimeLabels(timeframe);
    return timeLabels.map((time) => ({
      time,
      trades: 0,
      volume: 0,
    }));
  }

  const timeLabels = getTimeLabels(timeframe);
  const now = Math.floor(Date.now() / 1000);

  // Calculate time bucket size based on timeframe
  let bucketSize: number;
  switch (timeframe) {
    case '5m':
      bucketSize = 5 * 60; // 5 minutes
      break;
    case '10m':
      bucketSize = 10 * 60; // 10 minutes
      break;
    case '1h':
      bucketSize = 5 * 60; // 5 minutes for 1h view
      break;
    case '6h':
      bucketSize = 30 * 60; // 30 minutes
      break;
    case '24h':
      bucketSize = 60 * 60; // 1 hour
      break;
    default:
      bucketSize = 5 * 60;
  }

  // Create time buckets
  const buckets = timeLabels.map((_, index) => {
    const bucketStart = now - (timeLabels.length - index) * bucketSize;
    const bucketEnd = bucketStart + bucketSize;
    return { start: bucketStart, end: bucketEnd, time: timeLabels[index] };
  });

  // Process trades into buckets with detailed breakdown
  return buckets.map((bucket) => {
    const tradesInBucket = rawTrades.filter((trade) => {
      const tradeTime = parseInt(trade.timestamp);
      return tradeTime >= bucket.start && tradeTime < bucket.end;
    });

    const buyTrades = tradesInBucket.filter((trade) => trade.tradeType === 'BUY');
    const sellTrades = tradesInBucket.filter((trade) => trade.tradeType === 'SELL');

    const buyVolume = buyTrades.reduce((sum, trade) => {
      return sum + parseFloat(trade.monAmount) / 1e18;
    }, 0);

    const sellVolume = sellTrades.reduce((sum, trade) => {
      return sum + parseFloat(trade.monAmount) / 1e18;
    }, 0);

    const totalVolume = buyVolume + sellVolume;
    const uniqueTraders = new Set(tradesInBucket.map((trade) => trade.trader_id)).size;

    return {
      time: bucket.time,
      trades: tradesInBucket.length,
      volume: totalVolume,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      buyVolume: buyVolume,
      sellVolume: sellVolume,
      uniqueTraders: uniqueTraders,
      avgTradeSize: tradesInBucket.length > 0 ? totalVolume / tradesInBucket.length : 0,
    };
  });
};

// Fallback function for when we don't have raw trades
const generateTradingActivityData = (analytics: TradingAnalytics | null, timeframe: string) => {
  if (!analytics || analytics.totalTrades === 0) {
    const timeLabels = getTimeLabels(timeframe);
    return timeLabels.map((time) => ({
      time,
      trades: 0,
      volume: 0,
    }));
  }

  const timeLabels = getTimeLabels(timeframe);
  const totalTrades = analytics.totalTrades;
  const totalVolume = analytics.totalVolume;

  // Simple distribution for small trade counts
  if (totalTrades <= 10) {
    return timeLabels.map((time, index) => {
      const tradesInBucket = index < totalTrades ? 1 : 0;
      const volumeInBucket = index < totalTrades ? totalVolume / totalTrades : 0;

      return {
        time,
        trades: tradesInBucket,
        volume: volumeInBucket,
      };
    });
  }

  // For larger numbers, distribute evenly
  return timeLabels.map((time, index) => {
    const tradesInBucket =
      Math.floor(totalTrades / timeLabels.length) +
      (index < totalTrades % timeLabels.length ? 1 : 0);
    const volumeInBucket = totalVolume / timeLabels.length;

    return {
      time,
      trades: tradesInBucket,
      volume: volumeInBucket,
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

const DetailedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    const formatVolume = (volume: number) => {
      if (volume >= 1000000) {
        return `${(volume / 1000000).toFixed(2)}M MON`;
      } else if (volume >= 1000) {
        return `${(volume / 1000).toFixed(2)}K MON`;
      } else if (volume >= 1) {
        return `${volume.toFixed(2)} MON`;
      } else if (volume >= 0.01) {
        return `${volume.toFixed(4)} MON`;
      } else {
        return `${volume.toFixed(6)} MON`;
      }
    };

    const formatNumber = (num: number) => {
      return num.toLocaleString();
    };

    return (
      <div className="bg-gray-900 border border-purple-600/30 rounded-lg p-4 shadow-xl max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-purple-400" />
          <p className="text-purple-300 font-semibold text-sm">{label}</p>
        </div>

        <div className="space-y-2">
          {/* Total Trades */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Total Trades:</span>
            <span className="text-white font-semibold text-sm">
              {formatNumber(data.trades || 0)}
            </span>
          </div>

          {/* Buy vs Sell Trades */}
          {(data as any).buyTrades !== undefined && (data as any).sellTrades !== undefined && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 text-xs">Buy Trades:</span>
                <span className="text-emerald-400 font-semibold text-sm">
                  {formatNumber((data as any).buyTrades)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-xs">Sell Trades:</span>
                <span className="text-red-400 font-semibold text-sm">
                  {formatNumber((data as any).sellTrades)}
                </span>
              </div>
            </>
          )}

          {/* Volume Information */}
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Total Volume:</span>
              <span className="text-blue-400 font-semibold text-sm">
                {formatVolume(data.volume || 0)}
              </span>
            </div>

            {(data as any).buyVolume !== undefined && (data as any).sellVolume !== undefined && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 text-xs">Buy Volume:</span>
                  <span className="text-emerald-400 font-medium text-xs">
                    {formatVolume((data as any).buyVolume)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-400 text-xs">Sell Volume:</span>
                  <span className="text-red-400 font-medium text-xs">
                    {formatVolume((data as any).sellVolume)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Additional Metrics */}
          {(data as any).uniqueTraders !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Unique Traders:</span>
              <span className="text-purple-400 font-semibold text-sm">
                {formatNumber((data as any).uniqueTraders)}
              </span>
            </div>
          )}

          {(data as any).avgTradeSize !== undefined && (data as any).avgTradeSize > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Avg Trade Size:</span>
              <span className="text-gray-300 font-medium text-xs">
                {formatVolume((data as any).avgTradeSize)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const TradingActivityChart = ({
  data,
  rawTrades,
  isLoading,
  timeFrame,
  onTimeFrameChange,
}: TradingActivityChartProps) => {
  // Use real trade data if available, otherwise fall back to analytics data
  const chartData =
    rawTrades && rawTrades.length > 0
      ? generateTradingActivityDataFromTrades(rawTrades, timeFrame)
      : generateTradingActivityData(data, timeFrame);

  // Calculate comprehensive statistics
  const totalTrades = chartData.reduce((sum, d) => sum + d.trades, 0);
  const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);
  const peakTrades = chartData.length ? Math.max(...chartData.map((d) => d.trades)) : 0;
  const peakVolume = chartData.length ? Math.max(...chartData.map((d) => d.volume)) : 0;
  const avgTradesPerPeriod = chartData.length ? totalTrades / chartData.length : 0;
  const avgVolumePerPeriod = chartData.length ? totalVolume / chartData.length : 0;

  // Calculate buy/sell ratios if available
  const totalBuyTrades = chartData.reduce((sum, d) => sum + ((d as any).buyTrades || 0), 0);
  const totalSellTrades = chartData.reduce((sum, d) => sum + ((d as any).sellTrades || 0), 0);
  const buyRatio = totalTrades > 0 ? (totalBuyTrades / totalTrades) * 100 : 0;

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M MON`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K MON`;
    } else if (volume >= 1) {
      return `${volume.toFixed(2)} MON`;
    } else if (volume >= 0.01) {
      return `${volume.toFixed(4)} MON`;
    } else {
      return `${volume.toFixed(6)} MON`;
    }
  };

  return (
    <div className="chart-container">
      {/* Header with enhanced information */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Trading Activity</h3>
          <p className="text-purple-300 text-sm">Real-time trades & volume analysis</p>
        </div>
        <div className="flex gap-1">
          {['5m', '10m', '1h', '6h', '24h'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeFrameChange(tf)}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                timeFrame === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-purple-300 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-3">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Total Trades</span>
          </div>
          <div className="text-lg font-semibold text-white">{totalTrades.toLocaleString()}</div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Total Volume</span>
          </div>
          <div className="text-lg font-semibold text-white">{formatVolume(totalVolume)}</div>
        </div>
      </div>

      {/* Enhanced Chart */}
      <div className="h-56 mb-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={9} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={9} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={9} />
              <Tooltip content={<DetailedTooltip />} />

              {/* Volume as bars */}
              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Volume"
              />

              {/* Trades as line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="trades"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 2 }}
                name="Trades"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="space-y-2 pt-2">
        {/* Peak Values */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-purple-300">Peak Trades:</span>
            <span className="text-emerald-400 font-semibold">{peakTrades.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-purple-300">Peak Volume:</span>
            <span className="text-blue-400 font-semibold">{formatVolume(peakVolume)}</span>
          </div>
        </div>

        {/* Averages */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Avg Trades/Period:</span>
            <span className="text-gray-300 font-medium">{avgTradesPerPeriod.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Avg Volume/Period:</span>
            <span className="text-gray-300 font-medium">{formatVolume(avgVolumePerPeriod)}</span>
          </div>
        </div>

        {/* Buy/Sell Ratio */}
        {totalBuyTrades > 0 && totalSellTrades > 0 && (
          <div className="flex justify-between items-center text-xs pt-1 border-t border-purple-600/20">
            <span className="text-purple-300">Buy/Sell Ratio:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium">{buyRatio.toFixed(1)}%</span>
              <span className="text-gray-400">/</span>
              <span className="text-red-400 font-medium">{(100 - buyRatio).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { TradingActivityChart };

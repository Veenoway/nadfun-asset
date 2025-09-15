import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCurveEvents, useDexSwaps } from '@/hooks/analytics/useNadfunData';
import { useMemo } from 'react';

interface TradingVelocityChartProps {
  tokenAddress: string | null;
  timeframe: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="holo-card p-4 border border-purple-400/30">
        <p className="text-purple-400 font-medium">{label}</p>
        <p className="text-white">
          Transactions: <span className="gradient-text font-bold">{payload[0].value}</span>
        </p>
        <p className="text-cyan-400">
          Momentum: <span className="font-bold">{payload[1].value.toFixed(2)}x</span>
        </p>
      </div>
    );
  }
  return null;
};

const TradingVelocityChart = ({ tokenAddress, timeframe }: TradingVelocityChartProps) => {
  const { data: curveEvents, isLoading: curveLoading } = useCurveEvents(tokenAddress);
  const { data: dexSwaps, isLoading: dexLoading } = useDexSwaps(tokenAddress);

  const chartData = useMemo(() => {
    if (!curveEvents && !dexSwaps) return [];

    // Combine all events
    const allEvents = [...(curveEvents || []), ...(dexSwaps || [])];

    if (allEvents.length === 0) return [];

    // Group events by hour
    const hourlyData: { [key: string]: number } = {};

    allEvents.forEach((event) => {
      const timestamp = event.blockNumber; // We'll need to convert this to actual time
      const hour = new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    // Convert to chart format
    const data = Object.entries(hourlyData)
      .map(([time, txCount]) => ({
        time,
        txCount,
        momentum: txCount > 10 ? 1.2 : txCount > 5 ? 0.8 : 0.4,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return data.length > 0
      ? data
      : [
          { time: '00:00', txCount: 0, momentum: 0 },
          { time: '06:00', txCount: 0, momentum: 0 },
          { time: '12:00', txCount: 0, momentum: 0 },
          { time: '18:00', txCount: 0, momentum: 0 },
          { time: '24:00', txCount: 0, momentum: 0 },
        ];
  }, [curveEvents, dexSwaps]);

  const isLoading = curveLoading || dexLoading;

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="gradient-text text-xl font-bold">Trading Velocity</h3>
            <p className="text-gray-400 text-sm">Transaction count per timeframe</p>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-gray-400">Loading trading data...</div>
        </div>
      </div>
    );
  }

  const totalTransactions = chartData.reduce((sum, item) => sum + item.txCount, 0);
  const hasActivity = totalTransactions > 0;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="gradient-text text-xl font-bold">Trading Velocity</h3>
          <p className="text-gray-400 text-sm">Transaction count per timeframe</p>
        </div>
        <div
          className={`pulse-glow px-3 py-1 rounded-full ${
            hasActivity
              ? 'bg-purple-500/20 border-purple-500/30'
              : 'bg-gray-500/20 border-gray-500/30'
          } border`}
        >
          <span
            className={`text-sm font-medium ${hasActivity ? 'text-purple-400' : 'text-gray-400'}`}
          >
            {hasActivity ? '⚡ High Volume' : '📊 No Activity'}
          </span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="txGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="txCount"
              stroke="url(#txGradient)"
              strokeWidth={3}
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="momentum"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 text-center">
        <div className="text-gray-400 text-sm">
          Total Transactions: <span className="gradient-text font-bold">{totalTransactions}</span>
        </div>
        <div className="text-gray-500 text-xs mt-1">
          {curveEvents?.length || 0} curve events, {dexSwaps?.length || 0} DEX swaps
        </div>
      </div>
    </div>
  );
};

export { TradingVelocityChart };

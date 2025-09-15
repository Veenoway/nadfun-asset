import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { Loader2, Users, TrendingUp, UserPlus, UserMinus, Activity } from 'lucide-react';
import { WalletGrowthData } from '@/hooks/analytics/useWalletGrowth';

interface WalletGrowthChartProps {
  data: WalletGrowthData[];
  isLoading: boolean;
  timeFrame: string;
  onTimeFrameChange: (timeframe: string) => void;
}

const DetailedWalletTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    const formatNumber = (num: number) => {
      return num.toLocaleString();
    };

    const netGrowth = (data.newWallets || 0) - (data.departedWallets || 0);
    const growthRate = data.value > 0 ? ((data.newWallets || 0) / data.value) * 100 : 0;

    return (
      <div className="bg-gray-900 border border-purple-600/30 rounded-lg p-4 shadow-xl max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-purple-400" />
          <p className="text-purple-300 font-semibold text-sm">{label}</p>
        </div>

        <div className="space-y-2">
          {/* Total Wallets */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Total Wallets:</span>
            <span className="text-white font-semibold text-sm">
              {formatNumber(data.value || 0)}
            </span>
          </div>

          {/* New Wallets */}
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 text-xs">New Wallets:</span>
            <span className="text-emerald-400 font-semibold text-sm">
              +{formatNumber(data.newWallets || 0)}
            </span>
          </div>

          {/* Departed Wallets */}
          <div className="flex justify-between items-center">
            <span className="text-red-400 text-xs">Departed Wallets:</span>
            <span className="text-red-400 font-semibold text-sm">
              -{formatNumber(data.departedWallets || 0)}
            </span>
          </div>

          {/* Net Growth */}
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Net Growth:</span>
              <span
                className={`font-semibold text-sm ${netGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {netGrowth >= 0 ? '+' : ''}
                {formatNumber(netGrowth)}
              </span>
            </div>

            {/* Growth Rate */}
            {data.value > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Growth Rate:</span>
                <span className="text-purple-400 font-medium text-xs">
                  {growthRate.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Additional Insights */}
          {data.newWallets > 0 && data.departedWallets > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-gray-700">
              <span className="text-gray-400 text-xs">Retention:</span>
              <span className="text-gray-300 font-medium text-xs">
                {((data.newWallets / (data.newWallets + data.departedWallets)) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const WalletGrowthChart = ({
  data,
  isLoading,
  timeFrame,
  onTimeFrameChange,
}: WalletGrowthChartProps) => {
  // Calculate comprehensive statistics
  const totalWallets = data.length > 0 ? data[data.length - 1]?.value || 0 : 0;
  const totalNewWallets = data.reduce((sum, d) => sum + (d.newWallets || 0), 0);
  const totalDepartedWallets = data.reduce((sum, d) => sum + (d.departedWallets || 0), 0);
  const netGrowth = totalNewWallets - totalDepartedWallets;
  const peakWallets = data.length ? Math.max(...data.map((d) => d.value || 0)) : 0;
  const peakNewWallets = data.length ? Math.max(...data.map((d) => d.newWallets || 0)) : 0;
  const avgGrowthRate = data.length > 0 ? totalNewWallets / data.length : 0;
  const retentionRate =
    totalNewWallets > 0 ? ((totalNewWallets - totalDepartedWallets) / totalNewWallets) * 100 : 0;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="chart-container">
      {/* Header with enhanced information */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">Wallet Growth Tracker</h3>
          <p className="text-purple-300 text-sm">Wallet acquisition & retention analysis</p>
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
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Total Uniqe Wallets</span>
          </div>
          <div className="text-lg font-semibold text-white">{formatNumber(totalWallets)}</div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Net Growth</span>
          </div>
          <div
            className={`text-lg font-semibold ${netGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {netGrowth >= 0 ? '+' : ''}
            {formatNumber(netGrowth)}
          </div>
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
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalWalletsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="newWalletsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="departedWalletsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip
                content={<DetailedWalletTooltip />}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />

              {/* Total wallets as main area */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalWalletsGradient)"
              />

              {/* New wallets as bars */}
              <Bar dataKey="newWallets" fill="#10b981" fillOpacity={0.4} name="New Wallets" />

              {/* Departed wallets as bars */}
              <Bar
                dataKey="departedWallets"
                fill="#ef4444"
                fillOpacity={0.4}
                name="Departed Wallets"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="space-y-1.5 pt-2">
        {/* Peak Values */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span className="text-purple-300">Peak Wallets:</span>
            <span className="text-purple-400 font-semibold">{formatNumber(peakWallets)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-purple-300">Peak New:</span>
            <span className="text-emerald-400 font-semibold">{formatNumber(peakNewWallets)}</span>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <UserPlus className="w-3 h-3 text-emerald-400" />
            <span className="text-purple-300">Total New:</span>
            <span className="text-emerald-400 font-medium">{formatNumber(totalNewWallets)}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserMinus className="w-3 h-3 text-red-400" />
            <span className="text-purple-300">Total Departed:</span>
            <span className="text-red-400 font-medium">{formatNumber(totalDepartedWallets)}</span>
          </div>
        </div>

        {/* Retention & Growth Rate */}
        <div className="flex justify-between items-center text-xs pt-1 border-t border-purple-600/20">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Retention Rate:</span>
            <span className="text-gray-300 font-medium">{retentionRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Avg Growth:</span>
            <span className="text-gray-300 font-medium">{avgGrowthRate.toFixed(1)}/period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { WalletGrowthChart };

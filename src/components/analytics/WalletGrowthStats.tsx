import { Users, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { WalletGrowthStats } from '@/hooks/analytics/useWalletGrowth';

interface WalletGrowthStatsProps {
  stats: WalletGrowthStats;
  isLoading: boolean;
  isTracking: boolean;
}

const WalletGrowthStatsComponent = ({ stats, isLoading, isTracking }: WalletGrowthStatsProps) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Wallet Growth Stats</h3>
        </div>
        <div className="text-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400 mx-auto mb-2" />
          <div className="text-gray-400 text-sm">Loading growth data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Wallet Growth Stats</h3>
          {isTracking && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-700/30 rounded p-2 text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-xs text-blue-400 mb-1">Total Growth</div>
          <div className="text-sm font-bold text-white">
            {stats.totalGrowth >= 0 ? '+' : ''}
            {stats.totalGrowth}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded p-2 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
          <div className="text-xs text-green-400 mb-1">Avg Growth</div>
          <div className="text-sm font-bold text-white">{stats.averageGrowthRate.toFixed(2)}%</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-2 pt-2 border-t border-gray-600/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Current Total:</span>
          <span className="text-white font-medium">{stats.currentTotal.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">New Wallets:</span>
          <span className="text-green-400 font-medium">+{stats.totalNewWallets}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Departed Wallets:</span>
          <span className="text-red-400 font-medium">-{stats.totalDepartedWallets}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Peak Growth:</span>
          <span className="text-yellow-400 font-medium">{stats.peakGrowth.toFixed(2)}%</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Retention Rate:</span>
          <span className="text-purple-400 font-medium">{stats.retentionRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 pt-2 border-t border-gray-600/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Status:</span>
          <span className={`font-medium ${isTracking ? 'text-green-400' : 'text-gray-400'}`}>
            {isTracking ? 'Live Tracking' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

export { WalletGrowthStatsComponent };

import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Loader2,
  AlertCircle,
  Timer,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAverageHoldingTime } from '@/hooks/analytics/useAverageHoldingTime';

interface AvgHoldingTimeProps {
  tokenAddress?: string;
  timeframe?: string;
}

const AvgHoldingTime = ({ tokenAddress = '', timeframe = '24h' }: AvgHoldingTimeProps) => {
  const { data: holdingTimeData, isLoading, error } = useAverageHoldingTime(tokenAddress);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 text-sm">Error loading data</p>
        <p className="text-gray-400 text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  if (!tokenAddress) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <p className="text-yellow-400 text-sm">No token address</p>
        <p className="text-gray-400 text-xs mt-1">
          Enter a token address to see holding time analysis
        </p>
      </div>
    );
  }

  if (!holdingTimeData || holdingTimeData.total_holders === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
        <p className="text-blue-400 text-sm">No holding data</p>
        <p className="text-gray-400 text-xs mt-1">No transfer history found for this token</p>
      </div>
    );
  }

  const getHoldingTrend = (seconds: number) => {
    if (seconds < 3600) return { trend: 'Short', color: 'text-red-400', icon: TrendingDown };
    if (seconds < 86400) return { trend: 'Medium', color: 'text-yellow-400', icon: Activity };
    return { trend: 'Long', color: 'text-green-400', icon: TrendingUp };
  };

  const overallTrend = getHoldingTrend(holdingTimeData.avg_hold_time_seconds_overall);
  const TrendIcon = overallTrend.icon;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Avg Holding Time</h3>
          <p className="text-purple-300 text-sm">Historical holding behavior analysis</p>
        </div>
        <div className="flex items-center gap-1">
          <Timer className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300">All Time</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 border border-purple-500/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">Overall Avg</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {holdingTimeData.avg_hold_time_formatted_overall}
          </div>
        </div>
        <div className="bg-gray-800 border border-emerald-500/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">Current Avg</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {holdingTimeData.avg_hold_time_formatted_current}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-gray-800 border border-orange-500/20 rounded-md p-2 mb-4">
        <div className="flex items-center gap-1 mb-1">
          <Activity className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-orange-400">Exited Avg</span>
        </div>
        <div className="text-sm font-semibold text-white">
          {holdingTimeData.avg_hold_time_formatted_exited}
        </div>
      </div>

      {/* Holder Distribution */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span className="text-purple-300">Total Holders:</span>
            <span className="text-purple-400 font-semibold">{holdingTimeData.total_holders}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-purple-300">Current:</span>
            <span className="text-emerald-400 font-semibold">
              {holdingTimeData.total_current_holders}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <span className="text-purple-300">Exited:</span>
            <span className="text-orange-400 font-semibold">
              {holdingTimeData.total_exited_holders}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Retention:</span>
            <span className="text-gray-300 font-medium">
              {holdingTimeData.total_holders > 0
                ? Math.round(
                    (holdingTimeData.total_current_holders / holdingTimeData.total_holders) * 100,
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="mt-4 pt-3 border-t border-purple-600/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendIcon className={`w-3 h-3 ${overallTrend.color}`} />
            <span className="text-sm text-purple-300">
              <span className={overallTrend.color}>{overallTrend.trend}</span> term holding
            </span>
          </div>
          <div
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              overallTrend.trend === 'Long'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : overallTrend.trend === 'Medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {overallTrend.trend} Term
          </div>
        </div>
      </div>

      {/* Comparison Insight */}
      <div className="mt-3 p-2 bg-gray-800/50 border border-gray-600/20 rounded-md">
        <div className="text-xs text-gray-300">
          {holdingTimeData.avg_hold_time_seconds_current >
          holdingTimeData.avg_hold_time_seconds_exited ? (
            <span className="text-emerald-400">
              Current holders are more committed than past holders
            </span>
          ) : holdingTimeData.avg_hold_time_seconds_current <
            holdingTimeData.avg_hold_time_seconds_exited ? (
            <span className="text-orange-400">Past holders held longer than current holders</span>
          ) : (
            <span className="text-gray-400">Similar holding patterns across all holders</span>
          )}
        </div>
      </div>
    </>
  );
};

export { AvgHoldingTime };

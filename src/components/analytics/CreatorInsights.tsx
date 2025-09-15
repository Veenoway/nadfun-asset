import { useState } from 'react';
import {
  User,
  Trophy,
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  Star,
  Package,
  Target,
  BarChart3,
} from 'lucide-react';
import { useTokenAndCreatorTokens } from '@/hooks/analytics/useTokenAndCreatorTokens';
import { useTokenMetadata } from '@/hooks/analytics/useTokenMetadata';
import {
  useMultipleMarketData,
  calculateMarketCap,
  formatMarketCap,
} from '@/hooks/analytics/useMultipleMarketData';
import { Loader2 } from 'lucide-react';

interface CreatorInsightsProps {
  tokenAddress?: string;
}

// Helper functions
const getTokenStatus = (token: any) => {
  if (!token.trades || token.trades.length === 0) {
    return {
      status: 'bonding',
      label: 'Bonding Phase',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    };
  }

  const lastTrade = token.trades[0];
  if (lastTrade.source === 'DEXRouter') {
    return {
      status: 'listed',
      label: 'DEX Listed',
      color: 'text-green-400 bg-green-500/20 border-green-500/30',
    };
  } else if (lastTrade.source === 'Bonding Curve') {
    return {
      status: 'bonding',
      label: 'Bonding Phase',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    };
  }

  return {
    status: 'unknown',
    label: 'Unknown',
    color: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
  };
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Token Avatar Component with metadata
const TokenAvatar = ({
  tokenId,
  symbol,
  fallback,
}: {
  tokenId: string;
  symbol: string;
  fallback: string;
}) => {
  const { data: metadata, isLoading } = useTokenMetadata(tokenId);

  if (isLoading) {
    return (
      <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center">
        <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
      </div>
    );
  }

  const imageUrl = metadata?.token_metadata?.image_uri;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={symbol}
        className="w-6 h-6 rounded-full object-cover"
        onError={(e) => {
          // Fallback to symbol if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-purple-400">${symbol[0]}</span></div>`;
          }
        }}
      />
    );
  }

  // Fallback to symbol
  return (
    <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center">
      <span className="text-xs font-bold text-purple-400">{symbol[0]}</span>
    </div>
  );
};

const CreatorInsights = ({ tokenAddress = '' }: CreatorInsightsProps) => {
  const { data: tokenAndCreatorData, isLoading, error } = useTokenAndCreatorTokens(tokenAddress);
  const [showAllTokens, setShowAllTokens] = useState(false);

  // Get all token IDs for market data fetching
  const allTokenIds = tokenAndCreatorData?.data?.creatorTokens?.map((token) => token.id) || [];
  const { data: marketData, isLoading: isMarketDataLoading } = useMultipleMarketData(allTokenIds);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !tokenAndCreatorData?.data?.tokenInfo || !tokenAndCreatorData?.data?.creatorTokens) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 text-sm">Failed to load creator data</p>
        <p className="text-gray-400 text-xs mt-1">
          Enter a valid token address to see creator insights
        </p>
      </div>
    );
  }

  const currentToken = tokenAndCreatorData.data.tokenInfo[0];
  const creatorTokens = tokenAndCreatorData.data.creatorTokens;
  const creatorAddress = currentToken.creator.id;

  const totalTokens = creatorTokens.length;
  const listedTokens = creatorTokens.filter(
    (token) => getTokenStatus(token).status === 'listed',
  ).length;
  const bondingTokens = creatorTokens.filter(
    (token) => getTokenStatus(token).status === 'bonding',
  ).length;

  const statusData = [
    { name: 'DEX Listed', value: listedTokens, color: '#10B981' },
    { name: 'Bonding Phase', value: bondingTokens, color: '#F59E0B' },
  ];

  const successRate = totalTokens > 0 ? Math.round((listedTokens / totalTokens) * 100) : 0;

  return (
    <div className="h-full max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Creator Insights</h3>
          <p className="text-purple-300 text-sm">Creator Created Tokens analysis</p>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300 font-mono">{formatAddress(creatorAddress)}</span>
        </div>
      </div>

      {/* Compact Creator Stats */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        <div className="bg-gray-800 border border-purple-500/20 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Package className="w-2.5 h-2.5 text-purple-400" />
            <span className="text-xs text-purple-400">Total</span>
          </div>
          <div className="text-sm font-semibold text-white">{totalTokens}</div>
        </div>
        <div className="bg-gray-800 border border-emerald-500/20 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Target className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">Listed</span>
          </div>
          <div className="text-sm font-semibold text-white">{listedTokens}</div>
        </div>
        <div className="bg-gray-800 border border-yellow-500/20 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-2.5 h-2.5 text-yellow-400" />
            <span className="text-xs text-yellow-400">Bonding</span>
          </div>
          <div className="text-sm font-semibold text-white">{bondingTokens}</div>
        </div>
      </div>

      {/* Compact Success Rate */}
      <div className="mb-3">
        <div className="bg-gray-800 border border-purple-500/20 rounded-md p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-semibold text-white">Success Rate</span>
            </div>
            <span className="text-sm font-bold text-purple-400">{successRate}%</span>
          </div>

          {/* Compact Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>

          {/* Compact Breakdown */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-400">{listedTokens} listed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              <span className="text-yellow-400">{bondingTokens} bonding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Creator's Portfolio */}
      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Portfolio</h4>
            <span className="text-xs text-purple-300 bg-purple-600/20 px-2 py-0.5 rounded-full">
              {totalTokens} tokens
            </span>
          </div>
          {totalTokens > 5 && (
            <button
              onClick={() => setShowAllTokens(!showAllTokens)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-600/10 px-2 py-1 rounded-md border border-purple-500/20"
            >
              {showAllTokens ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>
        <div
          className={`overflow-y-auto space-y-2 flex-1 relative ${showAllTokens ? 'max-h-64' : 'max-h-40'}`}
        >
          {(showAllTokens ? creatorTokens : creatorTokens.slice(0, 5)).map((token) => {
            const status = getTokenStatus(token);
            const isCurrentToken = token.id === currentToken.id;
            const tokenMarketData = marketData?.[token.id];
            const marketCap = tokenMarketData
              ? calculateMarketCap(tokenMarketData.price, tokenMarketData.total_supply)
              : 0;
            const formattedMarketCap = formatMarketCap(marketCap);

            return (
              <div
                key={token.id}
                className={`rounded-md p-2 border transition-all duration-200 ${
                  isCurrentToken
                    ? 'bg-purple-600/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-gray-800 border-purple-600/20 hover:border-purple-500/30 hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <TokenAvatar
                        tokenId={token.id}
                        symbol={token.symbol}
                        fallback={token.symbol[0]}
                      />
                      {isCurrentToken && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1">
                        {token.name}
                        {isCurrentToken && (
                          <span className="text-xs text-yellow-400 bg-yellow-500/20 px-1 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-purple-300 font-mono">
                        {formatAddress(token.id)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}
                    >
                      {status.label}
                    </span>
                    {isMarketDataLoading ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-emerald-400 font-medium">
                          {formattedMarketCap}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Created {formatTimestamp(token.creationTimestamp)}</span>
                  </div>
                  {token.trades && token.trades.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" />
                      <span>Last: {formatTimestamp(token.trades[0].timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Gradient fade indicator */}
          {showAllTokens && creatorTokens.length > 8 && (
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
          )}
        </div>
        {!showAllTokens && totalTokens > 5 && (
          <div className="text-center pt-2 border-t border-purple-600/20">
            <span className="text-xs text-purple-300">Showing 5 of {totalTokens} tokens</span>
          </div>
        )}
      </div>

      {/* Compact Summary Stats */}
      <div className="mt-3 pt-2 border-t border-purple-600/20">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">{totalTokens} tokens</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-emerald-400 font-medium">{successRate}% success</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CreatorInsights };

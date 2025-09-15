import { useState, useMemo } from 'react';
import { useTopTokenHolders } from '@/hooks/analytics/useTokenHolders';
import { formatWalletAddress, formatBalance } from '@/lib/api';
import {
  Users,
  Loader2,
  AlertCircle,
  Crown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';

interface TokenHoldersListProps {
  tokenId?: string;
}

const TokenHoldersList = ({ tokenId = '' }: TokenHoldersListProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'whales'>('all');
  const { holders, isLoading, error } = useTopTokenHolders(tokenId);

  // Calculate summary stats
  const totalHolders = holders?.length || 0;
  const totalSupply = holders?.reduce((sum, h) => sum + Number(h.balance), 0) || 0;
  const top10Holders = holders?.slice(0, 10).reduce((sum, h) => sum + Number(h.balance), 0) || 0;
  const whaleCount = holders?.filter((h) => Number(h.balance) > 1000000).length || 0;

  // Filter holders based on type
  const filteredHolders = useMemo(() => {
    if (!holders) return [];
    if (filterType === 'whales') {
      return holders.filter((h) => Number(h.balance) > 1000000);
    }
    return holders;
  }, [holders, filterType]);

  // Mock data for enhanced holder information
  const enhancedHolders = useMemo(() => {
    if (!holders) return [];
    return holders.map((holder, index) => ({
      ...holder,
      rank: index + 1,
      whaleType:
        Number(holder.balance) > 1000000
          ? 'Whale'
          : Number(holder.balance) > 100000
            ? 'Large'
            : 'Medium',
      isWhale: Number(holder.balance) > 1000000,
      change24h: { type: 'increase' as const, value: '+2.3%' },
      lastActivity: '2 hours ago',
      txCount: Math.floor(Math.random() * 50) + 5,
      avgTxSize: Math.floor(Math.random() * 10000) + 1000,
    }));
  }, [holders]);

  const formatPercentage = (value: number) => {
    if (value >= 1) return `${value.toFixed(2)}%`;
    if (value >= 0.1) return `${value.toFixed(3)}%`;
    return `${value.toFixed(4)}%`;
  };

  const getWhaleIcon = (holder: any) => {
    if (holder.isWhale) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (holder.isLargeHolder) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (holder.isMediumHolder) return <TrendingDown className="w-4 h-4 text-blue-400" />;
    return <Users className="w-4 h-4 text-gray-400" />;
  };

  const getHolderBadge = (holder: any) => {
    if (holder.isWhale) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (holder.isLargeHolder) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (holder.isMediumHolder) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 lg:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white mb-1">Top Token Holders</h2>
            <p className="text-gray-400 text-xs">Comprehensive holder analytics</p>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="h-16 bg-gray-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 lg:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white mb-1">Top Token Holders</h2>
            <p className="text-gray-400 text-xs">Comprehensive holder analytics</p>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Error</span>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Failed to load token holders</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header - More Compact */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Holders</h3>
          <p className="text-gray-400 text-xs">Token distribution & whale tracking</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 text-xs rounded ${
              filterType === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('whales')}
            className={`px-2 py-1 text-xs rounded ${
              filterType === 'whales'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Whales
          </button>
        </div>
      </div>

      {/* Summary Stats - Compact */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Total</div>
          <div className="text-sm font-bold text-white">{filteredHolders.length}</div>
        </div>
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Top 10%</div>
          <div className="text-sm font-bold text-cyan-400">
            {Math.round((top10Holders / totalHolders) * 100)}%
          </div>
        </div>
        <div className="bg-gray-700/50 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Whales</div>
          <div className="text-sm font-bold text-purple-400">{whaleCount}</div>
        </div>
      </div>

      {/* Holders List - Compact */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {isLoading ? (
          // Loading skeleton - more compact
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex items-center gap-3 p-2 bg-gray-700/30 rounded animate-pulse"
            >
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-600 rounded w-20 mb-1"></div>
                <div className="h-2 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="w-16 h-4 bg-gray-600 rounded"></div>
            </div>
          ))
        ) : error ? (
          <div className="text-center p-4 text-red-400 text-sm">Failed to load holders data</div>
        ) : (
          filteredHolders.slice(0, 8).map((holder, index) => (
            <div
              key={holder.address}
              className="flex items-center gap-3 p-2 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors"
            >
              {/* Rank & Icon */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                {Number(holder.balance) > 1000000 && (
                  <div className="w-4 h-4 text-purple-400">🐋</div>
                )}
              </div>

              {/* Address & Balance */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {formatWalletAddress(holder.address)}
                </div>
                <div className="text-xs text-gray-400">{formatBalance(holder.balance)} tokens</div>
              </div>

              {/* Percentage */}
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400">
                  {totalSupply > 0
                    ? ((Number(holder.balance) / totalSupply) * 100).toFixed(2)
                    : '0.00'}
                  %
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Concentration Warning - Compact */}
      {top10Holders > totalHolders * 0.5 && (
        <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-400 font-medium">High Concentration</span>
          </div>
          <p className="text-xs text-orange-300 mt-1">
            Top 10 holders control {((top10Holders / totalHolders) * 100).toFixed(1)}% of supply
          </p>
        </div>
      )}

      {/* Show More Toggle - Compact */}
      <div className="mt-3 text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {showDetails ? 'Show Less' : 'Show More Details'}
        </button>
      </div>
    </>
  );
};

export { TokenHoldersList };

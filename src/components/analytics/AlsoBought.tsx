import { useState } from 'react';
import {
  TrendingUp,
  Users,
  Activity,
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
} from 'lucide-react';
import { useAlsoBought } from '@/hooks/analytics/useAlsoBought';
import { useTokenMetadata } from '@/hooks/analytics/useTokenMetadata';

interface AlsoBoughtProps {
  tokenAddress?: string;
}

const AlsoBought = ({ tokenAddress = '' }: AlsoBoughtProps) => {
  const { data: alsoBoughtData, isLoading, error } = useAlsoBought(tokenAddress);
  const [showAllTokens, setShowAllTokens] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !alsoBoughtData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 text-sm">Failed to load data</p>
        <p className="text-gray-400 text-xs mt-1">Enter a valid token address</p>
      </div>
    );
  }

  const alsoBoughtTokens = alsoBoughtData.data || [];
  const totalHolders = alsoBoughtData.total_holders || 0;
  const analyzedHolders = alsoBoughtData.analyzed_holders || 0;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    } else {
      return volume.toFixed(2);
    }
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

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Also Bought</h3>
          <p className="text-purple-300 text-sm">Tokens bought by holders (last 24h)</p>
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300">{alsoBoughtTokens.length} tokens</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 border border-purple-500/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <Users className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">Analyzed</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {analyzedHolders}/{totalHolders}
          </div>
        </div>
        <div className="bg-gray-800 border border-emerald-500/20 rounded-md p-2">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400">Volume</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatVolume(alsoBoughtTokens.reduce((sum, token) => sum + token.wmon_volume, 0))} WMON
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-2">
        {alsoBoughtTokens.length === 0 ? (
          <div className="text-center py-6">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No tokens bought by holders found</p>
            <p className="text-gray-500 text-xs mt-1">Try again later or check a different token</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">
                Also Bought ({alsoBoughtTokens.length})
              </h4>
              {alsoBoughtTokens.length > 5 && (
                <button
                  onClick={() => setShowAllTokens(!showAllTokens)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showAllTokens ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            <div className={`overflow-y-auto space-y-2 ${showAllTokens ? 'max-h-64' : 'max-h-40'}`}>
              {(showAllTokens ? alsoBoughtTokens : alsoBoughtTokens.slice(0, 5)).map(
                (tokenData) => {
                  return (
                    <div
                      key={tokenData.token.id}
                      className="bg-gray-800 border border-purple-600/20 rounded-md p-2 hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TokenAvatar
                            tokenId={tokenData.token.id}
                            symbol={tokenData.token.symbol}
                            fallback={tokenData.token.symbol[0]}
                          />
                          <div>
                            <div className="text-xs font-medium text-white">
                              {tokenData.token.name}
                            </div>
                            <div className="text-xs text-purple-300 font-mono">
                              {formatAddress(tokenData.token.id)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-emerald-400 font-medium">
                            {formatVolume(tokenData.wmon_volume)} WMON
                          </span>
                          <span className="text-xs text-gray-400">
                            {tokenData.holders_count} holders
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{tokenData.holders_count} mutual holders</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{formatVolume(tokenData.wmon_volume)} WMON</span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            {!showAllTokens && alsoBoughtTokens.length > 5 && (
              <div className="text-center pt-2 border-t border-purple-600/20">
                <span className="text-xs text-purple-300">
                  Showing 5 of {alsoBoughtTokens.length} tokens
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-purple-600/20">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Total Volume:</span>
            <span className="text-white font-medium">
              {formatVolume(alsoBoughtTokens.reduce((sum, token) => sum + token.wmon_volume, 0))}{' '}
              WMON
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-purple-300">Diversity:</span>
            <span className="text-emerald-400 font-medium">{alsoBoughtTokens.length} tokens</span>
          </div>
        </div>
      </div>
    </>
  );
};

export { AlsoBought };

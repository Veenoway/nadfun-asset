'use client';

import { useState, useMemo } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, Loader2, DollarSign, X } from 'lucide-react';
import { DrawerClose } from '@/components/ui/drawer';

import { useTokenHoldersStats } from '@/hooks/analytics/useTokenHolders';
import { useWalletGrowth } from '@/hooks/analytics/useWalletGrowth';
import { useHoldersHistory } from '@/hooks/analytics/useHoldersHistory';
import { useRawTrades } from '@/hooks/analytics/useRawTrades';
import { useRawTradesData } from '@/hooks/analytics/useRawTradesData';
import { useMarketData } from '@/hooks/analytics/useMarketData';
import { useTokenMetadata } from '@/hooks/analytics/useTokenMetadata';
import {
  AlsoBought,
  AvgHoldingTime,
  CreatorInsights,
  TradingActivityChart,
  WalletGrowthChart,
} from '@/components/analytics';

interface ParentProps {
  tokenAddress: string;
}

const Parent = ({ tokenAddress }: ParentProps) => {
  const [timeFrame, setTimeFrame] = useState('5m');
  const [walletGrowthTimeFrame, setWalletGrowthTimeFrame] = useState('5m');
  const [buySellTimeFrame, setBuySellTimeFrame] = useState('5m');
  const [tradingActivityTimeFrame, setTradingActivityTimeFrame] = useState('5m');
  const [token, setToken] = useState(tokenAddress); // Default token for testing

  const {
    totalHolders,
    newHolders,
    isLoading: holdersLoading,
    error: holdersError,
  } = useTokenHoldersStats(token, timeFrame);
  const { chartData: walletGrowthData, isLoading: growthLoading } = useWalletGrowth(
    walletGrowthTimeFrame,
    token,
  );
  const holdersInterval = timeFrame === '7d' ? '4h' : timeFrame === '24h' ? '2h' : '1h';
  const { data: holdersSeries } = useHoldersHistory(token, timeFrame, holdersInterval);

  // Map timeFrame to API format
  const getApiTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case '5m':
        return '5min';
      case '10m':
        return '10min';
      case '1h':
        return '1h';
      case '6h':
        return '6h';
      case '24h':
        return '24h';
      case '7d':
        return '7d';
      case '30d':
        return '30d';
      default:
        return '24h';
    }
  };

  // Get raw trades data for the selected timeframe (Buy/Sell Analytics)
  const {
    data: buySellAnalytics,
    isLoading: buySellLoading,
    error: buySellError,
  } = useRawTrades(token, buySellTimeFrame);

  // Get trading activity data for the selected timeframe
  const {
    data: tradingActivityData,
    isLoading: tradingActivityLoading,
    error: tradingActivityError,
  } = useRawTrades(token, tradingActivityTimeFrame);

  // Get raw trades data for the trading activity chart
  const {
    data: rawTradesData,
    isLoading: rawTradesDataLoading,
    error: rawTradesDataError,
  } = useRawTradesData(token, tradingActivityTimeFrame);

  // Get 24h volume data for the volume card
  const {
    data: volume24hData,
    isLoading: volume24hLoading,
    error: volume24hError,
  } = useRawTrades(token, '24h');

  // Get market data for total supply and market cap
  const { data: marketData, isLoading: marketLoading, error: marketError } = useMarketData(token);

  // Get token metadata for header display
  const {
    data: tokenMetadata,
    isLoading: metadataLoading,
    error: metadataError,
  } = useTokenMetadata(token);

  // Calculate percentages from raw data
  const totalTrades = buySellAnalytics?.totalTrades || 0;
  const buyPercent =
    totalTrades > 0 ? Math.round(((buySellAnalytics?.buys || 0) / totalTrades) * 100) : 0;
  const sellPercent = 100 - buyPercent;
  const buySellData = [
    { name: 'Buys', value: buyPercent, color: '#10B981' },
    { name: 'Sells', value: sellPercent, color: '#EF4444' },
  ];

  // Use raw trades data for analytics
  const analytics = buySellAnalytics || {
    buys: 0,
    sells: 0,
    buyVolume: 0,
    sellVolume: 0,
    uniqueBuyers: 0,
    uniqueSellers: 0,
    avgBuySize: 0,
    avgSellSize: 0,
    largestBuy: 0,
    largestSell: 0,
    buyPressure: 0,
    sellPressure: 0,
    totalTrades: 0,
    totalVolume: 0,
  };

  // Helper function to format volume (already converted to MON)
  const formatVolume = (volume: number) => {
    // Volume is already in MON (converted from wei in the API processing)

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

  // Helper function to format volume in USD (assuming 1 MON = $1 for now)
  const formatVolumeUSD = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else if (volume >= 1) {
      return `$${volume.toFixed(2)}`;
    } else if (volume >= 0.01) {
      return `$${volume.toFixed(4)}`;
    } else {
      return `$${volume.toFixed(6)}`;
    }
  };

  // Helper function to format total supply
  const formatTotalSupply = (supply: string) => {
    const numSupply = parseFloat(supply);

    const actualSupply = numSupply / 1e18;

    if (actualSupply >= 1e9) {
      return `${(actualSupply / 1e9).toFixed(2)}B`;
    } else if (actualSupply >= 1e6) {
      return `${(actualSupply / 1e6).toFixed(2)}M`;
    } else if (actualSupply >= 1e3) {
      return `${(actualSupply / 1e3).toFixed(2)}K`;
    } else {
      return actualSupply.toFixed(2);
    }
  };

  // Helper function to calculate and format market cap
  const formatMarketCap = (price: string, supply: string) => {
    const numPrice = parseFloat(price);
    const numSupply = parseFloat(supply);

    // Convert supply from smallest unit to actual tokens (divide by 10^18)
    const actualSupply = numSupply / 1e18;
    const marketCap = numPrice * actualSupply;

    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  // Create mock holders data for the chart
  const holdersChartData = useMemo(() => {
    if (!holdersSeries || holdersSeries.length === 0) {
      return Array.from({ length: 6 }, (_, i) => ({
        time: String(i),
        value: Math.floor(Math.random() * 100) + 1000,
      }));
    }
    return holdersSeries.map((p, i) => ({
      time: String(i),
      value: p.swaps || p.unique_traders || 0, // Using available properties from TimeSeriesPoint
    }));
  }, [holdersSeries]);

  return (
    <div className="text-white min-h-screen p-6 overflow-auto pb-30">
      {/* Token Information Display */}
      {token && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            {/* Token Avatar */}
            <div className="flex-shrink-0">
              {metadataLoading ? (
                <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                </div>
              ) : tokenMetadata?.token_metadata?.image_uri ? (
                <img
                  src={tokenMetadata.token_metadata.image_uri}
                  alt={tokenMetadata.token_metadata.name || 'Token'}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-purple-400">${(tokenMetadata?.token_metadata?.symbol || token.slice(2, 4)).toUpperCase()}</span></div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-400">
                    {tokenMetadata?.token_metadata?.symbol?.slice(0, 2).toUpperCase() ||
                      token.slice(2, 4).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Token Details */}
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {metadataLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                ) : (
                  tokenMetadata?.token_metadata?.name || 'Loading...'
                )}
              </span>
              <span className="text-purple-400 font-semibold">
                {tokenMetadata?.token_metadata?.symbol || ''}
              </span>
              <span className="text-purple-300 font-mono text-xs">{token}</span>
            </div>

            {/* Token Status */}
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                tokenMetadata?.token_metadata?.is_listing
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {tokenMetadata?.token_metadata?.is_listing ? 'DEX Listed' : 'Bonding'}
            </div>
          </div>
          <DrawerClose asChild>
            <button className="bg-terciary p-1 rounded border border-borderColor flex items-center gap-1 cursor-pointer px-3">
              <X size={16} className="text-white/50 hover:text-white" />
            </button>
          </DrawerClose>
        </div>
      )}

      {/* Key Metrics Row - Compact Dark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-secondary border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 bg-purple-600/20 rounded-md">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                newHolders > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {newHolders > 0 ? '+' + newHolders : '0'} new
            </div>
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {holdersLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : holdersError ? (
              <span className="text-red-400">Error</span>
            ) : (
              totalHolders.toLocaleString()
            )}
          </div>
          <div className="text-xs text-purple-300 font-medium">Total Holders</div>
        </div>

        <div className="bg-secondary border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 bg-purple-600/20 rounded-md">
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                volume24hData?.totalVolume && volume24hData?.totalVolume > 0
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {volume24hData?.totalVolume && volume24hData?.totalVolume > 0 ? 'Live' : 'No Data'}
            </div>
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {volume24hLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : volume24hError ? (
              <span className="text-red-400">Error</span>
            ) : (
              formatVolume(volume24hData?.totalVolume || 0)
            )}
          </div>
          <div className="text-xs text-purple-300 font-medium">Volume 24h</div>
        </div>

        <div className="bg-secondary border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 bg-purple-600/20 rounded-md">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                marketData?.total_supply
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {marketData?.total_supply ? 'Available' : 'No Data'}
            </div>
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {marketLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : marketError ? (
              <span className="text-red-400">Error</span>
            ) : (
              formatTotalSupply(marketData?.total_supply || '0')
            )}
          </div>
          <div className="text-xs text-purple-300 font-medium">Total Supply</div>
        </div>

        <div className="bg-secondary border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 bg-purple-600/20 rounded-md">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                marketData?.price && marketData?.total_supply
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {marketData?.price && marketData?.total_supply ? 'Live' : 'No Data'}
            </div>
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {marketLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            ) : marketError ? (
              <span className="text-red-400">Error</span>
            ) : (
              formatMarketCap(marketData?.price || '0', marketData?.total_supply || '0')
            )}
          </div>
          <div className="text-xs text-purple-300 font-medium">Market Cap</div>
        </div>
      </div>

      {/* Main Charts Grid - Dark Professional Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
        {/* Wallet Growth Chart */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-2">
          <WalletGrowthChart
            data={walletGrowthData}
            isLoading={growthLoading}
            timeFrame={walletGrowthTimeFrame}
            onTimeFrameChange={setWalletGrowthTimeFrame}
          />
        </div>

        {/* Trading Activity */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-2">
          <TradingActivityChart
            data={tradingActivityData!}
            rawTrades={rawTradesData}
            isLoading={tradingActivityLoading || rawTradesDataLoading}
            timeFrame={tradingActivityTimeFrame}
            onTimeFrameChange={setTradingActivityTimeFrame}
          />
        </div>

        {/* Buy/Sell Analytics - Three Column Layout */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Buy/Sell Analytics</h3>
              <p className="text-purple-300 text-sm">Market sentiment & trading volume</p>
            </div>
            <div className="flex gap-1">
              {['5m', '10m', '1h', '6h', '24h'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setBuySellTimeFrame(tf)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                    buySellTimeFrame === tf
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-purple-300 hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Left Column - Overall Metrics */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">TXNS</div>
                <div className="text-lg font-bold text-white">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    totalTrades.toLocaleString()
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">VOLUME</div>
                <div className="text-lg font-bold text-white">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    formatVolume(analytics.totalVolume)
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - Buy Metrics */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xs text-emerald-400 mb-1">BUYS</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    analytics.buys.toLocaleString()
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${buyPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-emerald-400 mb-1">BUY VOL</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    formatVolume(analytics.buyVolume)
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${analytics.totalVolume > 0 ? (analytics.buyVolume / analytics.totalVolume) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-emerald-400 mb-1">BUYERS</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    analytics.uniqueBuyers.toLocaleString()
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${analytics.uniqueBuyers + analytics.uniqueSellers > 0 ? (analytics.uniqueBuyers / (analytics.uniqueBuyers + analytics.uniqueSellers)) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Right Column - Sell Metrics */}
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-xs text-red-400 mb-1">SELLS</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    analytics.sells.toLocaleString()
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sellPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-red-400 mb-1">SELL VOL</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    formatVolume(analytics.sellVolume)
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${analytics.totalVolume > 0 ? (analytics.sellVolume / analytics.totalVolume) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-red-400 mb-1">SELLERS</div>
                <div className="text-lg font-bold text-white mb-2">
                  {buySellLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-400" />
                  ) : (
                    analytics.uniqueSellers.toLocaleString()
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${analytics.uniqueBuyers + analytics.uniqueSellers > 0 ? (analytics.uniqueSellers / (analytics.uniqueBuyers + analytics.uniqueSellers)) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Sentiment Indicator */}
          <div className="mt-4 pt-3 border-t border-purple-600/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${analytics.buyPressure > analytics.sellPressure ? 'bg-emerald-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-sm text-purple-300">
                  Buy {buyPercent}% / Sell {sellPercent}%
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  analytics.buyPressure > analytics.sellPressure
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {analytics.buyPressure > analytics.sellPressure ? 'Bullish' : 'Bearish'}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="flex justify-center">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={buySellData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={32}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {buySellData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, '']}
                      labelStyle={{ color: '#9ca3af', fontSize: '12px' }}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #7c3aed',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Grid - Dark Professional Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
        {/* Also Bought */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-4">
          <AlsoBought tokenAddress={token} />
        </div>

        {/* Avg Holding Time */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-4">
          <AvgHoldingTime tokenAddress={token} timeframe={buySellTimeFrame} />
        </div>

        {/* Creator Insights */}
        <div className="lg:col-span-2 bg-secondary border border-borderColor rounded-lg p-4">
          <CreatorInsights tokenAddress={token} />
        </div>
      </div>
    </div>
  );
};

export { Parent };

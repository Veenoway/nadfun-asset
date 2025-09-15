import { useState } from 'react';
import { ExternalLink, ArrowUpRight, Shield, Activity } from 'lucide-react';
import { useRealTimeData } from '@/hooks/analytics/useRealTimeData';

const RealTimeTransactions = () => {
  const { recentTransactions, isConnected } = useRealTimeData();
  const [showAll, setShowAll] = useState(false);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-3 h-3 text-green-400" />;
      case 'approval':
        return <Shield className="w-3 h-3 text-blue-400" />;
      default:
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'text-green-400';
      case 'approval':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string) => {
    if (!value || value === '0x') return 'N/A';
    try {
      // Convert hex to decimal and format
      const decimalValue = parseInt(value, 16);
      if (decimalValue === 0) return '0';
      return decimalValue.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const openExplorer = (hash: string) => {
    const url = `https://explorer.monad.xyz/tx/${hash}`;
    window.open(url, '_blank');
  };

  const displayedTransactions = showAll ? recentTransactions : recentTransactions.slice(0, 5);

  if (!isConnected) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-white">Real-Time Transactions</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm mb-2">WebSocket not connected</div>
          <div className="text-gray-500 text-xs">Connect to see live transactions</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Real-Time Transactions</h3>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All (${recentTransactions.length})`}
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {displayedTransactions.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">Waiting for transactions...</div>
            <div className="text-gray-500 text-xs">New transactions will appear here</div>
          </div>
        ) : (
          displayedTransactions.map((tx, index) => (
            <div
              key={`${tx.hash}-${index}`}
              className="bg-gray-700/30 rounded p-2 hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => openExplorer(tx.hash)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(tx.type)}
                  <span className={`text-xs font-medium ${getTransactionColor(tx.type)}`}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">{getTimeAgo(tx.timestamp)}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Block:</span>
                  <span className="text-white">#{tx.blockNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">From:</span>
                  <span className="text-white font-mono">{formatAddress(tx.from)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">To:</span>
                  <span className="text-white font-mono">{formatAddress(tx.to)}</span>
                </div>

                {tx.value && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">{formatValue(tx.value)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Hash:</span>
                  <span className="text-white font-mono text-xs">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-2 border-t border-gray-600/30">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Total Transactions:</span>
          <span className="text-white">{recentTransactions.length}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Last Update:</span>
          <span className="text-white">
            {recentTransactions.length > 0 ? getTimeAgo(recentTransactions[0].timestamp) : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
};

export { RealTimeTransactions };

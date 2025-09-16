import { useState, useEffect, useCallback, useRef } from 'react';
import { monadWebSocket, BlockHeader, TransactionLog } from '@/lib/websocket';

export interface RealTimeStats {
  totalBlocks: number;
  totalTransactions: number;
  blocksPerMinute: number;
  transactionsPerMinute: number;
  lastBlockNumber: number;
  lastBlockTime: number;
  averageBlockTime: number;
  networkUtilization: number; // gasUsed / gasLimit
}

export interface RealTimeTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  type: 'transfer' | 'approval' | 'other';
  from: string;
  to: string;
  value?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export const useRealTimeData = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState<RealTimeStats>({
    totalBlocks: 0,
    totalTransactions: 0,
    blocksPerMinute: 0,
    transactionsPerMinute: 0,
    lastBlockNumber: 0,
    lastBlockTime: 0,
    averageBlockTime: 0,
    networkUtilization: 0,
  });

  const [recentBlocks, setRecentBlocks] = useState<BlockHeader[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RealTimeTransaction[]>([]);

  // Refs for tracking time-based calculations
  const blockTimesRef = useRef<number[]>([]);
  const transactionTimesRef = useRef<number[]>([]);
  const lastMinuteRef = useRef<number>(Date.now());

  // Connect to WebSocket on mount
  useEffect(() => {
    // Only run in browser environment
    if (!monadWebSocket) {
      return;
    }

    const connect = async () => {
      try {
        await monadWebSocket?.connect();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connect();

    // Set up event handlers
    monadWebSocket.onConnect(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    monadWebSocket.onDisconnect(() => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    monadWebSocket.onError((error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    });

    monadWebSocket.onBlock((block) => {
      handleNewBlock(block);
    });

    monadWebSocket.onLog((log) => {
      handleNewTransaction(log);
    });

    // Cleanup on unmount
    return () => {
      monadWebSocket?.disconnect();
    };
  }, []);

  // Update per-minute stats every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updatePerMinuteStats();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const handleNewBlock = useCallback((block: BlockHeader) => {
    const blockNumber = parseInt(block.number, 16);
    const blockTime = parseInt(block.timestamp, 16) * 1000; // Convert to milliseconds
    const gasUsed = parseInt(block.gasUsed, 16);
    const gasLimit = parseInt(block.gasLimit, 16);

    // Add to recent blocks (keep last 10)
    setRecentBlocks((prev) => {
      const newBlocks = [block, ...prev.slice(0, 9)];
      return newBlocks;
    });

    // Track block times for average calculation
    blockTimesRef.current.push(blockTime);
    if (blockTimesRef.current.length > 10) {
      blockTimesRef.current.shift();
    }

    // Update stats
    setStats((prev) => {
      const newStats = { ...prev };
      newStats.totalBlocks = prev.totalBlocks + 1;
      newStats.lastBlockNumber = blockNumber;
      newStats.lastBlockTime = blockTime;
      newStats.networkUtilization = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;

      // Calculate average block time
      if (blockTimesRef.current.length > 1) {
        const timeDiffs = [];
        for (let i = 1; i < blockTimesRef.current.length; i++) {
          timeDiffs.push(blockTimesRef.current[i] - blockTimesRef.current[i - 1]);
        }
        newStats.averageBlockTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      }

      return newStats;
    });
  }, []);

  const handleNewTransaction = useCallback((log: TransactionLog) => {
    const blockNumber = parseInt(log.blockNumber, 16);
    const timestamp = Date.now();

    // Parse transaction data
    const transaction: RealTimeTransaction = {
      hash: log.transactionHash,
      blockNumber,
      timestamp,
      type: 'other',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
    };

    // Determine transaction type from topics
    if (log.topics.length > 0) {
      const eventSignature = log.topics[0];
      if (eventSignature === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        // Transfer event
        transaction.type = 'transfer';
        if (log.topics.length >= 3) {
          transaction.from = '0x' + log.topics[1].slice(26);
          transaction.to = '0x' + log.topics[2].slice(26);
        }
        if (log.data && log.data !== '0x') {
          transaction.value = log.data;
        }
      } else if (
        eventSignature === '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
      ) {
        // Approval event
        transaction.type = 'approval';
        if (log.topics.length >= 3) {
          transaction.from = '0x' + log.topics[1].slice(26);
          transaction.to = '0x' + log.topics[2].slice(26);
        }
      }
    }

    // Add to recent transactions (keep last 20)
    setRecentTransactions((prev) => {
      const newTransactions = [transaction, ...prev.slice(0, 19)];
      return newTransactions;
    });

    // Track transaction times for per-minute calculation
    transactionTimesRef.current.push(timestamp);
    if (transactionTimesRef.current.length > 100) {
      transactionTimesRef.current.shift();
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalTransactions: prev.totalTransactions + 1,
    }));
  }, []);

  const updatePerMinuteStats = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Count blocks in last minute
    const recentBlocks = blockTimesRef.current.filter((time) => time > oneMinuteAgo);

    // Count transactions in last minute
    const recentTransactions = transactionTimesRef.current.filter((time) => time > oneMinuteAgo);

    setStats((prev) => ({
      ...prev,
      blocksPerMinute: recentBlocks.length,
      transactionsPerMinute: recentTransactions.length,
    }));

    // Clean up old data
    blockTimesRef.current = blockTimesRef.current.filter((time) => time > oneMinuteAgo);
    transactionTimesRef.current = transactionTimesRef.current.filter((time) => time > oneMinuteAgo);
    lastMinuteRef.current = now;
  }, []);

  const connect = useCallback(async () => {
    if (!monadWebSocket) return;
    try {
      await monadWebSocket.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (!monadWebSocket) return;
    monadWebSocket.disconnect();
  }, []);

  return {
    // Connection state
    isConnected,
    connectionStatus,

    // Real-time data
    stats,
    recentBlocks,
    recentTransactions,

    // Actions
    connect,
    disconnect,

    // Utility
    getConnectionStatus:
      monadWebSocket?.getConnectionStatus.bind(monadWebSocket) || (() => 'disconnected'),
  };
};

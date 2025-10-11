// Direct GraphQL trades API client for raw trade data
const GRAPHQL_API_BASE = 'https://indexer.dev.hyperindex.xyz/23e7961/v1/graphql';

export interface RawTrade {
  id: string;
  trader_id: string;
  tradeType: 'BUY' | 'SELL';
  tokenAmount: string;
  monAmount: string;
  timestamp: string;
  txHash: string;
  source: string;
}

export interface TradesResponse {
  data: {
    Trade: RawTrade[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export interface TradingAnalytics {
  buys: number;
  sells: number;
  buyVolume: number;
  sellVolume: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  avgBuySize: number;
  avgSellSize: number;
  largestBuy: number;
  largestSell: number;
  buyPressure: number;
  sellPressure: number;
  totalTrades: number;
  totalVolume: number;
}

export interface WalletHoldingData {
  time: string;
  totalHolders: number;
  newHolders: number;
  departedHolders: number;
  netChange: number;
}

export interface WalletHoldingAnalytics {
  timeSeries: WalletHoldingData[];
  totalNewHolders: number;
  totalDepartedHolders: number;
  netHolderChange: number;
  currentHolders: number;
}

// Calculate timestamp for timeframe
const getTimestampForTimeframe = (timeframe: string): number => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  switch (timeframe) {
    case '5min':
      return now - 5 * 60; // 5 minutes ago
    case '1h':
      return now - 60 * 60; // 1 hour ago
    case '6h':
      return now - 6 * 60 * 60; // 6 hours ago
    case '24h':
      return now - 24 * 60 * 60; // 24 hours ago
    default:
      return now - 5 * 60; // Default to 5 minutes
  }
};

// Fetch raw trades for a specific timeframe using GraphQL
export const fetchRawTrades = async (
  tokenAddress: string,
  timeframe: string,
): Promise<RawTrade[]> => {
  if (!tokenAddress || tokenAddress.length < 40 || !tokenAddress.startsWith('0x')) {
    return [];
  }

  try {
    const fromTimestamp = getTimestampForTimeframe(timeframe);

    const query = {
      query: `query GetTrades($token_id: String!, $from_ts: numeric!) { 
        Trade(where: { 
          token_id: { _eq: $token_id }, 
          timestamp: { _gte: $from_ts } 
        }, order_by: { timestamp: desc }) { 
          id 
          trader_id 
          tradeType 
          tokenAmount 
          monAmount 
          timestamp 
          txHash 
          source 
        } 
      }`,
      variables: {
        token_id: tokenAddress,
        from_ts: fromTimestamp,
      },
    };

    const response = await fetch(GRAPHQL_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TradesResponse = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data?.Trade || [];
  } catch (error) {
    console.error('Error fetching raw trades from GraphQL:', error);
    return [];
  }
};

// Process raw trades into analytics
export const processRawTrades = (trades: RawTrade[]): TradingAnalytics => {
  if (!trades.length) {
    return {
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
  }

  // Separate buy and sell trades
  const buyTrades = trades.filter((t) => t.tradeType === 'BUY');
  const sellTrades = trades.filter((t) => t.tradeType === 'SELL');

  // Calculate volumes (using monAmount for volume calculations)
  // Convert from wei (18 decimals) to human-readable MON
  const buyVolume = buyTrades.reduce((sum, t) => sum + parseFloat(t.monAmount || '0'), 0) / 1e18;
  const sellVolume = sellTrades.reduce((sum, t) => sum + parseFloat(t.monAmount || '0'), 0) / 1e18;

  // Calculate unique traders
  const uniqueBuyers = new Set(buyTrades.map((t) => t.trader_id)).size;
  const uniqueSellers = new Set(sellTrades.map((t) => t.trader_id)).size;

  // Calculate averages
  const avgBuySize = buyTrades.length > 0 ? buyVolume / buyTrades.length : 0;
  const avgSellSize = sellTrades.length > 0 ? sellVolume / sellTrades.length : 0;

  // Calculate largest trades (convert from wei to MON)
  const largestBuy =
    buyTrades.length > 0
      ? Math.max(...buyTrades.map((t) => parseFloat(t.monAmount || '0'))) / 1e18
      : 0;
  const largestSell =
    sellTrades.length > 0
      ? Math.max(...sellTrades.map((t) => parseFloat(t.monAmount || '0'))) / 1e18
      : 0;

  // Calculate pressure
  const totalVolume = buyVolume + sellVolume;
  const buyPressure = totalVolume > 0 ? Math.round((buyVolume / totalVolume) * 100) : 0;
  const sellPressure = 100 - buyPressure;

  const analytics: TradingAnalytics = {
    buys: buyTrades.length,
    sells: sellTrades.length,
    buyVolume,
    sellVolume,
    uniqueBuyers,
    uniqueSellers,
    avgBuySize,
    avgSellSize,
    largestBuy,
    largestSell,
    buyPressure,
    sellPressure,
    totalTrades: trades.length,
    totalVolume,
  };

  return analytics;
};

// Map frontend timeframes to API timeframes
export const getApiTimeframe = (timeframe: string): string => {
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
    default:
      return '5min'; // Default to 5min if timeframe is undefined or invalid
  }
};

// Analyze wallet holding changes over time
export const analyzeWalletHoldings = (
  trades: RawTrade[],
  timeframe: string,
): WalletHoldingAnalytics => {
  if (!trades.length) {
    return {
      timeSeries: [],
      totalNewHolders: 0,
      totalDepartedHolders: 0,
      netHolderChange: 0,
      currentHolders: 0,
    };
  }

  // Sort trades by timestamp
  const sortedTrades = [...trades].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

  // Create time buckets based on timeframe
  const timeBuckets = createTimeBuckets(timeframe);
  const timeSeries: WalletHoldingData[] = [];

  // Track wallet balances over time
  const walletBalances = new Map<string, number>();
  const walletFirstSeen = new Map<string, number>();
  const walletLastSeen = new Map<string, number>();

  // Process trades to track wallet balances
  for (const trade of sortedTrades) {
    const timestamp = parseInt(trade.timestamp);
    const traderId = trade.trader_id;
    const tokenAmount = parseFloat(trade.tokenAmount) / 1e18; // Convert from wei

    // Track first and last seen times
    if (!walletFirstSeen.has(traderId)) {
      walletFirstSeen.set(traderId, timestamp);
    }
    walletLastSeen.set(traderId, timestamp);

    // Update wallet balance
    const currentBalance = walletBalances.get(traderId) || 0;
    if (trade.tradeType === 'BUY') {
      walletBalances.set(traderId, currentBalance + tokenAmount);
    } else {
      walletBalances.set(traderId, Math.max(0, currentBalance - tokenAmount));
    }
  }

  // Calculate time series data
  let cumulativeHolders = 0;
  let totalNewHolders = 0;
  let totalDepartedHolders = 0;

  for (let i = 0; i < timeBuckets.length; i++) {
    const bucketStart = timeBuckets[i];
    const bucketEnd = i < timeBuckets.length - 1 ? timeBuckets[i + 1] : Date.now() / 1000;

    // Count holders at this time
    const holdersAtTime = new Set<string>();
    const newHoldersInBucket = new Set<string>();
    const departedHoldersInBucket = new Set<string>();

    // Check all wallets
    for (const [walletId, firstSeen] of walletFirstSeen) {
      const lastSeen = walletLastSeen.get(walletId)!;
      const currentBalance = walletBalances.get(walletId) || 0;

      // If wallet was active in this time bucket and has balance
      if (firstSeen <= bucketEnd && lastSeen >= bucketStart && currentBalance > 0) {
        holdersAtTime.add(walletId);

        // Check if this is a new holder in this bucket
        if (firstSeen >= bucketStart && firstSeen < bucketEnd) {
          newHoldersInBucket.add(walletId);
          totalNewHolders++;
        }
      }

      // Check if wallet departed in this bucket (had balance before, no balance now)
      if (lastSeen >= bucketStart && lastSeen < bucketEnd && currentBalance === 0) {
        departedHoldersInBucket.add(walletId);
        totalDepartedHolders++;
      }
    }

    const newHolders = newHoldersInBucket.size;
    const departedHolders = departedHoldersInBucket.size;
    const netChange = newHolders - departedHolders;
    cumulativeHolders += netChange;

    timeSeries.push({
      time: formatTimeBucket(bucketStart, timeframe),
      totalHolders: Math.max(0, cumulativeHolders),
      newHolders,
      departedHolders,
      netChange,
    });
  }

  const currentHolders = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].totalHolders : 0;
  const netHolderChange = totalNewHolders - totalDepartedHolders;

  return {
    timeSeries,
    totalNewHolders,
    totalDepartedHolders,
    netHolderChange,
    currentHolders,
  };
};

// Create time buckets for analysis
const createTimeBuckets = (timeframe: string): number[] => {
  const now = Math.floor(Date.now() / 1000);
  const buckets: number[] = [];

  switch (timeframe) {
    case '5min':
      // 5-minute buckets over 1 hour
      for (let i = 0; i < 12; i++) {
        buckets.push(now - 60 * 60 + i * 5 * 60);
      }
      break;
    case '10min':
      // 10-minute buckets over 2 hours
      for (let i = 0; i < 12; i++) {
        buckets.push(now - 2 * 60 * 60 + i * 10 * 60);
      }
      break;
    case '1h':
      // 1-hour buckets over 24 hours
      for (let i = 0; i < 24; i++) {
        buckets.push(now - 24 * 60 * 60 + i * 60 * 60);
      }
      break;
    case '6h':
      // 6-hour buckets over 7 days
      for (let i = 0; i < 28; i++) {
        buckets.push(now - 7 * 24 * 60 * 60 + i * 6 * 60 * 60);
      }
      break;
    case '24h':
      // 24-hour buckets over 30 days
      for (let i = 0; i < 30; i++) {
        buckets.push(now - 30 * 24 * 60 * 60 + i * 24 * 60 * 60);
      }
      break;
    default:
      // Default to 5-minute buckets
      for (let i = 0; i < 12; i++) {
        buckets.push(now - 60 * 60 + i * 5 * 60);
      }
  }

  return buckets;
};

// Format time bucket for display
const formatTimeBucket = (timestamp: number, timeframe: string): string => {
  const date = new Date(timestamp * 1000);

  switch (timeframe) {
    case '5min':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '10min':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case '1h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit' });
    case '6h':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '24h':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
};

// Main function to get processed analytics
export const getTradingAnalytics = async (
  tokenAddress: string,
  timeframe: string,
): Promise<TradingAnalytics> => {
  // Validate inputs
  if (!tokenAddress || !timeframe) {
    console.warn('getTradingAnalytics: Missing tokenAddress or timeframe', {
      tokenAddress,
      timeframe,
    });
    return {
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
  }

  const apiTimeframe = getApiTimeframe(timeframe);
  const rawTrades = await fetchRawTrades(tokenAddress, apiTimeframe);
  return processRawTrades(rawTrades);
};

// Main function to get wallet holding analytics
export const getWalletHoldingAnalytics = async (
  tokenAddress: string,
  timeframe: string,
): Promise<WalletHoldingAnalytics> => {
  // Validate inputs
  if (!tokenAddress || !timeframe) {
    console.warn('getWalletHoldingAnalytics: Missing tokenAddress or timeframe', {
      tokenAddress,
      timeframe,
    });
    return {
      timeSeries: [],
      totalNewHolders: 0,
      totalDepartedHolders: 0,
      netHolderChange: 0,
      currentHolders: 0,
    };
  }

  const apiTimeframe = getApiTimeframe(timeframe);
  const rawTrades = await fetchRawTrades(tokenAddress, apiTimeframe);
  return analyzeWalletHoldings(rawTrades, apiTimeframe);
};

// Creator Insights API
export interface CreatorToken {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  creationTimestamp: string;
  trades: Array<{
    source: string;
    tradeType: string;
    timestamp: string;
    txHash: string;
  }>;
}

export interface CreatorInsightsResponse {
  data: {
    Token: CreatorToken[];
  };
  errors?: Array<{
    message: string;
  }>;
}

export interface TokenAndCreatorResponse {
  data: {
    tokenInfo: Array<{
      id: string;
      name: string;
      symbol: string;
      totalSupply: string;
      creationTimestamp: string;
      trades: Array<{
        source: string;
        tradeType: string;
        timestamp: string;
        txHash: string;
      }>;
      creator: {
        id: string;
      };
    }>;
    creatorTokens: Array<{
      id: string;
      name: string;
      symbol: string;
      totalSupply: string;
      creationTimestamp: string;
      trades: Array<{
        source: string;
        tradeType: string;
        timestamp: string;
        txHash: string;
      }>;
    }>;
  };
  errors?: Array<{
    message: string;
  }>;
}

export const fetchTokenAndCreatorTokens = async (
  tokenAddress: string,
): Promise<TokenAndCreatorResponse> => {
  if (!tokenAddress || !tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error('Invalid token address');
  }

  try {
    // First, get the token info to find the creator
    const tokenQuery = {
      query: `query GetTokenInfo($token: String!) { 
        Token(where: { id: { _eq: $token } }) { 
          id 
          name 
          symbol 
          totalSupply 
          creationTimestamp 
          trades(order_by: { timestamp: desc }, limit: 1) { 
            source 
            tradeType 
            timestamp 
            txHash 
          } 
          creator { 
            id 
          } 
        } 
      }`,
      variables: { token: tokenAddress },
    };

    const tokenResponse = await fetch(GRAPHQL_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenQuery),
    });

    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(tokenData.errors)}`);
    }

    const tokenInfo = tokenData.data.Token[0];
    if (!tokenInfo || !tokenInfo.creator) {
      throw new Error('Token not found or no creator information');
    }

    const creatorId = tokenInfo.creator.id;

    // Now get all tokens by this creator
    const creatorQuery = {
      query: `query GetCreatorTokens($creator: String!) { 
        Token(where: { creator_id: { _eq: $creator } }) { 
          id 
          name 
          symbol 
          totalSupply 
          creationTimestamp 
          trades(order_by: { timestamp: desc }, limit: 1) { 
            source 
            tradeType 
            timestamp 
            txHash 
          } 
        } 
      }`,
      variables: { creator: creatorId },
    };

    const creatorResponse = await fetch(GRAPHQL_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creatorQuery),
    });

    if (!creatorResponse.ok) {
      throw new Error(`HTTP error! status: ${creatorResponse.status}`);
    }

    const creatorData = await creatorResponse.json();

    if (creatorData.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(creatorData.errors)}`);
    }

    return {
      data: {
        tokenInfo: [tokenInfo],
        creatorTokens: creatorData.data.Token,
      },
    };
  } catch (error) {
    console.error('Error fetching token and creator tokens:', error);
    // Return mock data for development
    return {
      data: {
        tokenInfo: [
          {
            id: tokenAddress,
            name: 'Sample Token',
            symbol: 'SAMPLE',
            totalSupply: '0',
            creationTimestamp: '1756644064',
            trades: [
              {
                source: 'DEXRouter',
                tradeType: 'BUY',
                timestamp: '1757067664',
                txHash: '0xcce9ee3ee432908271a6ac09c6bb161048052d3826c91550f4b65d48aaeb226a',
              },
            ],
            creator: {
              id: '0x93a7c39d7f848A1e9C479C6FE1F8995015Ea2fb9',
            },
          },
        ],
        creatorTokens: [
          {
            id: '0xDCf70B9Dc39150Ca53E96D4aA3fa7Eb01666a440',
            name: 'Bakba Princess',
            symbol: 'Bakba',
            totalSupply: '0',
            creationTimestamp: '1754961525',
            trades: [
              {
                source: 'DEXRouter',
                tradeType: 'SELL',
                timestamp: '1756449404',
                txHash: '0xdb6d23eb887f6e91dea610ccb936f01dcb2634b75f414f543b1f7b6d7060d345',
              },
            ],
          },
          {
            id: tokenAddress,
            name: 'Sample Token',
            symbol: 'SAMPLE',
            totalSupply: '0',
            creationTimestamp: '1756644064',
            trades: [
              {
                source: 'DEXRouter',
                tradeType: 'BUY',
                timestamp: '1757067664',
                txHash: '0xcce9ee3ee432908271a6ac09c6bb161048052d3826c91550f4b65d48aaeb226a',
              },
            ],
          },
        ],
      },
    };
  }
};

// Keep the old function for backward compatibility
export const fetchCreatorInsights = async (
  creatorAddress: string,
): Promise<CreatorInsightsResponse> => {
  if (!creatorAddress || !creatorAddress.startsWith('0x') || creatorAddress.length !== 42) {
    throw new Error('Invalid creator address');
  }

  try {
    const query = {
      query: `query GetUserCreatedTokens($creator: String!) { 
        Token(where: { creator_id: { _eq: $creator } }) { 
          id 
          name 
          symbol 
          totalSupply 
          creationTimestamp 
          trades(order_by: { timestamp: desc }, limit: 1) { 
            source 
            tradeType 
            timestamp 
            txHash 
          } 
        } 
      }`,
      variables: { creator: creatorAddress },
    };

    const response = await fetch(GRAPHQL_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreatorInsightsResponse = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching creator insights:', error);
    // Return mock data for development
    return {
      data: {
        Token: [
          {
            id: '0xB01572b6D70C7E9a90b5Caa6f8D317d2bec428dC',
            name: 'Monad Mainnet',
            symbol: 'MOM',
            totalSupply: '0',
            creationTimestamp: '1756644064',
            trades: [
              {
                source: 'Bonding Curve',
                tradeType: 'BUY',
                timestamp: '1757067664',
                txHash: '0xcce9ee3ee432908271a6ac09c6bb161048052d3826c91550f4b65d48aaeb226a',
              },
            ],
          },
        ],
      },
    };
  }
};

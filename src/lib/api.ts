// API service for crypto analytics dashboard

// GraphQL API for token holders
const GRAPHQL_API_URL = 'https://indexer.dev.hyperindex.xyz/23e7961/v1/graphql';

// Set to true to use mock data instead of API calls (for development/testing)
const USE_MOCK_DATA = false; // Set to false to use real API data

// Alternative: Force mock data when API is having issues
const FORCE_MOCK_DATA = false; // Set to true to force mock data usage

// Test API connectivity
export const testAPIConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: 'query { __typename }',
      }),
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API connectivity test failed:', error);
    return false;
  }
};

// Test API with actual token holder query
export const testTokenHoldersAPI = async (
  tokenId: string = '0x85d15ae02ACe2B4B5a38c835688a63F0988e2187',
): Promise<void> => {
  try {
    console.log('Testing Token Holders API with token:', tokenId);
    const result = await fetchTokenHoldersGraphQL(tokenId);
    console.log('API Test Result:', {
      totalHolders: result.data.TokenHolding.length,
      firstFewHolders: result.data.TokenHolding.slice(0, 3),
      sampleBalance: result.data.TokenHolding[0]?.currentBalance,
    });
  } catch (error) {
    console.error('Token Holders API test failed:', error);
  }
};

// Legacy API interfaces (for backward compatibility)
export interface TokenHolder {
  TokenHolderAddress: string;
  TokenId: string | null;
  TokenHolderQuantity: string;
}

// New GraphQL API interfaces
export interface GraphQLTokenHolder {
  wallet_id: string;
  currentBalance?: string;
}

export interface GraphQLTokenHoldersResponse {
  data: {
    TokenHolding: GraphQLTokenHolder[];
  };
}

// Helper interface for our internal use
export interface ProcessedTokenHolder {
  address: string;
  balance: string;
  rank: number;
}

export interface TokenHoldersResponse {
  status: string;
  message: string;
  result: TokenHolder[];
}

export interface ApiError {
  message: string;
  status?: number;
}

// New GraphQL Token Holders API with pagination
export const fetchTokenHoldersGraphQLWithPagination = async (
  tokenId: string,
  limit: number = 1000,
  offset: number = 0,
): Promise<GraphQLTokenHoldersResponse> => {
  // Use mock data in development mode or when forced
  if (USE_MOCK_DATA || FORCE_MOCK_DATA) {
    console.log('Using mock data for development or forced mode');
    return {
      data: {
        TokenHolding: getMockGraphQLTokenHolders(),
      },
    };
  }

  try {
    const query = {
      query: `query GetHolders { 
        TokenHolding(where: { 
          token_id: { _eq: "${tokenId}" }, 
          currentBalance: { _gt: "0" } 
        }, limit: ${limit}, offset: ${offset}, order_by: { currentBalance: desc }) { 
          wallet_id 
          currentBalance
        } 
      }`,
    };

    console.log('Fetching from GraphQL API:', GRAPHQL_API_URL);
    console.log('Query:', JSON.stringify(query, null, 2));

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(query),
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('GraphQL API Response:', data);

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching token holders from GraphQL:', error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - API endpoint may be unreachable or CORS blocked');
    } else if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timeout - API took too long to respond');
    }

    // Re-throw the error instead of falling back to mock data
    throw error;
  }
};

// Legacy function for backward compatibility
export const fetchTokenHoldersGraphQL = async (
  tokenId: string,
): Promise<GraphQLTokenHoldersResponse> => {
  // Use the pagination function with default parameters
  return fetchTokenHoldersGraphQLWithPagination(tokenId, 1000, 0);
};

// Convert GraphQL response to legacy format for backward compatibility
export const convertGraphQLToLegacy = (
  graphqlResponse: GraphQLTokenHoldersResponse,
): TokenHoldersResponse => {
  console.log('Debug - GraphQL response data length:', graphqlResponse.data.TokenHolding.length);

  const legacyHolders: TokenHolder[] = graphqlResponse.data.TokenHolding.map((holder, index) => ({
    TokenHolderAddress: holder.wallet_id,
    TokenId: null,
    TokenHolderQuantity: holder.currentBalance || '0',
  }));

  console.log('Debug - Converted to legacy format, length:', legacyHolders.length);

  return {
    status: '1',
    message: 'OK',
    result: legacyHolders,
  };
};

// Legacy fetchTokenHolders function removed - now using GraphQL API only

// Fetch all token holders using GraphQL API with pagination
export const fetchAllTokenHolders = async (
  tokenId: string = '0x85d15ae02ACe2B4B5a38c835688a63F0988e2187',
): Promise<TokenHolder[]> => {
  console.log(`Fetching all token holders for token: ${tokenId}`);

  const allHolders: TokenHolder[] = [];
  let offset = 0;
  const limit = 1000; // API limit per request
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching holders batch: offset ${offset}, limit ${limit}`);

    const graphqlResponse = await fetchTokenHoldersGraphQLWithPagination(tokenId, limit, offset);
    const legacyResponse = convertGraphQLToLegacy(graphqlResponse);

    console.log(`Batch ${Math.floor(offset / limit) + 1}: ${legacyResponse.result.length} holders`);

    allHolders.push(...legacyResponse.result);

    // If we got less than the limit, we've reached the end
    if (legacyResponse.result.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }

    // Safety check to prevent infinite loops
    if (offset > 50000) {
      console.warn('Reached safety limit of 50,000 holders');
      break;
    }
  }

  console.log(`Total holders fetched: ${allHolders.length}`);
  console.log('Debug - First few holders:', allHolders.slice(0, 3));
  return allHolders;
};

// Legacy pagination-based fetch removed - now using GraphQL API only

// Helper function to format wallet addresses
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to format balance
export const formatBalance = (balance: string, decimals: number = 18): string => {
  try {
    const numBalance = parseFloat(balance) / Math.pow(10, decimals);
    if (numBalance >= 1000000) {
      return `${(numBalance / 1000000).toFixed(2)}M`;
    } else if (numBalance >= 1000) {
      return `${(numBalance / 1000).toFixed(2)}K`;
    } else {
      return numBalance.toFixed(2);
    }
  } catch (error) {
    return '0';
  }
};

// Convert API TokenHolder to ProcessedTokenHolder
export const processTokenHolder = (holder: TokenHolder, rank: number): ProcessedTokenHolder => {
  return {
    address: holder.TokenHolderAddress,
    balance: holder.TokenHolderQuantity,
    rank: rank,
  };
};

// Calculate total holders from API response
export const calculateTotalHolders = (holders: TokenHolder[]): number => {
  console.log('Debug - calculateTotalHolders input:', holders.length, 'holders');
  return holders.length;
};

// Calculate new holders (mock for now, would need historical data)
export const calculateNewHolders = (holders: TokenHolder[]): number => {
  // This would need historical data comparison
  // For now, return a mock calculation
  return Math.floor(holders.length * 0.15); // 15% of total as "new"
};

// Mock data for development/testing
export const getMockTokenHolders = (): TokenHolder[] => {
  return [
    {
      TokenHolderAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4a4d4a09',
      TokenId: null,
      TokenHolderQuantity: '1000000000000000000000000',
    },
    {
      TokenHolderAddress: '0x1a5c8b12f3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8',
      TokenId: null,
      TokenHolderQuantity: '500000000000000000000000',
    },
    {
      TokenHolderAddress: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0',
      TokenId: null,
      TokenHolderQuantity: '250000000000000000000000',
    },
    {
      TokenHolderAddress: '0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
      TokenId: null,
      TokenHolderQuantity: '125000000000000000000000',
    },
    {
      TokenHolderAddress: '0x3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4',
      TokenId: null,
      TokenHolderQuantity: '62500000000000000000000',
    },
    {
      TokenHolderAddress: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8',
      TokenId: null,
      TokenHolderQuantity: '31250000000000000000000',
    },
    {
      TokenHolderAddress: '0x2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3',
      TokenId: null,
      TokenHolderQuantity: '15625000000000000000000',
    },
    {
      TokenHolderAddress: '0x8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9',
      TokenId: null,
      TokenHolderQuantity: '7812500000000000000000',
    },
    {
      TokenHolderAddress: '0x4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5',
      TokenId: null,
      TokenHolderQuantity: '3906250000000000000000',
    },
    {
      TokenHolderAddress: '0x1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2',
      TokenId: null,
      TokenHolderQuantity: '1953125000000000000000',
    },
  ];
};

// Mock data for GraphQL API
export const getMockGraphQLTokenHolders = (): GraphQLTokenHolder[] => {
  const holders: GraphQLTokenHolder[] = [];

  // Generate a realistic number of holders (between 1500-5000)
  const totalHolders = Math.floor(Math.random() * 3500) + 1500;

  // Add top 10 whales with large balances
  const whaleBalances = [
    '1000000000000000000000000',
    '500000000000000000000000',
    '250000000000000000000000',
    '125000000000000000000000',
    '62500000000000000000000',
    '31250000000000000000000',
    '15625000000000000000000',
    '7812500000000000000000',
    '3906250000000000000000',
    '1953125000000000000000',
  ];

  whaleBalances.forEach((balance, index) => {
    holders.push({
      wallet_id: `0x${Math.random().toString(16).substr(2, 40)}`,
      currentBalance: balance,
    });
  });

  // Add medium holders (100-1000 tokens)
  for (let i = 0; i < Math.floor(totalHolders * 0.1); i++) {
    const balance = Math.floor(Math.random() * 900000000000000000000) + 100000000000000000000;
    holders.push({
      wallet_id: `0x${Math.random().toString(16).substr(2, 40)}`,
      currentBalance: balance.toString(),
    });
  }

  // Add small holders (1-100 tokens)
  for (let i = 0; i < totalHolders - holders.length; i++) {
    const balance = Math.floor(Math.random() * 99000000000000000000) + 1000000000000000000;
    holders.push({
      wallet_id: `0x${Math.random().toString(16).substr(2, 40)}`,
      currentBalance: balance.toString(),
    });
  }

  console.log(`Debug - Generated ${holders.length} mock holders`);
  return holders;
};

// Also Bought interfaces and functions
export interface AlsoBoughtToken {
  token: {
    id: string;
    name: string;
    symbol: string;
  };
  holders_count: number;
  wmon_volume: number;
}

export interface AlsoBoughtResponse {
  data: AlsoBoughtToken[];
  total_holders: number;
  analyzed_holders: number;
}

// Fetch also bought tokens - what other tokens are bought and still held by this token's holders
export const fetchAlsoBoughtTokens = async (tokenId: string): Promise<AlsoBoughtResponse> => {
  if (!tokenId || tokenId.length < 40 || !tokenId.startsWith('0x')) {
    return { data: [], total_holders: 0, analyzed_holders: 0 };
  }

  try {
    // Step 1: Get current holders of the token
    const holdersResponse = await fetchTokenHoldersGraphQL(tokenId);
    const holders = holdersResponse.data.TokenHolding;

    if (!holders.length) {
      return { data: [], total_holders: 0, analyzed_holders: 0 };
    }

    const holderAddresses = holders.map((h) => h.wallet_id);

    // Step 2: Get recent trades from these holders (last 24 hours)
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    const tradesQuery = {
      query: `query GetHolderTrades($holderAddresses: [String!]!, $timestamp: numeric!) { 
        Trade(where: { 
          trader_id: { _in: $holderAddresses },
          timestamp: { _gte: $timestamp },
          tradeType: { _eq: "BUY" }
        }, order_by: { timestamp: desc }) { 
          id
          trader_id
          token_id
          tradeType
          tokenAmount
          monAmount
          timestamp
        } 
      }`,
      variables: {
        holderAddresses: holderAddresses,
        timestamp: oneDayAgo,
      },
    };

    const tradesResponse = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradesQuery),
    });

    if (!tradesResponse.ok) {
      throw new Error(`HTTP error! status: ${tradesResponse.status}`);
    }

    const tradesData = await tradesResponse.json();
    const trades = tradesData.data?.Trade || [];

    // Step 3: Filter out the original token and group by token
    const tokensBought: { [tokenId: string]: { buyers: Set<string>; wmonVolume: number } } = {};

    for (const trade of trades) {
      if (trade.token_id === tokenId) continue; // Skip same token

      if (!tokensBought[trade.token_id]) {
        tokensBought[trade.token_id] = { buyers: new Set(), wmonVolume: 0 };
      }

      tokensBought[trade.token_id].buyers.add(trade.trader_id);
      tokensBought[trade.token_id].wmonVolume += parseFloat(trade.monAmount || '0') / 1e18;
    }

    // Step 4: Check current holdings for these tokens to see what's still held
    const boughtTokenAddresses = Object.keys(tokensBought);

    if (!boughtTokenAddresses.length) {
      return { data: [], total_holders: holders.length, analyzed_holders: holderAddresses.length };
    }

    // Get current holdings for bought tokens
    const holdingsQuery = {
      query: `query GetCurrentHoldings($holderAddresses: [String!]!, $tokenAddresses: [String!]!) { 
        TokenHolding(where: { 
          wallet_id: { _in: $holderAddresses },
          token_id: { _in: $tokenAddresses },
          currentBalance: { _gt: "0" }
        }) { 
          wallet_id
          token_id
          currentBalance
        }
        Token(where: { id: { _in: $tokenAddresses } }) {
          id
          name
          symbol
        }
      }`,
      variables: {
        holderAddresses: holderAddresses,
        tokenAddresses: boughtTokenAddresses,
      },
    };

    const holdingsResponse = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holdingsQuery),
    });

    if (!holdingsResponse.ok) {
      throw new Error(`HTTP error! status: ${holdingsResponse.status}`);
    }

    const holdingsData = await holdingsResponse.json();
    const currentHoldings = holdingsData.data?.TokenHolding || [];
    const tokenInfo = holdingsData.data?.Token || [];

    // Step 5: Build final results - only tokens still being held
    const stillHeldTokens = new Set(currentHoldings.map((h: any) => h.token_id));
    const tokenInfoMap = tokenInfo.reduce((map: any, token: any) => {
      map[token.id] = token;
      return map;
    }, {});

    const alsoBoughtTokens: AlsoBoughtToken[] = [];

    for (const [tokenAddr, data] of Object.entries(tokensBought)) {
      if (stillHeldTokens.has(tokenAddr) && tokenInfoMap[tokenAddr]) {
        alsoBoughtTokens.push({
          token: {
            id: tokenAddr,
            name: tokenInfoMap[tokenAddr].name || 'Unknown',
            symbol: tokenInfoMap[tokenAddr].symbol || 'UNK',
          },
          holders_count: data.buyers.size,
          wmon_volume: data.wmonVolume,
        });
      }
    }

    // Sort by WMON volume, then by holders count
    alsoBoughtTokens.sort(
      (a, b) => b.wmon_volume - a.wmon_volume || b.holders_count - a.holders_count,
    );

    return {
      data: alsoBoughtTokens,
      total_holders: holders.length,
      analyzed_holders: holderAddresses.length,
    };
  } catch (error) {
    console.error('Error fetching also bought tokens:', error);
    return { data: [], total_holders: 0, analyzed_holders: 0 };
  }
};

// Average Holding Time interfaces and functions
export interface HoldingTimeData {
  avg_hold_time_seconds_current: number;
  avg_hold_time_formatted_current: string;
  avg_hold_time_seconds_exited: number;
  avg_hold_time_formatted_exited: string;
  avg_hold_time_seconds_overall: number;
  avg_hold_time_formatted_overall: string;
  total_current_holders: number;
  total_exited_holders: number;
  total_holders: number;
}

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Fetch average holding time data using Transfer events analysis
export const fetchAverageHoldingTime = async (tokenId: string): Promise<HoldingTimeData> => {
  if (!tokenId || tokenId.length < 40 || !tokenId.startsWith('0x')) {
    return {
      avg_hold_time_seconds_current: 0,
      avg_hold_time_formatted_current: '0m',
      avg_hold_time_seconds_exited: 0,
      avg_hold_time_formatted_exited: '0m',
      avg_hold_time_seconds_overall: 0,
      avg_hold_time_formatted_overall: '0m',
      total_current_holders: 0,
      total_exited_holders: 0,
      total_holders: 0,
    };
  }

  try {
    // Get all Transfer events for this token to calculate balances and timestamps
    const transfersQuery = {
      query: `query GetTokenTransfers($tokenId: String!) { 
        Transfer(where: { 
          token_id: { _eq: $tokenId }
        }, order_by: { timestamp: asc }) { 
          id
          from_id
          to_id
          amount
          timestamp
        } 
      }`,
      variables: { tokenId: tokenId },
    };

    const transfersResponse = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transfersQuery),
    });

    if (!transfersResponse.ok) {
      throw new Error(`HTTP error! status: ${transfersResponse.status}`);
    }

    const transfersData = await transfersResponse.json();
    const transfers = transfersData.data?.Transfer || [];

    if (!transfers.length) {
      return {
        avg_hold_time_seconds_current: 0,
        avg_hold_time_formatted_current: '0m',
        avg_hold_time_seconds_exited: 0,
        avg_hold_time_formatted_exited: '0m',
        avg_hold_time_seconds_overall: 0,
        avg_hold_time_formatted_overall: '0m',
        total_current_holders: 0,
        total_exited_holders: 0,
        total_holders: 0,
      };
    }

    // Calculate balances and timestamps from transfers
    const balances: { [address: string]: number } = {};
    const firstAcquired: { [address: string]: number } = {};
    const lastUpdated: { [address: string]: number } = {};

    for (const transfer of transfers) {
      const fromAddr = transfer.from_id;
      const toAddr = transfer.to_id;
      const amount = parseInt(transfer.amount || '0');
      const timestamp = parseInt(transfer.timestamp || '0');

      // Handle sender (subtract balance)
      if (fromAddr && fromAddr !== '0x0000000000000000000000000000000000000000') {
        if (!(fromAddr in balances)) {
          balances[fromAddr] = 0;
        }
        balances[fromAddr] -= amount;
        lastUpdated[fromAddr] = timestamp;
      }

      // Handle receiver (add balance)
      if (toAddr && toAddr !== '0x0000000000000000000000000000000000000000') {
        if (!(toAddr in balances)) {
          balances[toAddr] = 0;
          firstAcquired[toAddr] = timestamp;
        }
        balances[toAddr] += amount;
        lastUpdated[toAddr] = timestamp;
      }
    }

    // Calculate holding times
    const nowSeconds = Math.floor(Date.now() / 1000);
    const currentDurations: number[] = [];
    const exitedDurations: number[] = [];

    for (const [address, balance] of Object.entries(balances)) {
      const firstAcq = firstAcquired[address];
      const lastUpd = lastUpdated[address];

      if (!firstAcq || firstAcq <= 0) continue;

      if (balance > 0) {
        // Current holder: calculate duration from first acquired to now
        const duration = Math.max(0, nowSeconds - firstAcq);
        currentDurations.push(duration);
      } else {
        // Exited holder: calculate duration from first acquired to last update
        if (lastUpd && lastUpd >= firstAcq) {
          const duration = lastUpd - firstAcq;
          exitedDurations.push(duration);
        }
      }
    }

    // Calculate averages
    const avgCurrentSeconds =
      currentDurations.length > 0
        ? Math.floor(currentDurations.reduce((sum, d) => sum + d, 0) / currentDurations.length)
        : 0;

    const avgExitedSeconds =
      exitedDurations.length > 0
        ? Math.floor(exitedDurations.reduce((sum, d) => sum + d, 0) / exitedDurations.length)
        : 0;

    const allDurations = [...currentDurations, ...exitedDurations];
    const avgOverallSeconds =
      allDurations.length > 0
        ? Math.floor(allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length)
        : 0;

    return {
      avg_hold_time_seconds_current: avgCurrentSeconds,
      avg_hold_time_formatted_current: formatDuration(avgCurrentSeconds),
      avg_hold_time_seconds_exited: avgExitedSeconds,
      avg_hold_time_formatted_exited: formatDuration(avgExitedSeconds),
      avg_hold_time_seconds_overall: avgOverallSeconds,
      avg_hold_time_formatted_overall: formatDuration(avgOverallSeconds),
      total_current_holders: currentDurations.length,
      total_exited_holders: exitedDurations.length,
      total_holders: allDurations.length,
    };
  } catch (error) {
    console.error('Error fetching average holding time:', error);
    return {
      avg_hold_time_seconds_current: 0,
      avg_hold_time_formatted_current: '0m',
      avg_hold_time_seconds_exited: 0,
      avg_hold_time_formatted_exited: '0m',
      avg_hold_time_seconds_overall: 0,
      avg_hold_time_formatted_overall: '0m',
      total_current_holders: 0,
      total_exited_holders: 0,
      total_holders: 0,
    };
  }
};

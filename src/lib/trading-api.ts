const API_BASE_URL = 'http://localhost:8002';

interface Trade {
  id: string;
  tradeType: string;
  source: string;
  tokenAmount: string;
  monAmount: string;
  timestamp: number;
  blockNumber: number;
  txHash: string;
  trader: {
    address: string;
  };
}

// Removed GraphQL interfaces and query template since we're using direct API endpoints

export const fetchTrades = async (tokenId: string, timeFrame: string): Promise<Trade[]> => {
  if (!tokenId || tokenId.length < 40 || !tokenId.startsWith('0x')) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/comprehensive-trades/${tokenId}?include_trades=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the API response to match our Trade interface
    return (data.trades || []).map((trade: any) => ({
      id: trade.id || trade.transactionHash || '',
      tradeType: trade.tradeType || 'buy',
      source: trade.source || 'api',
      tokenAmount: trade.tokenAmount || '0',
      monAmount: trade.monAmount || '0',
      timestamp: trade.timestamp || Math.floor(Date.now() / 1000),
      blockNumber: trade.blockNumber || 0,
      txHash: trade.transactionHash || '',
      trader: {
        address: trade.trader || '',
      },
    }));
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};

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
}

export const processTrades = (trades: Trade[]): TradingAnalytics => {
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
    };
  }

  const buyTrades = trades.filter((t) => t.tradeType.toLowerCase() === 'buy');
  const sellTrades = trades.filter((t) => t.tradeType.toLowerCase() === 'sell');

  const buyVolume = buyTrades.reduce((sum, t) => sum + parseFloat(t.monAmount), 0);
  const sellVolume = sellTrades.reduce((sum, t) => sum + parseFloat(t.monAmount), 0);

  const uniqueBuyers = new Set(buyTrades.map((t) => t.trader.address)).size;
  const uniqueSellers = new Set(sellTrades.map((t) => t.trader.address)).size;

  const avgBuySize = buyTrades.length > 0 ? buyVolume / buyTrades.length : 0;
  const avgSellSize = sellTrades.length > 0 ? sellVolume / sellTrades.length : 0;

  const largestBuy =
    buyTrades.length > 0 ? Math.max(...buyTrades.map((t) => parseFloat(t.monAmount))) : 0;
  const largestSell =
    sellTrades.length > 0 ? Math.max(...sellTrades.map((t) => parseFloat(t.monAmount))) : 0;

  const totalVolume = buyVolume + sellVolume;
  const buyPressure = totalVolume > 0 ? Math.round((buyVolume / totalVolume) * 100) : 0;
  const sellPressure = 100 - buyPressure;

  return {
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
  };
};

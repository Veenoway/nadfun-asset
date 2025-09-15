// Nad.fun SDK Client using the official Python SDK
interface TradingEvent {
  eventName: string;
  trader: string;
  token: string;
  amountIn: number;
  amountOut: number;
  blockNumber: number;
  transactionHash: string;
}

interface DexSwapEvent {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  pool: string;
  sender: string;
  recipient: string;
  amount0: number;
  amount1: number;
  sqrtPriceX96: number;
  liquidity: number;
  tick: number;
}

interface CurveSummary {
  buys_24h: number;
  sells_24h: number;
  buy_volume_24h: number;
  sell_volume_24h: number;
  unique_buyers_24h: number;
  unique_sellers_24h: number;
}

interface StreamInfo {
  status: string;
  token: string;
  ws_url: string;
  message: string;
}

class NadfunClient {
  private initialized = false;
  private streams = new Map<string, WebSocket>();

  async initialize() {
    if (this.initialized) return;

    try {
      this.initialized = true;
      console.log('NadfunClient initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NadfunClient:', error);
      throw error;
    }
  }

  private async callDirectAPI(endpoint: string, tokenAddress: string): Promise<any> {
    try {
      console.log(`Calling direct API: ${endpoint} for token: ${tokenAddress}`);

      // Use the direct API endpoint
      const response = await fetch(`http://localhost:8002${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`API result for ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`Error calling direct API for ${endpoint}:`, error);
      throw error;
    }
  }

  async getCurveSummary(tokenAddress: string): Promise<CurveSummary> {
    await this.initialize();

    try {
      console.log('Getting real curve summary for token:', tokenAddress);
      const result = await this.callDirectAPI(`/summary-only/${tokenAddress}`, tokenAddress);
      console.log('Real curve summary:', result);

      // Transform the API response to match our interface
      return {
        buys_24h: result.buys_24h || 0,
        sells_24h: result.sells_24h || 0,
        buy_volume_24h: result.buy_volume_24h || 0,
        sell_volume_24h: result.sell_volume_24h || 0,
        unique_buyers_24h: result.unique_buyers_24h || 0,
        unique_sellers_24h: result.unique_sellers_24h || 0,
      };
    } catch (error) {
      console.error('Error getting curve summary:', error);
      return {
        buys_24h: 0,
        sells_24h: 0,
        buy_volume_24h: 0,
        sell_volume_24h: 0,
        unique_buyers_24h: 0,
        unique_sellers_24h: 0,
      };
    }
  }

  async getDexSwaps(tokenAddress: string): Promise<DexSwapEvent[]> {
    await this.initialize();

    try {
      console.log('Getting real DEX swaps for token:', tokenAddress);
      const result = await this.callDirectAPI(
        `/comprehensive-trades/${tokenAddress}?include_trades=true`,
        tokenAddress,
      );
      console.log('Real DEX swaps found:', result.trades?.length || 0);

      // Transform the API response to match our interface
      return (result.trades || []).map((trade: any) => ({
        eventName: 'Swap',
        blockNumber: trade.blockNumber,
        transactionHash: trade.transactionHash,
        pool: trade.pool || '',
        sender: trade.sender || '',
        recipient: trade.recipient || '',
        amount0: trade.amount0 || 0,
        amount1: trade.amount1 || 0,
        sqrtPriceX96: trade.sqrtPriceX96 || 0,
        liquidity: trade.liquidity || 0,
        tick: trade.tick || 0,
      }));
    } catch (error) {
      console.error('Error getting DEX swaps:', error);
      return [];
    }
  }

  async getCurveEvents(tokenAddress: string): Promise<TradingEvent[]> {
    await this.initialize();

    try {
      console.log('Getting real curve events for token:', tokenAddress);
      const result = await this.callDirectAPI(
        `/comprehensive-trades/${tokenAddress}?include_trades=true`,
        tokenAddress,
      );
      console.log('Real curve events found:', result.trades?.length || 0);

      // Transform the API response to match our interface
      return (result.trades || []).map((trade: any) => ({
        eventName: trade.tradeType || 'Trade',
        trader: trade.trader || '',
        token: trade.token || tokenAddress,
        amountIn: trade.amountIn || 0,
        amountOut: trade.amountOut || 0,
        blockNumber: trade.blockNumber || 0,
        transactionHash: trade.transactionHash || '',
      }));
    } catch (error) {
      console.error('Error getting curve events:', error);
      return [];
    }
  }

  async startDexStream(tokenAddress: string): Promise<StreamInfo> {
    await this.initialize();

    try {
      console.log('Starting DEX stream for token:', tokenAddress);
      const result = await this.callDirectAPI('/dex-stream', tokenAddress);
      console.log('DEX stream started:', result);
      return result;
    } catch (error) {
      console.error('Error starting DEX stream:', error);
      return {
        status: 'error',
        token: tokenAddress,
        ws_url: '',
        message: 'Failed to start stream',
      };
    }
  }

  // Real-time WebSocket connection for live data
  connectToLiveStream(
    tokenAddress: string,
    onEvent: (event: DexSwapEvent) => void,
  ): WebSocket | null {
    try {
      const wsUrl = 'wss://testnet-rpc.monad.xyz';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for live DEX stream');
        // Subscribe to the token
        const subscribeMessage = {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: [
            'logs',
            {
              topics: [
                '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67', // Swap event topic
                null,
                null,
                '0x' + tokenAddress.slice(2).padStart(64, '0'), // Token address as topic
              ],
            },
          ],
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.method === 'eth_subscription' && data.params?.subscription) {
            // Parse the swap event
            const swapEvent: DexSwapEvent = {
              eventName: 'Swap',
              blockNumber: parseInt(data.params.result.blockNumber, 16),
              transactionHash: data.params.result.transactionHash,
              pool: data.params.result.address,
              sender: '0x' + data.params.result.topics[1].slice(26),
              recipient: '0x' + data.params.result.topics[2].slice(26),
              amount0: parseInt(data.params.result.data.slice(0, 66), 16),
              amount1: parseInt(data.params.result.data.slice(66, 130), 16),
              sqrtPriceX96: parseInt(data.params.result.data.slice(130, 194), 16),
              liquidity: parseInt(data.params.result.data.slice(194, 258), 16),
              tick: parseInt(data.params.result.data.slice(258, 322), 16),
            };
            onEvent(swapEvent);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Store the connection
      this.streams.set(tokenAddress, ws);

      return ws;
    } catch (error) {
      console.error('Error connecting to live stream:', error);
      return null;
    }
  }

  disconnectFromLiveStream(tokenAddress: string): void {
    const ws = this.streams.get(tokenAddress);
    if (ws) {
      ws.close();
      this.streams.delete(tokenAddress);
      console.log('Disconnected from live stream for token:', tokenAddress);
    }
  }

  // Cleanup all streams
  disconnectAllStreams(): void {
    this.streams.forEach((ws, tokenAddress) => {
      ws.close();
      console.log('Disconnected from live stream for token:', tokenAddress);
    });
    this.streams.clear();
  }
}

// Export singleton instance
export const nadfunClient = new NadfunClient();

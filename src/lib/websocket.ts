// WebSocket service for real-time Monad blockchain data
export interface BlockHeader {
  blockId: string;
  commitState: 'Proposed' | 'Voted' | 'Finalized' | 'Verified';
  hash: string;
  parentHash: string;
  number: string;
  timestamp: string;
  gasLimit: string;
  gasUsed: string;
  baseFeePerGas: string;
  size: string;
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed: boolean;
}

export interface RealTimeData {
  type: 'block' | 'transaction' | 'log';
  data: BlockHeader | TransactionLog | any;
  timestamp: number;
}

export class MonadWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, number> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageId = 1;

  // Monad testnet WebSocket endpoint
  private wsUrl = 'wss://testnet-rpc.monad.xyz';

  // Event callbacks
  private onBlockCallback?: (block: BlockHeader) => void;
  private onTransactionCallback?: (tx: any) => void;
  private onLogCallback?: (log: TransactionLog) => void;
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private onErrorCallback?: (error: any) => void;

  constructor() {
    // Only setup event handlers in the browser
    if (typeof window !== 'undefined') {
      this.setupEventHandlers();
    }
  }

  private setupEventHandlers() {
    // Auto-reconnect on connection loss
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.connect());
      window.addEventListener('focus', () => this.connect());
    }
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;
      console.log('🔌 Connecting to Monad WebSocket...');

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Connected to Monad WebSocket');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.onConnectCallback?.();
          this.subscribeToAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.onDisconnectCallback?.();
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.onErrorCallback?.(error);
          reject(error);
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private subscribeToAll() {
    // Subscribe to new block headers (speculative - faster updates)
    this.subscribe('monadNewHeads');

    // Subscribe to transaction logs for our token contract
    this.subscribe('logs', {
      address: '0x85d15ae02ACe2B4B5a38c835688a63F0988e2187', // HYG/MON token contract
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925', // Approval event
      ],
    });
  }

  private subscribe(method: string, params?: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe');
      return;
    }

    const message = {
      id: this.messageId++,
      jsonrpc: '2.0',
      method: 'eth_subscribe',
      params: params ? [method, params] : [method],
    };

    //console.log(`📡 Subscribing to ${method}:`, message);
    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);

      if (message.method === 'eth_subscription') {
        const { subscription, result } = message.params;

        if (subscription && result) {
          this.processSubscriptionData(subscription, result);
        }
      } else if (message.id && message.result) {
        // Handle subscription confirmation
        console.log('✅ Subscription confirmed:', message);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private processSubscriptionData(subscription: number, result: any) {
    const timestamp = Date.now();

    if (result.blockId) {
      // This is a block header
      const block: BlockHeader = {
        blockId: result.blockId,
        commitState: result.commitState,
        hash: result.hash,
        parentHash: result.parentHash,
        number: result.number,
        timestamp: result.timestamp,
        gasLimit: result.gasLimit,
        gasUsed: result.gasUsed,
        baseFeePerGas: result.baseFeePerGas,
        size: result.size,
      };

      //console.log(`🆕 New block: #${parseInt(block.number, 16)} (${block.commitState})`);
      this.onBlockCallback?.(block);
    } else if (result.transactionHash) {
      // This is a transaction log
      const log: TransactionLog = {
        address: result.address,
        topics: result.topics,
        data: result.data,
        blockNumber: result.blockNumber,
        transactionHash: result.transactionHash,
        transactionIndex: result.transactionIndex,
        blockHash: result.blockHash,
        logIndex: result.logIndex,
        removed: result.removed,
      };

      //console.log(`💸 New transaction: ${log.transactionHash.slice(0, 10)}...`);
      this.onLogCallback?.(log);
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event setters
  public onBlock(callback: (block: BlockHeader) => void) {
    this.onBlockCallback = callback;
  }

  public onTransaction(callback: (tx: any) => void) {
    this.onTransactionCallback = callback;
  }

  public onLog(callback: (log: TransactionLog) => void) {
    this.onLogCallback = callback;
  }

  public onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  public onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  public onError(callback: (error: any) => void) {
    this.onErrorCallback = callback;
  }

  // Utility methods
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Singleton instance - only create in browser environment
export const monadWebSocket = typeof window !== 'undefined' ? new MonadWebSocket() : null;

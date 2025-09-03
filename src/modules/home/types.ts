// CHART TYPES
export interface MultiLineChartProps {
  data: AddressRow[];
  lines: LineConfig[];
  height?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBorderWidth?: number;
  pointBorderColor?: string;
  tooltipBackground?: string;
  tooltipTitleColor?: string;
  tooltipBodyColor?: string;
  tooltipBorderColor?: string;
  tooltipBorderWidth?: number;
  tooltipDisplayColors?: boolean;
  tooltipPadding?: number;
  tooltipCornerRadius?: number;
  buyPointColor?: string;
  sellPointColor?: string;
  buyPointRadius?: number;
  sellPointRadius?: number;
  showTransactionPoints?: boolean;
  gridDisplay?: boolean;
  gridColor?: string;
  axisColor?: string;
  axisFontSize?: number;
  axisFontFamily?: string;
  axisPadding?: number;
  enableAnimation?: boolean;
  animationDuration?: number;
  enableSecondaryYAxis?: boolean;
  secondaryYAxisPosition?: 'left' | 'right';
  dataType?: DataType;
}

export interface LineConfig {
  key: string;
  label: string;
  lineColor: string;
  fillColor: string;
  lineWidth?: number;
  tension?: number;
  fill?: boolean;
  yAxisID?: string;
}

export interface AxisConfig {
  y: {
    type: 'linear';
    display: boolean;
    position: 'left' | 'right';
    grid?: {
      display?: boolean;
      color?: string;
      drawOnChartArea?: boolean;
    };
    ticks: {
      color: string;
      font: {
        size: number;
        family: string;
      };
    };
    border: {
      display: boolean;
    };
  };
  y1?: {
    type: 'linear';
    display: boolean;
    position: 'left' | 'right';
    grid?: {
      display: boolean;
      color?: string;
      drawOnChartArea?: boolean;
    };
    ticks: {
      color: string;
      font: {
        size: number;
        family: string;
      };
    };
    border: {
      display: boolean;
    };
  };
}

export type Asset = {
  token_address: string;
  logo: string;
  symbol: string;
  name: string;
  price: number;
  chart: ChartPoint[];
};

export type DataType = 'price' | 'volume';

export type TokenInfo = {
  image_uri: string;
  name: string;
  symbol: string;
  token_id: string;
};

export type TokenInfoWithAccountInfo = {
  created_at: number;
  description: string;
  image_uri: string;
  is_king: boolean;
  is_king_created: boolean;
  is_listing: boolean;
  market_cap: string;
  name: string;
  price: string;
  symbol: string;
  telegram: string;
  token_id: string;
  total_supply: string;
  transaction_hash: string;
  twitter: string;
  website: string;
  account_info: {
    account_id: string;
    nickname: string;
    image_uri: string;
    follower_count: number;
    following_count: number;
  };
};
export type ChartPoint = {
  data: { t: number; o: number; h: number; l: number; c: number; v?: number }[];
};

export type AddressRow<TChart = ChartPoint> = {
  address: `0x${string}`;
  token: { data: TokenInfo };
  chart: { data: TChart[] };
  isLoading: boolean;
  error: Error | null;
};

export type AddressRows<TChart = ChartPoint> = AddressRow<TChart>[];

export interface AccountInfo {
  account_id: string;
  nickname: string;
  image_uri: string;
  follower_count: number;
  following_count: number;
}

export interface OrderTokenResponse {
  order_type: string;
  order_token: Array<{
    token_info: {
      token_id: string;
      name: string;
      symbol: string;
      image_uri: string;
      description: string;
      market_cap: string;
      reserve_token: string;
      created_at: number;
      market_type: string;
      score: number;
    };
    account_info: AccountInfo;
  }>;
  total_count: number;
}

export interface UserTokenBalancesResponse {
  tokens: [
    {
      token_info: {
        token_id: string;
        name: string;
        symbol: string;
        image_uri: string;
      };
      balance: string;
    }
  ];
  total_count: number;
}

export interface MarketDataResponse {
  market_type: string;
  token_id: string;
  market_id: string;
  price: string;
  total_supply: string;
}

// Token types
export interface Token {
  token_address: string;
  name: string;
  symbol: string;
  image_uri: string;
  creator?: string;
  total_supply?: string;
  created_at: number;
}

export interface TokenWithDescription extends Token {
  description?: string;
  is_listing?: boolean;
  market_cap?: string;
  price?: string;
  current_amount?: string;
}

// Market types
export interface Market {
  market_address: string;
  market_type: string;
  price: string;
}

export interface DetailedMarket extends Market {
  token_address: string;
  virtual_native?: string;
  virtual_token?: string;
  reserve_token?: string;
  reserve_native?: string;
  latest_trade_at?: number;
  created_at: number;
}

// Position types
export interface Position {
  total_bought_native: string;
  total_bought_token: string;
  current_token_amount: string;
  realized_pnl: string;
  unrealized_pnl: string;
  total_pnl: string;
  created_at: number;
  last_traded_at: number;
}

// Account Position Response
export interface AccountPositionResponse {
  account_address: string;
  positions: Array<{
    token: Token;
    position: Position;
    market: Market;
  }>;
  total_count: number;
}

// Account Created Tokens Response
export interface AccountCreatedTokensResponse {
  tokens: Array<TokenWithDescription>;
  total_count: number;
}

// Token Info Response
export interface TokenInfoResponse {
  token_address: string;
  name: string;
  symbol: string;
  image_uri: string;
  creator: string;
  total_supply: string;
  description?: string;
  is_listing?: boolean;
  created_at: number;
}

// Token Chart Response
export interface TokenChartResponse {
  prices: Array<{
    timestamp: number;
    price: string;
  }>;
  token_address: string;
  interval: string;
  base_timestamp: number;
  total_count: number;
}

// Swap history types
export interface Swap {
  swap_id: number;
  account_address: string;
  token_address: string;
  is_buy: boolean;
  mon_amount: string;
  token_amount: string;
  created_at: number;
  transaction_hash: string;
}

// Token Swap Response
export interface TokenSwapResponse {
  swaps: Array<Swap>;
  total_count: number;
}

// Token Market Response
export type TokenMarketResponse = DetailedMarket;

// Token Holder types
export interface TokenHolder {
  current_amount: string;
  account_address: string;
  is_dev: boolean;
}

// Token Holders Response
export interface TokenHoldersResponse {
  holders: Array<TokenHolder>;
  total_count: number;
}

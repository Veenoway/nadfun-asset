export interface MarketData {
  market_type: string;
  token_id: string;
  market_id: string;
  price: string;
  total_supply: string;
}

export interface AccountInfo {
  account_id: string;
  nickname: string;
  image_uri: string;
  follower_count: number;
  following_count: number;
}

export interface TokenInfo {
  token_address: string;
  name: string;
  symbol: string;
  image_uri: string;
  creator: string;
  total_supply: string;
  description?: string;
  is_listing?: boolean;
  created_at: number;
  market_cap?: string;
  token_id?: string;
}

export interface KingOfTheHill {
  token_info: TokenInfo;
  account_info: AccountInfo;
}

export interface OrderTokenResponse {
  king_of_the_hill: KingOfTheHill;
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
    },
  ];
  total_count: number;
}

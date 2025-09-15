import { keepPreviousData, useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { AccountInfo } from '@/lib/types';

export type Direction = 'ASC' | 'DESC';
export type TradeType = 'ALL' | 'BUY' | 'SELL';

export interface Trade {
  account_info: AccountInfo;
  created_at: number;
  is_buy: boolean;
  native_amount: string;
  token_amount: string;
  transaction_hash: string;
  _address: string;
}

export interface TradeHistoryResponse {
  swaps: Trade[];
  total_count: number;
}

interface GetTradesParams {
  address: string;
  page?: number;
  limit?: number;
  direction?: Direction;
  trade_type?: TradeType;
}

async function getTradesForAddress({
  address,
  page = 1,
  limit = 10,
  direction = 'DESC',
  trade_type = 'ALL',
}: GetTradesParams): Promise<{ items: Trade[]; total: number }> {
  const response = await axios.get<TradeHistoryResponse>(
    `/api/nadfun/trade/swap-history/${address}`,
    {
      params: { page, limit, direction, trade_type },
    },
  );

  const items = response.data.swaps.map((it) => ({ ...it, _address: address }));
  return { items, total: response.data.total_count };
}

function dedupeById(data: { address: string; items: Trade[]; total?: number }[]) {
  const items = data.flatMap((d) => d.items);
  const total = data.reduce((acc, d) => acc + (d.total ?? 0), 0);
  const seen = new Set<string | number>();
  const out: Trade[] = [];
  for (const it of items) {
    const key = `${it._address}-${it.created_at ?? Math.random()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return { out, total };
}

const useTradeHistoryOne = (
  address: string,
  page: number = 1,
  limit: number = 10,
  direction: Direction = 'DESC',
  trade_type: TradeType = 'ALL',
  pollingMs = 4000,
): UseQueryResult<{ items: Trade[]; total: number }> => {
  return useQuery({
    queryKey: ['trades-one', address, page, limit, direction, trade_type],
    queryFn: async () => {
      const results = await getTradesForAddress({
        address,
        page,
        limit,
        direction,
        trade_type,
      }).then((r) => ({ address, ...r }));
      const { out: merged, total } = dedupeById([results]);
      return { items: merged, total };
    },
    enabled: !!address,
    placeholderData: keepPreviousData,
    refetchInterval: pollingMs,
    refetchIntervalInBackground: true,
    staleTime: pollingMs,
    gcTime: pollingMs * 2,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export { useTradeHistoryOne };

import { keepPreviousData, useQuery } from '@tanstack/react-query';

type Direction = 'ASC' | 'DESC';
type TradeType = 'ALL' | 'BUY' | 'SELL';

export type Trade = {
  account_info: {
    account_id: string;
    follower_count: number;
    following_count: number;
    image_uri: string;
    nickname: string;
  };
  created_at: number;
  is_buy: boolean;
  native_amount: string;
  token_amount: string;
  transaction_hash: string;
  _address: string;
};

type ApiResp = { swaps?: Trade[]; total_count?: number };

type GetTradesParams = {
  address: string;
  page?: number;
  limit?: number;
  direction?: Direction;
  trade_type?: TradeType;
  signal?: AbortSignal;
};

async function getTradesForAddress({
  address,
  page = 1,
  limit = 15,
  direction = 'DESC',
  trade_type = 'ALL',
  signal,
}: GetTradesParams): Promise<{ items: Trade[]; total?: number }> {
  const url = `/api/history/${address}?page=${page}&limit=${limit}&direction=${direction}&trade_type=${trade_type}`;

  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${body}`);
  }
  const json: ApiResp = await res.json();
  const items = json.swaps ?? [];
  const total = json.total_count;

  return { items: items.map((it) => ({ ...it, _address: address })), total };
}

function sortByTimeDesc(a: Trade, b: Trade) {
  const ta = a.created_at ?? 0;
  const tb = b.created_at ?? 0;
  return tb - ta;
}

function dedupeById(items: Trade[]) {
  const seen = new Set<string | number>();
  const out: Trade[] = [];
  for (const it of items) {
    const key = `${it._address}-${it.created_at ?? Math.random()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

export function useTradeHistoryMany(
  addresses: string[],
  page: number,
  limit: number,
  direction: Direction,
  trade_type: TradeType,
  pollingMs = 4000
) {
  const addrs = addresses;

  return useQuery({
    queryKey: ['trades-many', addrs, page, limit, direction, trade_type],
    enabled: addrs.length > 0,
    placeholderData: keepPreviousData,
    refetchInterval: pollingMs,
    refetchIntervalInBackground: true,
    staleTime: pollingMs,
    refetchOnWindowFocus: false,
    retry: 2,
    queryFn: async ({ signal }) => {
      const results = await Promise.all(
        addrs.map((addr) =>
          getTradesForAddress({ address: addr, page, limit, direction, trade_type, signal }).then(
            (r) => ({ address: addr, ...r })
          )
        )
      );
      const merged: Trade[] = dedupeById(results.flatMap((r) => r.items)).sort(sortByTimeDesc);
      return merged;
    },
  });
}

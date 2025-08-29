import { TokenInfo } from '@/modules/home/types';
import { toPoints } from '@/modules/home/utils/number';
import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

type TokenAddress = string;

type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type MultiTokenData = {
  address: string;
  token: {
    data: TokenInfo;
    isLoading: boolean;
    error: unknown;
    refetch: () => Promise<unknown>;
  };
  chart: {
    data: CandlePoint[];
    isLoading: boolean;
    error: unknown;
  };
};

export function useMultiTokenChart(addresses: TokenAddress[], pollingMs = 4000) {
  const chartQueries = useQueries({
    queries: addresses.map((address) => ({
      queryKey: ['chart', address],
      queryFn: ({ signal }: { signal: AbortSignal }) => getChart({ address }, { signal }),
      refetchInterval: pollingMs,
      refetchIntervalInBackground: true,
      staleTime: pollingMs,
      enabled: !!address,
    })),
  });

  const tokenQueries = useQueries({
    queries: addresses.map((address) => ({
      queryKey: ['token', address],
      queryFn: ({ signal }: { signal: AbortSignal }) => getToken(address, { signal }),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: !!address,
    })) as unknown as UseQueryOptions<unknown, Error, unknown, readonly unknown[]>[],
  });

  const tokensData: MultiTokenData[] = addresses.map((address, index) => {
    const chartQuery = chartQueries[index];
    const tokenQuery = tokenQueries[index];
    const tokenInfo = (
      tokenQuery as unknown as { data: { tokens: { tokens: { token_info: TokenInfo }[] } } }
    )?.data?.tokens?.tokens?.[0]?.token_info;

    return {
      address,
      token: {
        data: tokenInfo,
        isLoading: tokenQuery?.isLoading || false,
        error: tokenQuery?.error,
        refetch: tokenQuery?.refetch,
      },
      chart: {
        data: toPoints(chartQuery?.data || []) ?? [],
        isLoading: chartQuery?.isLoading || false,
        error: chartQuery?.error,
        refetch: chartQuery?.refetch,
      },
      isLoading: tokenQuery?.isLoading || chartQuery?.isLoading || false,
      error: tokenQuery?.error || chartQuery?.error,
    };
  });

  return tokensData;
}

export function useTokenInfo(address: string) {
  return useQuery({
    queryKey: ['token', address],
    queryFn: ({ signal }) => getToken(address, { signal }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    enabled: !!address,
  });
}

export function useChartInfo(address: string, pollingMs = 4000) {
  return useQuery({
    queryKey: ['chart', address],
    queryFn: ({ signal }) => getChart({ address }, { signal }),
    refetchInterval: pollingMs,
    refetchIntervalInBackground: true,
    staleTime: pollingMs,
    enabled: !!address,
  });
}

export function useTokenManager() {
  const [selectedAddresses, setSelectedAddresses] = useState<TokenAddress[]>([
    '0x76bb094B5B0C646c4A0e96c5e40239aD62d069FB',
  ]);

  const addToken = (address: TokenAddress) => {
    if (!selectedAddresses.includes(address) && selectedAddresses.length < 10) {
      setSelectedAddresses((prev) => [...prev, address]);
    }
  };

  const removeToken = (address: TokenAddress) => {
    setSelectedAddresses((prev) => prev.filter((addr) => addr !== address));
  };

  const clearAllTokens = () => {
    setSelectedAddresses([]);
  };

  const replaceTokens = (addresses: TokenAddress[]) => {
    setSelectedAddresses(addresses.slice(0, 10));
  };

  return {
    selectedAddresses,
    addToken,
    removeToken,
    clearAllTokens,
    replaceTokens,
    hasMaxTokens: selectedAddresses.length >= 10,
  };
}

export async function getChart(
  params: {
    address: string;
    resolution?: number | string;
    from?: number;
    to?: number;
    countback?: number;
  },
  opts?: { signal?: AbortSignal }
) {
  const qs = new URLSearchParams({
    address: params.address,
    resolution: String(params.resolution ?? 1),
    from: String(params.from ?? 0),
    to: String(params.to ?? 1756096858),
    countback: String(params.countback ?? 300),
  });

  const res = await fetch(`/api/chart/${params.address}?${qs.toString()}`, {
    cache: 'no-store',
    signal: opts?.signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getToken(address: string, opts?: { signal?: AbortSignal }) {
  const res = await fetch(`/api/token/${address}`, {
    cache: 'no-store',
    signal: opts?.signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

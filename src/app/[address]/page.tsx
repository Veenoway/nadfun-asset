import Home from '@/modules/home';
import { Asset, TokenInfo } from '@/modules/home/types';
import { toPoints } from '@/modules/home/utils/number';

type PageData = {
  token_address: string;
  token: {
    data: TokenInfo | null;
    error?: string;
  };
  chart: {
    data: unknown[];
    error?: string;
  };
};

async function getPageData(address: string): Promise<PageData | null> {
  if (!address) return null;

  try {
    const tokenRes = await fetch(`https://testnet-v3-api.nad.fun/search/${address}`, {
      cache: 'no-store',
    });

    if (!tokenRes.ok) {
      throw new Error(`Token API error: ${tokenRes.status}`);
    }

    const tokenInfo = await tokenRes.json();

    const qs = new URLSearchParams({
      resolution: '1',
      from: '0',
      to: String(Math.floor(Date.now())),
      countback: '300',
    });

    const chartRes = await fetch(
      ` https://testnet-v3-api.nad.fun/trade/chart/${address}?${qs.toString()}`,
      {
        cache: 'no-store',
      }
    );
    const chartInfo = await chartRes.json();

    return {
      token_address: address,
      token: {
        data: tokenInfo?.tokens?.tokens?.[0],
      },
      chart: {
        data: toPoints(chartInfo || []) ?? [],
      },
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      token_address: address,
      token: { data: null, error: error instanceof Error ? error.message : 'Unknown error' },
      chart: { data: [], error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const data = await getPageData(address);

  if (!data) {
    return <div>Invalid address</div>;
  }

  return <Home defaultSelectedTokens={[data as unknown as Asset]} />;
}

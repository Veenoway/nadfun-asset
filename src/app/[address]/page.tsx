import Home from '@/modules/home';
import { Asset, TokenInfo, TokenInfoWithAccountInfo } from '@/modules/home/types';
import { toPoints } from '@/modules/home/utils/number';

type PageData = {
  selectedTokens: {
    token_address: string;
    token: {
      data: TokenInfo | null;
      error?: string;
    };
    chart: {
      data: unknown[];
      error?: string;
    };
  }[];
  info: TokenInfoWithAccountInfo | null;
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

    const tokenData = await tokenRes.json();

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

    const tokenInfoRes = await fetch(`https://testnet-v3-api.nad.fun/token/${address}`, {
      cache: 'no-store',
    });
    const tokenInfo = await tokenInfoRes.json();

    return {
      selectedTokens: [
        {
          token_address: address,
          token: {
            data: tokenData?.tokens?.tokens?.[0],
          },
          chart: {
            data: toPoints(chartInfo || []) ?? [],
          },
        },
      ],
      info: tokenInfo.token,
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      selectedTokens: [
        {
          token_address: address,
          token: { data: null, error: error instanceof Error ? error.message : 'Unknown error' },
          chart: { data: [], error: error instanceof Error ? error.message : 'Unknown error' },
        },
      ],
      info: null,
    };
  }
}

export default async function Page({ params }: { params: { address: string } }) {
  const { address } = await params;
  const data = await getPageData(address);

  if (!data) {
    return <div>Invalid address</div>;
  }

  return (
    <Home defaultSelectedTokens={data.selectedTokens as unknown as Asset[]} info={data.info} />
  );
}

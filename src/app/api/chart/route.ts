import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_NAD_API_BASE ?? 'https://testnet-v3-api.nad.fun';

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  const { searchParams } = new URL(req.url);

  const chartUrl = `${BASE_URL}/trade/chart/${params?.address}?${searchParams.toString()}`;
  const chartResponse = await fetch(chartUrl, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });

  const tokenUrl = `${BASE_URL}/search/${params?.address}`;
  const tokenResponse = await fetch(tokenUrl, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });

  const chartData = await chartResponse.text();
  const tokenData = await tokenResponse.text();

  const response = {
    chart: JSON.parse(chartData),
    token: JSON.parse(tokenData),
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_NAD_API_BASE ?? 'https://testnet-v3-api.nad.fun';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const address = sp.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  const fwd = new URLSearchParams(sp);
  fwd.delete('address');

  const upstreamUrl = `${BASE_URL}/trade/chart/${address}?${fwd.toString()}`;

  const upstream = await fetch(upstreamUrl, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  });
}

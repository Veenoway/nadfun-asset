import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_NAD_API_BASE ?? 'https://testnet-v3-api.nad.fun';

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  const url = `${BASE_URL}/search/${params?.address}`;

  const upstream = await fetch(url, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

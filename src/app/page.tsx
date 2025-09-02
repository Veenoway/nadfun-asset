'use client';

import { useTokensByCreationTime, useTokensByMarketCap } from '@/hooks/useTokens';
import { InfiniteTokenSelector } from '@/modules/home/components/InfiniteTokenSelector';
import { formatMarketCap, formatNickname, formatRelativeTime } from '@/utils/helpers';
import Image from 'next/image';
import { useEffect } from 'react';
import { formatEther } from 'viem';

export default function HomePage() {
  const { data: tokens } = useTokensByMarketCap(1, 20);
  const { data: tokensByCreationTime } = useTokensByCreationTime(1, 20);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assets = tokens?.order_token.map((token: any) => ({
    logo: token.token_info.image_uri,
    symbol: token.token_info.symbol,
    name: token.token_info.name,
    token_address: token.token_info.token_id,
  }));

  useEffect(() => {
    console.log(tokensByCreationTime);
  }, [tokensByCreationTime]);

  return (
    <section>
      <InfiniteTokenSelector tokens={assets || []} />
      <div className="flex justify-between w-full text-white px-8 gap-4">
        <div className="w-1/4 border border-white space-y-4 p-4 rounded-lg">
          <div className="flex items-center gap-2 rounded-lg border border-purple-700 bg-[#333333]">
            {tokensByCreationTime?.king_of_the_hill.token_info.image_uri && (
              <div className="w-16 h-16">
                <Image
                  src={tokensByCreationTime?.king_of_the_hill.token_info.image_uri}
                  alt={tokensByCreationTime?.king_of_the_hill.token_info.name}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover rounded-l-lg"
                />
              </div>
            )}
            <div className="w-full p-0.5">
              <div className="flex justify-between items-center text-xs w-full">
                <p>
                  {formatRelativeTime(
                    Number(tokensByCreationTime?.king_of_the_hill.token_info.created_at)
                  )}
                </p>
                <p>
                  {formatNickname(
                    tokensByCreationTime?.king_of_the_hill.account_info.nickname || ''
                  )}
                </p>
              </div>
              <div className="text-sm flex items-center gap-4">
                <p>{tokensByCreationTime?.king_of_the_hill.token_info.name}</p>
                <p>{tokensByCreationTime?.king_of_the_hill.token_info.symbol}</p>
              </div>
              {tokensByCreationTime?.king_of_the_hill.token_info.market_cap && (
                <p className="text-xs">
                  Mkt. Cap:{' '}
                  {formatMarketCap(tokensByCreationTime?.king_of_the_hill.token_info.market_cap)}{' '}
                  MON
                </p>
              )}
            </div>
          </div>
          {tokensByCreationTime?.order_token.map((token) => (
            <div className="flex items-center gap-2 rounded-lg border border-purple-700 bg-[#333333]">
              {token.token_info.image_uri && (
                <div className="w-16 h-16">
                  <Image
                    src={token.token_info.image_uri}
                    alt={token.token_info.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>
              )}
              <div className="w-full p-0.5">
                <div className="flex justify-between items-center text-xs w-full">
                  <p>{formatRelativeTime(Number(token.token_info.created_at))}</p>
                  <p>{formatNickname(token.account_info.nickname || '')}</p>
                </div>
                <div className="text-sm flex items-center gap-4">
                  <p>{token.token_info.name}</p>
                  <p>{token.token_info.symbol}</p>
                </div>
                {token.token_info.market_cap && (
                  <p className="text-xs">
                    Mkt. Cap: {formatMarketCap(token.token_info.market_cap)} MON
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="w-3/4 border border-white space-y-4 p-4 rounded-lg flex tab">
          <div className="w-2/3 border border-borderColor">
            <div>Chart</div>
            <div>Order history</div>
          </div>
          <div className="w-1/3 border border-borderColor">
            <div className="text-2xl font-bold">Buy/Sell</div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import { useState } from 'react';
import { formatMarketCap, formatNickname, formatRelativeTime } from '@/utils/helpers';
import { OrderTokenResponse } from '../types';
import { useUserTokenBalances } from '@/hooks/useTokens';
import { useAccount } from 'wagmi';

interface RecentTokensProps {
  tokensByCreationTime?: OrderTokenResponse;
  handleTokenSelect: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: OrderTokenResponse['king_of_the_hill'] | OrderTokenResponse['order_token'][0] | any,
    source: 'recent' | 'my-tokens'
  ) => void;
}

const RecentTokens = ({ tokensByCreationTime, handleTokenSelect }: RecentTokensProps) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'my-tokens'>('recent');
  const { address } = useAccount();
  const { data: userTokens } = useUserTokenBalances(address);

  return (
    <div className="w-1/4 space-y-4 p-4 rounded-lg tokens">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-600">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Tokens
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-tokens'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('my-tokens')}
        >
          My Tokens
        </button>
      </div>

      <div className="max-h-[850px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300">
        {/* Tab Content */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {/* King of the Hill Token */}
            <div
              className="flex items-center gap-2 rounded-lg border border-purple-300/80 bg-[#333333] cursor-pointer hover:bg-[#444444] transition-colors"
              onClick={() =>
                handleTokenSelect(
                  tokensByCreationTime?.king_of_the_hill as OrderTokenResponse['king_of_the_hill'],
                  'recent'
                )
              }
            >
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
                <div className="flex justify-between items-center text-xs w-full pr-2">
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

            {/* Other Tokens */}
            {tokensByCreationTime?.order_token.map((token) => (
              <div
                key={token.token_info.token_id}
                className="flex items-center gap-2 rounded-lg border border-purple-300/80 bg-[#333333] cursor-pointer hover:bg-[#444444] transition-colors shadow-md shadow-purple-300/20"
                onClick={() => handleTokenSelect(token, 'recent')}
              >
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
                  <div className="flex justify-between items-center text-xs w-full pr-2">
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
        )}

        {activeTab === 'my-tokens' && (
          <div className="space-y-4">
            {!address ? (
              <div className="text-center text-gray-400 py-8">
                <p>Connect your wallet to view your tokens</p>
              </div>
            ) : userTokens?.tokens && userTokens.tokens.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              userTokens.tokens.map((token: any) => (
                <div
                  key={token.token_info.token_id}
                  className="flex items-center gap-2 rounded-lg border border-purple-300/80 bg-[#333333] cursor-pointer hover:bg-[#444444] transition-colors shadow-md shadow-purple-300/20"
                  onClick={() => handleTokenSelect(token, 'my-tokens')}
                >
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
                    <div className="flex justify-between items-center text-xs w-full pr-2">
                      <p>Balance: {token.balance}</p>
                      <p>Wallet Token</p>
                    </div>
                    <div className="text-sm flex items-center gap-4">
                      <p>{token.token_info.name}</p>
                      <p>{token.token_info.symbol}</p>
                    </div>
                    {token.token_info.market_cap ? (
                      <p className="text-xs">
                        Mkt. Cap: {formatMarketCap(token.token_info.market_cap)} MON
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Market cap unavailable</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No tokens found in your wallet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTokens;

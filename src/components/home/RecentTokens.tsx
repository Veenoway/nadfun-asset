'use client';

import { useUserTokenBalances } from '@/hooks/useTokens';
import { useTokenSearch } from '@/hooks/useTokenSearch';
import {
  formatMarketCap,
  formatNickname,
  formatRelativeTime,
  formatTokenBalance,
} from '@/lib/helpers';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { OrderTokenResponse } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface RecentTokensProps {
  tokensByCreationTime?: OrderTokenResponse;
  handleTokenSelect: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: OrderTokenResponse['king_of_the_hill'] | OrderTokenResponse['order_token'][0] | any,
    source: 'recent' | 'my-tokens' | 'search',
  ) => void;
}

const RecentTokens = ({ tokensByCreationTime, handleTokenSelect }: RecentTokensProps) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'my-tokens' | 'search'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const { address } = useAccount();
  const { data: userTokens } = useUserTokenBalances(address);
  const { data: searchResults, isLoading: isSearching } = useTokenSearch(searchQuery);

  return (
    <div className="w-full space-y-4 p-2 pt-1 mr-2 rounded tokens bg-secondary border border-borderColor">
      <div className="flex justify-between border-b border-white/10">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-white border-b-2 border-white'
              : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Tokens
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-tokens'
              ? 'text-white border-b-2 border-white'
              : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveTab('my-tokens')}
        >
          My Tokens
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-white border-b-2 border-white'
              : 'text-white/60 hover:text-white'
          }`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
      </div>

      <div className="max-h-[68vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300 min-w-[300px]">
        {activeTab === 'recent' && (
          <div className="space-y-2">
            {tokensByCreationTime?.order_token.map((token) => (
              <div
                key={token.token_info.token_id}
                className="flex items-center rounded border border-borderColor bg-quaternary/20 cursor-pointer hover:border-white/15 hover:bg-quaternary transition-colors"
                onClick={() => handleTokenSelect(token, 'recent')}
              >
                <div className="w-full flex items-center">
                  {token.token_info.image_uri && (
                    <div className="w-auto h-full ml-2">
                      <img
                        src={token.token_info.image_uri}
                        alt={token.token_info.name}
                        width={80}
                        height={80}
                        className="min-w-[70px] h-[70px] object-cover rounded-full aspect-square w-fit border border-borderColor"
                      />
                    </div>
                  )}
                  <div className="p-3 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-white bg-quaternary px-1 rounded">
                        {formatRelativeTime(Number(token.token_info.created_at))}
                      </span>
                      <span className="text-[10px] text-brandColor font-normal">
                        by {formatNickname(token.account_info.nickname || '')}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-white truncate">
                          {token.token_info.name}
                        </h3>
                        <span className="text-xs text-white/70 -mb-0.5 uppercase">
                          {token.token_info.symbol}
                        </span>
                      </div>
                    </div>

                    {token.token_info.market_cap && (
                      <div className="flex items-center justify-between pt-2 border-t border-borderColor">
                        <span className="text-xs text-white/60">Market Cap</span>
                        <span className="text-xs font-semibold text-white">
                          {formatMarketCap(token.token_info.market_cap)} MON
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-tokens' && (
          <div className="space-y-2">
            {!address ? (
              <div className="text-center text-gray-400 py-8">
                <p>Connect your wallet to view your tokens</p>
              </div>
            ) : userTokens?.tokens && userTokens.tokens.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              userTokens.tokens.map((token: any) => (
                <div
                  key={token.token_info.token_id}
                  className="flex items-center rounded border border-borderColor bg-quaternary/20 cursor-pointer hover:border-white/15 hover:bg-quaternary transition-colors"
                  onClick={() => handleTokenSelect(token, 'my-tokens')}
                >
                  <div className="p-3 w-full flex items-center gap-2">
                    {token.token_info.image_uri && (
                      <div className="w-auto h-full">
                        <img
                          src={token.token_info.image_uri}
                          alt={token.token_info.name}
                          width={80}
                          height={80}
                          className="min-w-[70px] h-[70px] object-cover rounded-full aspect-square w-fit border border-borderColor"
                        />
                      </div>
                    )}
                    <div className="w-full">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-white truncate">
                            {token.token_info.name}
                          </h3>
                          <span className="text-xs text-white/70 -mb-0.5 uppercase">
                            {token.token_info.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-borderColor">
                        <span className="text-xs text-white/60">Balance</span>
                        <span className="text-xs font-semibold text-white">
                          {formatTokenBalance(token.balance, true)} {token.token_info.symbol}
                        </span>
                      </div>
                    </div>
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

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="px-2">
              <Input
                type="text"
                placeholder="Search by contract address or token name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              {isSearching ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Searching...</p>
                </div>
              ) : searchQuery.trim() === '' ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Enter a contract address or token name to search</p>
                </div>
              ) : searchResults?.tokens.tokens && searchResults.tokens.tokens.length > 0 ? (
                searchResults.tokens.tokens.map((token) => (
                  <div
                    key={token.token_info.token_id}
                    className="flex items-center rounded border border-borderColor bg-quaternary/20 cursor-pointer hover:border-white/15 hover:bg-quaternary transition-colors"
                    onClick={() => handleTokenSelect(token, 'search')}
                  >
                    <div className="w-full flex items-center">
                      {token.token_info.image_uri && (
                        <div className="w-auto h-full ml-2">
                          <img
                            src={token.token_info.image_uri}
                            alt={token.token_info.name}
                            width={80}
                            height={80}
                            className="min-w-[70px] h-[70px] object-cover rounded-full aspect-square w-fit border border-borderColor"
                          />
                        </div>
                      )}
                      <div className="p-3 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-white bg-quaternary px-1 rounded">
                            {formatRelativeTime(Number(token.created_at))}
                          </span>
                          <span className="text-[10px] text-brandColor font-normal">
                            Search Result
                          </span>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-white truncate">
                              {token.token_info.name}
                            </h3>
                            <span className="text-xs text-white/70 -mb-0.5 uppercase">
                              {token.token_info.symbol}
                            </span>
                          </div>
                        </div>

                        {token.market_cap && (
                          <div className="flex items-center justify-between pt-2 border-t border-borderColor">
                            <span className="text-xs text-white/60">Market Cap</span>
                            <span className="text-xs font-semibold text-white">
                              {formatMarketCap(token.market_cap)} MON
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No tokens found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { RecentTokens };

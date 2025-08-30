'use client';

import { useAccount } from 'wagmi';
import { useUserTokenBalances } from '@/hooks/useTokens';
import { formatEther } from 'viem';
import { cn } from '@/utils/cn';
import { useMainStore } from '@/store/useMainStore';
import { useState } from 'react';

export const TokenBalances = () => {
  const { address } = useAccount();
  const { data: balances, isLoading, error } = useUserTokenBalances(address);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const { setSelectedTokens: setStoreSelectedTokens } = useMainStore();

  if (!address) {
    return (
      <div className="p-6 text-center">
        <p className="text-black/60">Please connect your wallet to view your token balances</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandColor mx-auto"></div>
        <p className="text-black/60 mt-2">Loading your token balances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading token balances</p>
        <p className="text-black/60 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  if (!balances || balances.total_count === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-black/60">No tokens found in your wallet</p>
        <p className="text-black/40 text-sm mt-1">Start trading to see your balances here</p>
      </div>
    );
  }

  const handleTokenSelect = (tokenId: string) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId);
    } else {
      newSelected.add(tokenId);
    }
    setSelectedTokens(newSelected);

    // Update the store with selected tokens for selling
    const selectedTokenData = balances.tokens
      .filter((token: any) => newSelected.has(token.token_info.token_id))
      .map((token: any) => ({
        token_address: token.token_info.token_id,
        symbol: token.token_info.symbol,
        name: token.token_info.name,
        logo: token.token_info.image_uri || '/token.png',
        price: 0,
        chart: [],
        balance: token.balance,
      }));

    setStoreSelectedTokens(selectedTokenData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">Your Token Balances</h3>
        <div className="flex items-center gap-2">
          {selectedTokens.size > 0 && (
            <span className="text-sm text-brandColor font-medium">
              {selectedTokens.size} selected
            </span>
          )}
          <span className="text-sm text-black/60">
            {balances.total_count} token{balances.total_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {balances.tokens.map((token: any, index: number) => {
          const isSelected = selectedTokens.has(token.token_info.token_id);
          return (
            <div
              key={`${token.token_info.token_id}-${index}`}
              onClick={() => handleTokenSelect(token.token_info.token_id)}
              className={cn(
                'bg-secondary cursor-pointer rounded-lg p-4 border transition-colors relative',
                isSelected
                  ? 'border-brandColor bg-brandColor/10'
                  : 'border-borderColor hover:border-brandColor/50'
              )}
            >
              {/* Checkbox */}
              <div className="absolute top-3 right-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                    isSelected ? 'bg-brandColor border-brandColor' : 'border-white/40'
                  )}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 pr-8">
                <div className="flex items-center gap-3">
                  <img
                    src={token.token_info.image_uri || '/token.png'}
                    alt={token.token_info.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/token.png';
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-white">{token.token_info.symbol}</h4>
                    <p className="text-sm text-white/60">{token.token_info.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white">
                    {Number(formatEther(BigInt(token.balance || '0'))).toFixed(4)}{' '}
                    {token.token_info.symbol}
                  </p>
                </div>
              </div>

              {/* Token Address */}
              <div className="mt-2 text-xs text-white/40">
                {token.token_info.token_id.slice(0, 10)}...{token.token_info.token_id.slice(-8)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

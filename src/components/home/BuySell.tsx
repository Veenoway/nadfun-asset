'use client';

import { useNadFunTrading } from '@/hooks/useNadFunTrading';
import { useUserTokenBalances } from '@/hooks/useTokens';
import { cn } from '@/lib/utils';
import { formatNumber, formatTokenBalance } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { KingOfTheHill } from '@/lib/types';
import { Input } from '../ui';

interface BuySellProps {
  selectedToken: KingOfTheHill;
  isFromMyTokens?: boolean;
}

const BuySell = ({ selectedToken, isFromMyTokens }: BuySellProps) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [fromAmount, setFromAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [userTokenBalance, setUserTokenBalance] = useState('0.000000');

  const userOwnsToken = userTokenBalance !== '0.000000' && Number(userTokenBalance) > 0;

  const tradingAmount = mode === 'buy' ? fromAmount : tokenAmount;
  const {
    isLoading: isTradingLoading,

    isSuccess: isTradeSuccess,
    isListed,
    isLocked,
    buyToken,
    sellToken,
    amountOut,
  } = useNadFunTrading(selectedToken?.token_info.token_id, tradingAmount, mode === 'sell');

  const { data: tokenBalance } = useUserTokenBalances(address);

  useEffect(() => {
    const bal = tokenBalance?.tokens.find(
      (token) => token.token_info.token_id === selectedToken?.token_info.token_id,
    )?.balance;
    if (bal) {
      setUserTokenBalance(bal);
    } else {
      setUserTokenBalance('0.000000');
    }
  }, [tokenBalance, selectedToken?.token_info.token_id]);

  // Auto-select sell mode when token is from My Tokens
  useEffect(() => {
    if (isFromMyTokens && userOwnsToken) {
      setMode('sell');
    }
  }, [isFromMyTokens, userOwnsToken]);

  const availableBalance = balance ? Number(formatEther(balance.value)) : 0;

  const handlePercentageSelect = (percentage: number) => {
    const balanceInEther = formatEther(BigInt(userTokenBalance));
    const amount = (Number(balanceInEther) * percentage) / 100;
    setTokenAmount(amount.toFixed(6));
  };

  useEffect(() => {
    if (isTradeSuccess) {
      alert('Token traded successfully!');

      setFromAmount('');
      setTokenAmount('');
    }
  }, [isTradeSuccess]);

  const handleSwap = async () => {
    if (!selectedToken?.token_info.token_id) {
      console.error('No token selected');
      return;
    }

    // Check if token is available for bonding curve
    if (isListed || isLocked) {
      console.error('Token is listed or locked, cannot use bonding curve');
      return;
    }

    if (mode === 'buy') {
      if (!fromAmount || Number(fromAmount) <= 0) {
        console.error('Invalid amount');
        return;
      }

      if (Number(fromAmount) > availableBalance) {
        console.error('Insufficient MON balance');
        return;
      }

      // Execute the buy
      await buyToken({
        tokenAddress: selectedToken.token_info.token_id,
        amountIn: fromAmount,
        amountOutMin: amountOut || undefined,
      });
    } else {
      // Validate input
      if (!tokenAmount || Number(tokenAmount) <= 0) {
        console.error('Invalid token amount');
        return;
      }

      // Validate token balance for selling
      if (!selectedToken) {
        console.error('No token selected');
        return;
      }

      // Convert wei balance to ether for comparison
      const balanceInEther = formatEther(BigInt(userTokenBalance));
      if (Number(tokenAmount) > Number(balanceInEther)) {
        console.error('Insufficient token balance');
        return;
      }

      // Execute the sell
      await sellToken({
        tokenAddress: selectedToken.token_info.token_id,
        amountIn: tokenAmount,
        amountOutMin: amountOut || undefined,
      });
    }
  };

  return (
    <div className="text-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex border border-borderColor rounded-md overflow-hidden bg-secondary">
                <button
                  onClick={() => setMode('buy')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    mode === 'buy'
                      ? 'bg-green-600/30 text-green-500'
                      : 'bg-secondary text-white/60 hover:text-white',
                  )}
                >
                  Buy
                </button>
                <button
                  onClick={() => setMode('sell')}
                  disabled={!userOwnsToken}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    mode === 'sell'
                      ? 'bg-red-600/30 text-red-500'
                      : 'bg-secondary text-white/60 hover:text-white',
                    !userOwnsToken && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          {mode === 'buy' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60 font-light">Balance</span>
                <span className="text-sm text-white">{formatNumber(availableBalance)} MON</span>
              </div>
              <Input
                type="text"
                value={fromAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFromAmount(value);
                  }
                }}
                className="text-base font-mono text-white bg-transparent outline-none flex-1 border border-borderColor focus-visible:ring-borderColor h-12"
                placeholder="0.0"
              />

              {fromAmount && Number(fromAmount) > availableBalance && (
                <div className="text-xs text-red-500">Amount exceeds available balance</div>
              )}
              {fromAmount && Number(fromAmount) <= 0 && (
                <div className="text-xs text-red-500">Please enter a valid amount</div>
              )}

              {/* <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white lowercase">MON to receive</span>
                </div>
                <div className="border border-borderColor rounded p-4 bg-quaternary/70">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono text-white">
                      {Number(amountOut).toFixed(4)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">MON</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mediumlowercase">
                  {selectedToken?.token_info.symbol?.toLowerCase()} to sell
                </span>
                <span className="text-xs">
                  Available: {formatTokenBalance(userTokenBalance, true)}{' '}
                  {selectedToken?.token_info.symbol}
                </span>
              </div>

              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handlePercentageSelect(percentage)}
                    className="flex-1 px-3 py-2 text-xs font-medium border border-borderColor bg-secondary hover:bg-secondary/80 text-white/80 hover:text-white rounded-md transition-colors cursor-pointer"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>

              <Input
                type="text"
                value={tokenAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setTokenAmount(value);
                  }
                }}
                className="text-base font-mono text-white bg-transparent outline-none flex-1 border border-borderColor focus-visible:ring-borderColor h-12"
                placeholder="0.0"
              />
              {tokenAmount && Number(tokenAmount) > Number(userTokenBalance) && (
                <div className="text-xs text-red-500">Amount exceeds available balance</div>
              )}
              {tokenAmount && Number(tokenAmount) <= 0 && (
                <div className="text-xs text-red-500">Please enter a valid amount</div>
              )}
            </div>
          )}

          {mode === 'sell' && amountOut && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">MON to receive</span>
              </div>
              <div className="border border-borderColor rounded py-2 px-4 bg-quaternary/70">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono text-white">
                    {Number(amountOut).toFixed(4)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">MON</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={handleSwap}
          disabled={isTradingLoading || isListed || isLocked}
          className="w-full bg-brandColor cursor-pointer hover:bg-brandColor/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 text-sm font-medium rounded transition-colors"
        >
          {isTradingLoading ? 'PROCESSING...' : mode === 'buy' ? 'BUY TOKENS' : 'SELL TOKENS'}
        </button>
      </div>
    </div>
  );
};

export { BuySell };

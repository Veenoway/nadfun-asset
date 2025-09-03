import { formatEther } from 'viem';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useMainStore } from '@/store/useMainStore';
import { useNadFunTrading } from '@/hooks/useNadFunTrading';
import { KingOfTheHillResponse, Token, TokenInfoResponse } from '../types';
import { useUserTokenBalances } from '@/hooks/useTokens';
import { formatTokenBalanceDisplay } from '@/utils/helpers';

interface BuySellProps {
  selectedToken: KingOfTheHillResponse;
}

const BuySell = ({ selectedToken }: BuySellProps) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [fromAmount, setFromAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [userTokenBalance, setUserTokenBalance] = useState('0.000000');

  useEffect(() => {
    console.log(selectedToken);
  }, [selectedToken]);

  const tradingAmount = mode === 'buy' ? fromAmount : tokenAmount;
  const {
    isLoading: isTradingLoading,
    error: tradingError,
    isSuccess: isTradeSuccess,
    isListed,
    isLocked,
    buyToken,
    sellToken,
    amountOut,
    // balance: tradingBalance,
  } = useNadFunTrading(selectedToken?.token_info.token_id, tradingAmount, mode === 'sell');

  const { data: tokenBalance } = useUserTokenBalances(address);

  useEffect(() => {
    console.log({ tokenBalance });

    const bal = tokenBalance?.tokens.find(
      (token) => token.token_info.token_id === selectedToken?.token_info.token_id
    )?.balance;
    console.log({ bal });
    if (bal) {
      setUserTokenBalance(bal);
    } else {
      setUserTokenBalance('0.000000');
    }
  }, [tokenBalance]);

  // Calculate available balance
  const availableBalance = balance ? Number(formatEther(balance.value)) : 0;

  const handlePercentageSelect = (percentage: number) => {
    // Convert wei to ether first, then calculate percentage
    const balanceInEther = formatEther(BigInt(userTokenBalance));
    const amount = (Number(balanceInEther) * percentage) / 100;
    setTokenAmount(amount.toFixed(6));
  };

  // Handle successful trade
  useEffect(() => {
    if (isTradeSuccess) {
      alert('Token traded successfully!');
      setIsOpen(false);
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
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex border border-borderColor rounded-md overflow-hidden bg-secondary">
                <button
                  onClick={() => setMode('buy')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    mode === 'buy'
                      ? 'bg-brandColor text-white'
                      : 'bg-secondary text-white/60 hover:text-white'
                  )}
                >
                  Buy with MON
                </button>
                <button
                  onClick={() => setMode('sell')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium transition-colors',
                    mode === 'sell'
                      ? 'bg-brandColor text-white'
                      : 'bg-secondary text-white/60 hover:text-white'
                  )}
                >
                  Sell for MON
                </button>
              </div>
            </div>
          </div>

          {mode === 'buy' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium  lowercase">mon to spend</span>
                <span className="text-xs ">Available: {availableBalance.toFixed(4)} MON</span>
              </div>
              <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setFromAmount(value);
                      }
                    }}
                    className="text-lg font-mono text-white bg-transparent outline-none flex-1"
                    placeholder="0.0"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">MON</span>
                  </div>
                </div>
              </div>
              {fromAmount && Number(fromAmount) > availableBalance && (
                <div className="text-xs text-red-500">Amount exceeds available balance</div>
              )}
              {fromAmount && Number(fromAmount) <= 0 && (
                <div className="text-xs text-red-500">Please enter a valid amount</div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mediumlowercase">
                  {selectedToken?.token_info.symbol?.toLowerCase()} to sell
                </span>
                <span className="text-xs">
                  Available: {formatTokenBalanceDisplay(userTokenBalance)}{' '}
                  {selectedToken?.token_info.symbol}
                </span>
              </div>

              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handlePercentageSelect(percentage)}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 text-white/80 hover:text-white rounded-md transition-colors"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>

              <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={tokenAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setTokenAmount(value);
                      }
                    }}
                    className="text-lg font-mono text-white bg-transparent outline-none flex-1"
                    placeholder="0.0"
                  />
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedToken?.token_info.image_uri}
                      alt={selectedToken?.token_info.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-white">
                      {selectedToken?.token_info.symbol}
                    </span>
                  </div>
                </div>
              </div>
              {tokenAmount && Number(tokenAmount) > Number(userTokenBalance) && (
                <div className="text-xs text-red-500">Amount exceeds available balance</div>
              )}
              {tokenAmount && Number(tokenAmount) <= 0 && (
                <div className="text-xs text-red-500">Please enter a valid amount</div>
              )}
            </div>
          )}

          {mode === 'sell' && amountOut && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black/60 lowercase">mon to receive</span>
              </div>
              <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-mono text-white">{amountOut}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">MON</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* {mode === 'buy' &&
              selectedTokens.length > 0 &&
              selectedTokens.map((token) => (
                <div key={token.symbol} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black/60 lowercase">
                      {token.symbol.toLowerCase()} to receive
                    </span>
                    <button
                      onClick={() => {
                        const { setSelectedTokens } = useMainStore.getState();
                        setSelectedTokens(selectedTokens.filter((t) => t.symbol !== token.symbol));
                      }}
                      className="text-black/60 hover:text-black transition-colors p-1"
                      title={`Remove ${token.symbol}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={tokenAmounts[token.symbol] || '0.000000'}
                        readOnly
                        className="text-lg font-mono text-white bg-transparent outline-none flex-1"
                        placeholder="0.0"
                      />
                      <div className="flex items-center gap-2">
                        <img src={token.logo} alt={token.name} className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-medium text-white">{token.symbol}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {tradingError && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{tradingError}</p>
              </div>
            )}

            {mode === 'buy' && selectedTokens.length >= 2 && (
              <div className="space-y-3 p-4 bg-secondary rounded-lg border border-borderColor">
                <h4 className="text-sm font-medium text-white/60">Exchange Rates</h4>
                <div className="space-y-2 text-sm">
                  {selectedTokens.map((token) => {
                    const tokenPrice = tokenPrices?.[token.token_address || '']
                      ? Number(tokenPrices[token.token_address || ''])
                      : 1; // Fallback price

                    // Calculate how many tokens you get for 1 MON
                    const tokensPerMon = (1 / tokenPrice).toFixed(6);

                    return (
                      <div
                        key={token.symbol}
                        className="flex items-center justify-between text-white/80"
                      >
                        <span>1 MON</span>
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            {tokensPerMon} {token.symbol.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
        </div>
      </div>

      <div className="p-6 border-t border-borderColor bg-white">
        <button
          onClick={handleSwap}
          disabled={isTradingLoading || isListed || isLocked}
          className="w-full bg-brandColor hover:bg-brandColor/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 text-lg font-bold rounded-lg transition-colors"
        >
          {isTradingLoading ? 'PROCESSING...' : mode === 'buy' ? 'BUY TOKENS' : 'SELL TOKENS'}
        </button>
      </div>
    </div>
  );
};

export default BuySell;

'use client';

import { useState, useEffect } from 'react';
import { useMainStore } from '@/store/useMainStore';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/lib/shadcn/drawer';
import { cn } from '@/utils/cn';
import { useTokensByCreationTime, useMultipleTokenPrices } from '@/hooks/useTokens';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

interface TokenSwapDrawerProps {
  children: React.ReactNode;
}

export const TokenSwapDrawer = ({ children }: TokenSwapDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [fromAmount, setFromAmount] = useState('');

  // Get selected tokens from the store
  const { selectedTokens } = useMainStore();

  // Get wallet info
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const { data: tokens, isLoading, error } = useTokensByCreationTime(1, 10);

  // Get token prices for selected tokens
  const tokenAddresses = selectedTokens.map((token) => token.token_address || '').filter(Boolean);
  const { data: tokenPrices } = useMultipleTokenPrices(tokenAddresses);

  // Calculate available balance
  const availableBalance = balance ? Number(formatEther(balance.value)) : 0;
  const inputAmount = Number(fromAmount) || 0;
  const isValidAmount = inputAmount > 0 && inputAmount <= availableBalance;

  // Calculate token amounts based on MON spent
  const calculateTokenAmounts = () => {
    if (!selectedTokens.length || !fromAmount || Number(fromAmount) <= 0 || !isValidAmount)
      return {};

    const monToSpend = Number(fromAmount);
    const monPerToken = monToSpend / selectedTokens.length;

    const tokenAmounts: Record<string, string> = {};
    selectedTokens.forEach((token) => {
      // Use actual token price if available, otherwise fallback to mock price
      const tokenPrice = Number(tokenPrices?.[token.token_address || '']);
      const tokenAmount = monPerToken / tokenPrice;
      tokenAmounts[token.symbol] = tokenAmount.toFixed(6);
    });

    return tokenAmounts;
  };

  const tokenAmounts = calculateTokenAmounts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSwap = () => {
    const tokenSymbols = selectedTokens.map((token) => token.symbol).join(', ');
    const action = mode === 'buy' ? 'Buying' : 'Selling';

    // Validate input
    if (!fromAmount || Number(fromAmount) <= 0) {
      console.error('Invalid amount');
      return;
    }

    // Validate balance
    if (Number(fromAmount) > availableBalance) {
      console.error('Insufficient balance');
      return;
    }

    console.log({ selectedTokens });

    console.log(`${action} ${tokenSymbols} with ${fromAmount} MON`);
    console.log('Token amounts:', tokenAmounts);
    setIsOpen(false);
  };

  // Check if we have at least one token selected
  const hasTokens = selectedTokens.length >= 1;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full bg-white border-l border-borderColor">
        <DrawerHeader className="border-b border-borderColor pb-4">
          <DrawerTitle className="text-xl font-bold text-black">Token Marketplace</DrawerTitle>
          <p className="text-sm text-black/60 mt-1">Buy or sell tokens with MON</p>
        </DrawerHeader>

        {!hasTokens && (
          <div className="p-6 text-center">
            <p className="text-black/60 mb-4">
              Please select tokens from the chart to buy or sell with MON
            </p>
            <div className="text-sm text-black/40">Selected tokens: {selectedTokens.length}</div>
          </div>
        )}

        {hasTokens && (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Buy/Sell Mode Toggle */}
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

                {/* MON Amount Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black/60 lowercase">
                      {mode === 'buy' ? 'mon to spend' : 'mon to receive'}
                    </span>
                    <span className="text-xs text-black/40">
                      Available: {availableBalance.toFixed(4)} MON
                    </span>
                  </div>
                  <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={fromAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string, numbers, and decimal points
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

                {/* Token Input Fields */}
                {selectedTokens.map((token, index) => (
                  <div key={token.symbol} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black/60 lowercase">
                        {mode === 'buy'
                          ? `${token.symbol.toLowerCase()} to receive`
                          : `${token.symbol.toLowerCase()} to sell`}
                      </span>
                      <button
                        onClick={() => {
                          const { setSelectedTokens } = useMainStore.getState();
                          setSelectedTokens(
                            selectedTokens.filter((t) => t.symbol !== token.symbol)
                          );
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

                {/* Exchange Rate Section - Only show if we have 2+ tokens */}
                {selectedTokens.length >= 2 && (
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
                )}
              </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="p-6 border-t border-borderColor bg-white">
              <button
                onClick={handleSwap}
                disabled={!isValidAmount}
                className="w-full bg-brandColor hover:bg-brandColor/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 text-lg font-bold rounded-lg transition-colors"
              >
                {mode === 'buy' ? 'BUY TOKENS' : 'SELL TOKENS'}
              </button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

'use client';

import { useState } from 'react';
import { useMainStore } from '@/store/useMainStore';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/lib/shadcn/drawer';
import { cn } from '@/utils/cn';
import { useTokensByCreationTime } from '@/hooks/useTokens';
import { Asset } from '../types';

interface TokenSwapDrawerProps {
  children: React.ReactNode;
}

export const TokenSwapDrawer = ({ children }: TokenSwapDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('sell');
  const [fromAmount, setFromAmount] = useState('50');
  const [toAmount, setToAmount] = useState('100');

  // Get selected tokens from the store
  const { selectedTokens } = useMainStore();

  const { data: tokens, isLoading, error } = useTokensByCreationTime(1, 10);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleSwap = () => {
    const tokenSymbols = selectedTokens.map((token) => token.symbol).join(', ');
    const action = mode === 'buy' ? 'Buying' : 'Selling';
    console.log(`${action} ${tokenSymbols} with ${fromAmount} MON`);
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
                    <span className="text-sm font-medium text-black/60">Mode:</span>
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
                  <span className="text-sm font-medium text-black/60 lowercase">
                    {mode === 'buy' ? 'mon to spend' : 'mon to receive'}
                  </span>
                  <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="text-lg font-mono text-white bg-transparent outline-none flex-1"
                        placeholder="0.0"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">MON</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Input Fields */}
                {selectedTokens.map((token, index) => (
                  <div key={token.symbol} className="space-y-3">
                    <span className="text-sm font-medium text-black/60 lowercase">
                      {mode === 'buy'
                        ? `${token.symbol.toLowerCase()} to receive`
                        : `${token.symbol.toLowerCase()} to sell`}
                    </span>

                    <div className="border border-borderColor rounded-lg p-4 bg-secondary">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={toAmount}
                          onChange={(e) => setToAmount(e.target.value)}
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
                      {selectedTokens.map((token, index) => (
                        <div
                          key={token.symbol}
                          className="flex items-center justify-between text-white/80"
                        >
                          <span>1000 MON</span>
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>100 {token.symbol.toLowerCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="p-6 border-t border-borderColor bg-white">
              <button
                onClick={handleSwap}
                className="w-full bg-brandColor hover:bg-brandColor/80 text-white py-4 text-lg font-bold rounded-lg transition-colors"
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

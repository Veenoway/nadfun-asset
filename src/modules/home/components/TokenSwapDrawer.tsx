'use client';

import { useState } from 'react';
import { assets } from '../constant';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/lib/shadcn/drawer';
import { cn } from '@/utils/cn';

interface TokenSwapDrawerProps {
  children: React.ReactNode;
}

export const TokenSwapDrawer = ({ children }: TokenSwapDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('sell');
  const fromToken = assets[6];
  const toToken = assets[0];
  const [fromAmount, setFromAmount] = useState('50');
  const [toAmount, setToAmount] = useState('100');

  const handleSwap = () => {
    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full bg-primary border-l border-borderColor">
        <DrawerHeader className="border-b border-borderColor pb-4">
          <DrawerTitle className="text-xl font-bold text-white">Token Swap</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/60 lowercase">
                {fromToken.symbol.toLowerCase()}
              </span>
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
                  buy
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
                  sell
                </button>
              </div>
            </div>

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
                  <img src={fromToken.logo} alt={fromToken.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-white">{fromToken.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-white/60 lowercase">
              {toToken.symbol.toLowerCase()}
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
                  <img src={toToken.logo} alt={toToken.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-white">{toToken.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-secondary rounded-lg border border-borderColor">
            <h4 className="text-sm font-medium text-white/60">Exchange Rate</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/80">
                <span>1000 {fromToken.symbol.toLowerCase()}</span>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>100 {toToken.symbol.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-white/80">
                <span>550 {fromToken.symbol.toLowerCase()}</span>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>50 {toToken.symbol.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-borderColor">
          <button
            onClick={handleSwap}
            className="w-full bg-brandColor hover:bg-brandColor/80 text-white py-4 text-lg font-bold rounded-lg transition-colors"
          >
            SWAP
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

'use client'

import { useState } from 'react'
import { tokens } from '../constant'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/lib/shadcn/drawer'

interface TokenSwapDrawerProps {
  children: React.ReactNode
}

export const TokenSwapDrawer = ({ children }: TokenSwapDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'buy' | 'sell'>('sell')
  const [fromToken, setFromToken] = useState(tokens[6]) // CHOG
  const [toToken, setToToken] = useState(tokens[0]) // MON
  const [fromAmount, setFromAmount] = useState('50')
  const [toAmount, setToAmount] = useState('100')

  // Calculate exchange rate based on token prices
  const exchangeRate = fromToken.price / toToken.price
  const rate1 = 1000 * exchangeRate
  const rate2 = 550 * exchangeRate

  const handleSwap = () => {
    // Handle swap logic here
    console.log(
      `Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
    )
    setIsOpen(false)
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-full">
        <DrawerHeader className="border-b border-black pb-4">
          <DrawerTitle className="text-xl font-bold text-black">
            Token Swap
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 p-6 space-y-6">
          {/* From Token Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black lowercase">
                {fromToken.symbol.toLowerCase()}
              </span>
              <div className="flex border border-black rounded overflow-hidden">
                <button
                  onClick={() => setMode('buy')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    mode === 'buy'
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  buy
                </button>
                <button
                  onClick={() => setMode('sell')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    mode === 'sell'
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  sell
                </button>
              </div>
            </div>

            <div className="border-2 border-black rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-black">
                  {fromAmount}
                </span>
                <span className="text-sm font-medium text-black">
                  {fromToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* To Token Section */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-black lowercase">
              {toToken.symbol.toLowerCase()}
            </span>

            <div className="border-2 border-black rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-black">{toAmount}</span>
                <span className="text-sm font-medium text-black">
                  {toToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Rate Information */}
          <div className="space-y-2 text-sm text-black">
            <div className="flex items-center justify-between">
              <span>1000 {fromToken.symbol.toLowerCase()}</span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>100 {toToken.symbol.toLowerCase()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>550 {fromToken.symbol.toLowerCase()}</span>
              <div className="flex items-center gap-2">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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

        {/* Swap Button */}
        <div className="p-6 border-t border-black">
          <button
            onClick={handleSwap}
            className="w-full border-2 border-black rounded-lg py-4 text-lg font-bold text-black uppercase hover:bg-black hover:text-white transition-colors"
          >
            SWAP
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

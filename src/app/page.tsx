'use client';

import { useTokensByCreationTime } from '@/hooks/useTokens';
import { formatNickname } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { BuySell, RecentTokens, TradeHistory } from '@/components/home';
import { Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { KingOfTheHill } from '@/lib/types';

export interface SelectedToken {
  token: KingOfTheHill;
  tabId: string;
  source: 'recent' | 'my-tokens';
}

export default function HomePage() {
  const { data: tokensByCreationTime } = useTokensByCreationTime(1, 20);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    setSelectedTokens(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokensByCreationTime?.order_token.slice(0, 3).map((token: any) => ({
        token,
        tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: 'recent',
      })) || [],
    );
  }, [tokensByCreationTime]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTokenSelect = (token: any, source: 'recent' | 'my-tokens') => {
    // Check if token is already selected
    const isAlreadySelected = selectedTokens.some(
      (st) => st.token.token_info.token_id === token.token_info.token_id,
    );

    if (isAlreadySelected) {
      const existingTab = selectedTokens.find(
        (st) => st.token.token_info.token_id === token.token_info.token_id,
      );
      if (existingTab) {
        setActiveTab(existingTab.tabId);
      }
      return;
    }

    if (selectedTokens.length >= 6) {
      const newSelectedTokens = selectedTokens.slice(1);
      const newToken: SelectedToken = {
        token,
        tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source,
      };
      const updatedTokens = [...newSelectedTokens, newToken];
      setSelectedTokens(updatedTokens);
      setActiveTab(newToken.tabId);
    } else {
      const newToken: SelectedToken = {
        token,
        tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source,
      };
      const updatedTokens = [...selectedTokens, newToken];
      setSelectedTokens(updatedTokens);
      setActiveTab(newToken.tabId);
    }
  };

  const handleTabRemove = (tabId: string) => {
    const updatedTokens = selectedTokens.filter((st) => st.tabId !== tabId);
    setSelectedTokens(updatedTokens);

    if (activeTab === tabId && updatedTokens.length > 0) {
      setActiveTab(updatedTokens[updatedTokens.length - 1].tabId);
    } else if (updatedTokens.length === 0) {
      setActiveTab('');
    }
  };

  useEffect(() => {
    if (selectedTokens.length > 0 && !activeTab) {
      setActiveTab(selectedTokens[0].tabId);
    }
  }, [selectedTokens, activeTab]);

  return (
    <section>
      <div className="flex justify-between text-white px-8 max-w-screen-2xl pt-10 mx-auto w-[95%]">
        {/* Tabs Section */}
        <div className="w-full rounded-lg">
          {selectedTokens.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Select a token from the left panel to view details</p>
            </div>
          ) : (
            <>
              {/* Tab Headers */}
              <div className="flex border-gray-600 ml-3.5 mb-3">
                {selectedTokens.map((selectedToken) => (
                  <div
                    key={selectedToken.tabId}
                    className={`flex items-center gap-2 px-4 py-2  cursor-pointer transition-colors ${
                      activeTab === selectedToken.tabId
                        ? ' text-white rounded-t-md border-b-2 border-brandColor'
                        : 'text-white/60 hover:text-white border-b-2 border-white/10'
                    }`}
                    onClick={() => setActiveTab(selectedToken.tabId)}
                  >
                    <span className="text-sm font-medium">
                      {selectedToken?.token?.token_info?.symbol}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabRemove(selectedToken.tabId);
                      }}
                      className="text-gray-500 hover:text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Tab Content */}
              {selectedTokens.map((selectedToken) => (
                <div
                  key={selectedToken.tabId}
                  className={`${activeTab === selectedToken.tabId ? 'block' : 'hidden'}`}
                >
                  <div className="flex ">
                    <div className="w-full">
                      <div className="space-y-2">
                        <div className="mx-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h6 className="text-xs text-gray-500">
                              ${selectedToken.token.token_info.symbol}
                            </h6>
                            <p className="text-xs text-gray-500">
                              ({selectedToken.token.token_info.token_id?.slice(0, 4)}..
                              {selectedToken.token.token_info.token_id?.slice(-4)})
                            </p>
                            <Copy size={12} className="cursor-pointer text-gray-500" />
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-500">
                              Created by:{' '}
                              {formatNickname(selectedToken.token.account_info?.nickname)}
                            </p>
                            <Link
                              href={`/analytics/${selectedToken.token.token_info.token_id}`}
                              target="_blank"
                              className="flex items-center gap-1 text-gray-500 hover:text-brandColor"
                            >
                              <span className="text-xs text-gray-500">View analytics</span>
                              <ExternalLink size={12} className="cursor-pointer text-gray-500" />
                            </Link>
                          </div>
                        </div>
                        <div className="mx-4 border border-borderColor rounded ">
                          <div className="h-[450px] bg-secondary rounded flex items-center justify-center">
                            CHART
                          </div>
                          {/* <TokenChart tokenAddress={selectedToken.token.token_info.token_id} /> */}
                        </div>
                        <div className="px-4 rounded-lg">
                          <TradeHistory selectedTokens={selectedTokens} activeTab={activeTab} />
                        </div>
                      </div>
                    </div>

                    {/* Buy/Sell Actions */}
                    <div className="min-w-[400px] h-fit space-y-3">
                      <div className="bg-secondary border border-borderColor rounded pb-4">
                        <BuySell
                          selectedToken={selectedToken.token}
                          isFromMyTokens={selectedToken.source === 'my-tokens'}
                        />
                      </div>
                      <RecentTokens
                        tokensByCreationTime={tokensByCreationTime}
                        handleTokenSelect={handleTokenSelect}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

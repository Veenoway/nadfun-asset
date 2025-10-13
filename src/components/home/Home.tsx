'use client';

import { useTokensByCreationTime } from '@/hooks/useTokens';
import { formatNickname } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { BuySell, RecentTokens, TokenChart, TradeHistory } from '@/components/home';
import { Copy, Loader2 } from 'lucide-react';
import { KingOfTheHill } from '@/lib/types';
import { Parent } from '@/components/analytics/Parent';
import { Drawer, DrawerTrigger, DrawerContent, Button } from '@/components/ui';
import { DialogTitle } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

export interface SelectedToken {
  token: KingOfTheHill;
  tabId: string;
  source: 'recent' | 'my-tokens' | 'search';
}

const Home = () => {
  const { data: tokensByCreationTime, isLoading: isLoadingTokens } = useTokensByCreationTime(1, 20);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (tokensByCreationTime?.king_of_the_hill && selectedTokens.length === 0) {
      setSelectedTokens([
        {
          token: tokensByCreationTime.king_of_the_hill,
          tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: 'recent',
        },
      ]);
    }
  }, [tokensByCreationTime, selectedTokens.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTokenSelect = (token: any, source: 'recent' | 'my-tokens' | 'search') => {
    const isAlreadySelected = selectedTokens.some(
      (st) => st.token.token_info.token_id === token.token_info.token_id,
    );

    if (isAlreadySelected) {
      const existingTab = selectedTokens.find(
        (st) => st.token.token_info.token_id === token.token_info.token_id,
      );
      if (existingTab) {
        setActiveTab(existingTab.tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (selectedTokens.length >= 6) {
      toast.warning('Maximum tabs reached', {
        description:
          'Please close a tab before opening a new one. You can have up to 6 tabs open at once.',
        duration: 4000,
      });
      return;
    } else {
      const newToken: SelectedToken = {
        token,
        tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source,
      };
      const updatedTokens = [...selectedTokens, newToken];
      setSelectedTokens(updatedTokens);
      setActiveTab(newToken.tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (isLoadingTokens) {
    return (
      <section>
        <div className="flex justify-center items-center text-white px-8 max-w-screen-2xl pt-10 mx-auto w-[95%] min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-brandColor" />
            <p className="text-lg text-white/60">Loading latest tokens...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between text-white xl:px-8 max-w-screen-2xl pt-10 mx-auto w-[95%]">
        {/* Tabs Section */}
        <div className="w-full rounded-lg">
          {selectedTokens.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Select a token from the left panel to view details</p>
            </div>
          ) : (
            <>
              {/* Tab Headers */}
              <div className="flex border-gray-600 mb-3">
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
                      className="text-gray-500 hover:text-red-400 text-xs cursor-pointer"
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
                  <div className="flex gap-5">
                    {/* Left Panel */}
                    <div className="w-full max-w-[calc(100%-400px)]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h6 className="text-xs text-gray-500">
                              ${selectedToken.token.token_info.symbol}
                            </h6>
                            <p className="text-xs text-gray-500">
                              ({selectedToken.token.token_info.token_id?.slice(0, 4)}..
                              {selectedToken.token.token_info.token_id?.slice(-4)})
                            </p>
                            <Copy
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  selectedToken.token.token_info.token_id || '',
                                );
                                toast.success('Copied!');
                              }}
                              size={12}
                              className="cursor-pointer text-gray-500"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xs text-gray-500">
                              Created by:{' '}
                              {formatNickname(selectedToken.token.account_info?.nickname)}
                            </p>

                            <Drawer>
                              <DrawerTrigger asChild>
                                <Button
                                  asChild
                                  variant="filter"
                                  onClick={() =>
                                    console.log(selectedToken.token.token_info.token_id)
                                  }
                                  className="flex items-center gap-1 bg-secondary border border-borderColor"
                                >
                                  <span className="text-xs text-white">View analytics</span>
                                </Button>
                              </DrawerTrigger>
                              <DrawerContent className="border pointer-events-none outline-[0.5px] outline-brandColor/50">
                                <DialogTitle className="hidden">Analytics</DialogTitle>
                                <Parent tokenAddress={selectedToken.token.token_info.token_id!} />
                              </DrawerContent>
                            </Drawer>
                          </div>
                        </div>
                        <div className="border border-borderColor rounded">
                          <TokenChart
                            tokenAddress={selectedToken.token.token_info.token_id || ''}
                          />
                        </div>
                        <div className="rounded-lg">
                          <TradeHistory selectedTokens={selectedTokens} activeTab={activeTab} />
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Sticky */}
                    <div className="min-w-[400px] space-y-3 sticky top-4 self-start max-h-[calc(100vh-2rem)]">
                      <div className="bg-secondary border border-borderColor rounded pb-4">
                        <BuySell
                          selectedToken={selectedToken.token}
                          isFromMyTokens={selectedToken.source === 'my-tokens'}
                        />
                      </div>
                      <div className="overflow-y-auto lg:h-[calc(100vh-270px)] 2xl:h-[calc(100vh-320px)]">
                        <RecentTokens
                          tokensByCreationTime={tokensByCreationTime}
                          handleTokenSelect={handleTokenSelect}
                        />
                      </div>
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
};

export { Home };

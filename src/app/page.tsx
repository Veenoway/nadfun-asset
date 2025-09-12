'use client';

import { useTokensByCreationTime, useTokensByMarketCap } from '@/hooks/useTokens';
import { useTradeHistoryOne } from '@/hooks/useTradeHistory';
import RecentTokens from '@/modules/home/components/RecentTokens';
import { isAddress } from 'viem';

import BuySell from '@/modules/home/components/BuySell';
import { formatAmount } from '@/modules/home/utils/number';
import { useEffect, useMemo, useState } from 'react';

interface SelectedToken {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  token: any;
  tabId: string;
  source: 'recent' | 'my-tokens';
}

export default function HomePage() {
  const { data: tokens } = useTokensByMarketCap(1, 20);
  const { data: tokensByCreationTime } = useTokensByCreationTime(1, 20);
  const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [tradeType, setTradeType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const limit = 15;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assets = tokens?.order_token.map((token: any) => ({
    logo: token.token_info.image_uri,
    symbol: token.token_info.symbol,
    name: token.token_info.name,
    token_address: token.token_info.token_id,
  }));

  const { data } = useTradeHistoryOne(
    selectedTokens.find((st) => st.tabId === activeTab)?.token.token_info.token_id || '',
    page,
    limit,
    direction,
    tradeType
  );

  const total = useMemo(() => data?.total, [data]);
  const trades = useMemo(() => data?.items, [data]);

  // Handle token selection

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTokenSelect = (token: any, source: 'recent' | 'my-tokens') => {
    // Check if token is already selected
    const isAlreadySelected = selectedTokens.some(
      (st) => st.token.token_info.token_id === token.token_info.token_id
    );

    if (isAlreadySelected) {
      // If already selected, just switch to that tab
      const existingTab = selectedTokens.find(
        (st) => st.token.token_info.token_id === token.token_info.token_id
      );
      if (existingTab) {
        setActiveTab(existingTab.tabId);
      }
      return;
    }

    // Check if we already have 3 tabs
    if (selectedTokens.length >= 3) {
      // Remove the oldest tab (first one)
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
      // Add new tab
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

  // Handle tab removal
  const handleTabRemove = (tabId: string) => {
    const updatedTokens = selectedTokens.filter((st) => st.tabId !== tabId);
    setSelectedTokens(updatedTokens);

    // If we removed the active tab, switch to the last remaining tab
    if (activeTab === tabId && updatedTokens.length > 0) {
      setActiveTab(updatedTokens[updatedTokens.length - 1].tabId);
    } else if (updatedTokens.length === 0) {
      setActiveTab('');
    }
  };

  // Set first tab as active when tabs are first added
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
                      {selectedToken.token.token_info.symbol}
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
                    {/* Chart and Order History */}
                    <div className="w-full">
                      <div className="space-y-4">
                        <div className="mx-4 border border-borderColor rounded ">
                          <div className="h-[450px] bg-secondary rounded flex items-center justify-center">
                            CHART
                          </div>
                        </div>
                        <div className="px-4 rounded-lg">
                          <div className="col-span-12 lg:col-span-8 row-span-3 rounded-lg h-full">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                {['All', 'Buy', 'Sell'].map((type) => (
                                  <button
                                    key={type}
                                    className={` border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out ${
                                      tradeType === type.toUpperCase()
                                        ? 'bg-brandColor text-white'
                                        : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
                                    }`}
                                    onClick={() =>
                                      setTradeType(type.toUpperCase() as 'ALL' | 'BUY' | 'SELL')
                                    }
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className={` border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out ${
                                    direction === 'ASC'
                                      ? 'bg-brandColor text-white'
                                      : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
                                  }`}
                                  onClick={() => setDirection('ASC')}
                                >
                                  Asc
                                </button>
                                <button
                                  className={` border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out ${
                                    direction === 'DESC'
                                      ? 'bg-brandColor text-white'
                                      : 'bg-secondary hover:bg-terciary text-white/60 hover:text-white'
                                  }`}
                                  onClick={() => setDirection('DESC')}
                                >
                                  Desc
                                </button>
                              </div>
                            </div>
                            <div
                              className="overflow-auto w-full"
                              style={{ maxHeight: 'calc(100% - 95px)' }}
                            >
                              <table className="w-full text-sm text-normal text-white/60">
                                <thead>
                                  <tr>
                                    <th className="text-left border-y text-normal border-borderColor py-3 pl-3">
                                      Date
                                    </th>
                                    <th className="text-left border-y text-normal border-borderColor py-3">
                                      User
                                    </th>
                                    <th className="text-right border-y text-normal border-borderColor py-3">
                                      MON
                                    </th>
                                    <th className="text-right border-y text-normal border-borderColor py-3">
                                      Token Amount
                                    </th>
                                    <th className="text-right border-y text-normal border-borderColor py-3 pr-3">
                                      Transaction Hash
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {trades?.map((trade: any) => {
                                    const token = selectedTokens.find(
                                      (t) =>
                                        t.token.token_info.token_id.toLowerCase() ===
                                        trade._address.toLowerCase()
                                    );
                                    const tokenDecimals = 18;
                                    const tokenSymbol = token?.token.token_info.symbol ?? '';
                                    return (
                                      <tr
                                        key={
                                          trade._address + trade.created_at + trade.transaction_hash
                                        }
                                        className="text-sm"
                                      >
                                        <td className="text-left border-b border-borderColor pl-3">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`rounded-full font-medium text-[10px] px-1.5 py-[1px] ${
                                                trade.is_buy
                                                  ? 'bg-green-600/30 text-green-500'
                                                  : 'bg-red-600/30 text-red-500'
                                              }`}
                                            >
                                              {trade.is_buy ? 'Buy' : 'Sell'}
                                            </div>
                                            <div className="gap-2 text-xs">
                                              <p className="text-white/60">
                                                {' '}
                                                {new Date(trade.created_at * 1000).toLocaleString(
                                                  'en-US',
                                                  {
                                                    month: 'short',
                                                    day: '2-digit',
                                                  }
                                                )}
                                              </p>
                                              <p className="text-white text-xs">
                                                {new Date(trade.created_at * 1000).toLocaleString(
                                                  'en-US',
                                                  {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                  }
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="text-left border-b border-borderColor">
                                          <div className="flex items-center gap-2 w-full h-full">
                                            <img
                                              src={trade.account_info.image_uri}
                                              alt={trade.account_info.nickname}
                                              className="w-5 h-5 rounded-full"
                                            />
                                            {isAddress(trade.account_info.nickname)
                                              ? trade.account_info.nickname.slice(0, 3) +
                                                trade.account_info.nickname.slice(-3)
                                              : trade.account_info.nickname}
                                          </div>
                                        </td>
                                        <td
                                          className={`text-right py-2.5 border-b border-borderColor ${
                                            trade.is_buy ? 'text-green-500' : 'text-red-500'
                                          }`}
                                        >
                                          {formatAmount(trade.native_amount, 18)}
                                        </td>

                                        <td
                                          className={`text-right border-b border-borderColor uppercase ${
                                            trade.is_buy ? 'text-green-500' : 'text-red-500'
                                          }`}
                                        >
                                          {formatAmount(trade.token_amount, tokenDecimals)}{' '}
                                          {tokenSymbol}
                                        </td>

                                        <td className="border-b border-borderColor pr-3">
                                          <div className="text-right">
                                            {trade.transaction_hash.slice(0, 6)}...
                                            {trade.transaction_hash.slice(-4)}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex justify-between mt-5 gap-2 items-center">
                              <div className="text-sm text-white/60">Showing {total} trades</div>
                              <div className="flex items-center gap-2">
                                {page > 1 && (
                                  <button
                                    className={`border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out bg-secondary hover:bg-terciary text-white/60 hover:text-white`}
                                    onClick={() => setPage(page - 1)}
                                  >
                                    Prev
                                  </button>
                                )}
                                <button
                                  className={`border border-borderColor text-sm px-3 py-1 rounded-md transition-all duration-200 ease-in-out bg-secondary hover:bg-terciary text-white/60 hover:text-white`}
                                  onClick={() => setPage(page + 1)}
                                >
                                  Next
                                </button>
                                <span className="text-sm text-white/60">
                                  {page} of {Math.ceil(total ?? 1 / limit)}
                                </span>
                              </div>
                            </div>
                          </div>
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

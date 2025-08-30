'use client';
import { useTokensByCreationTime } from '@/hooks/useTokens';
import { useMultiTokenChart } from '@/hooks/useTradeChart';
import { Trade, useTradeHistoryMany } from '@/hooks/useTradeHistory';
import { useMainStore } from '@/store/useMainStore';
import { useModalStore } from '@/store/useModalStore';
import { useState } from 'react';
import { isAddress } from 'viem/utils';
import { InfiniteTokenSelector } from './components/InfiniteTokenSelector';
import { MultiLineChart } from './components/MultiLineChart';
import { TokenBalances } from './components/TokenBalances';
import { TokenModal } from './components/TokenModal';
import { TokenSwapDrawer } from './components/TokenSwapDrawer';
import { AddressRow, DataType } from './types';
import { makeChart } from './utils/makeChart';
import { formatAmount } from './utils/number';

const lineConfigs = [
  {
    key: 'price',
    label: 'Price',
    lineColor: 'rgb(14, 203, 129)',
    fillColor: 'rgba(14, 203, 129, 0.2)',
    lineWidth: 3,
    yAxisID: 'y',
    fill: false,
  },
];

export default function Home() {
  const { toggle } = useModalStore();
  const [dataType, setDataType] = useState<DataType>('price');
  const [showTxPoints, setShowTxPoints] = useState(false);
  const { selectedTokens } = useMainStore();
  const [tradeType, setTradeType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data: tokens } = useTokensByCreationTime(1, 10);
  const multiTokens = useMultiTokenChart(
    selectedTokens.map((token) => token.token_address) as string[],
  );

  const { data: trades, isLoading } = useTradeHistoryMany(
    selectedTokens.map((token) => token.token_address) as string[],
    page,
    limit,
    direction,
    tradeType
  );

  console.log('trades', selectedTokens);

  const assets = tokens?.order_token.map((token: any) => ({
    logo: token.token_info.image_uri,
    symbol: token.token_info.symbol,
    name: token.token_info.name,
    token_address: token.token_info.token_id,

    price: Number(token.token_info.market_cap),
    chart: makeChart(Number(token.token_info.market_cap), 11),
  }));

  return (
    <main className="max-w-screen-2xl mx-auto p-8 w-full pt-[100px]">
      <InfiniteTokenSelector tokens={assets || []} />
      <section
        className="grid grid-cols-12 grid-flow-dense gap-4 min-h-screen
                   [grid-auto-rows:160px] md:[grid-auto-rows:220px] xl:[grid-auto-rows:260px]"
      >
        <div className="col-span-12 lg:col-span-8 row-span-2 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="h-full min-h-0">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-bold">Chart</h2>
              <div className="flex items-center gap-2">
                <button
                  className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                  onClick={toggle}
                >
                  Select tokens
                </button>
                <button
                  className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowTxPoints(!showTxPoints)}
                >
                  Show Tx
                </button>
                <button
                  className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                  onClick={() => setDataType('price')}
                >
                  Price
                </button>
                <button
                  className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                  onClick={() => setDataType('volume')}
                >
                  Volume
                </button>
              </div>
            </div>
            <MultiLineChart
              lines={lineConfigs}
              height="440px"
              data={multiTokens as unknown as AddressRow[]}
              showTransactionPoints={showTxPoints}
              dataType={dataType}
            />
          </div>
        </div>
        <TokenModal tokens={assets || []} />
        <div className="col-span-12 lg:col-span-4 row-span-3 bg-white/60 p-6 rounded-lg h-full border border-borderColor">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <TokenSwapDrawer>
                <button className="w-full bg-brandColor text-white px-4 py-3 rounded-md hover:bg-brandColor/80 transition-colors">
                  Open Swap Interface
                </button>
              </TokenSwapDrawer>
              <TokenBalances />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 row-span-3 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <h2 className="text-2xl font-bold mb-4">Trade history</h2>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setTradeType('ALL')}
              >
                All
              </button>
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setTradeType('BUY')}
              >
                Buy
              </button>
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setTradeType('SELL')}
              >
                Sell
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setDirection('ASC')}
              >
                ASC
              </button>
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setDirection('DESC')}
              >
                DESC
              </button>
            </div>
          </div>
          <div className="overflow-auto w-full" style={{ maxHeight: 'calc(100% - 150px)' }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left border-y border-borderColor py-3 pl-3">Account</th>
                  <th className="text-left border-y border-borderColor py-3">Date</th>
                  <th className="text-right border-y border-borderColor py-3">MON</th>
                  <th className="text-right border-y border-borderColor py-3">Token Amount</th>
                  <th className="text-right border-y border-borderColor py-3 pr-3">
                    Transaction Hash
                  </th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {trades?.map((trade: Trade) => {
                    const token = selectedTokens.find(
                      (t) => t.token_address.toLowerCase() === trade._address.toLowerCase()
                    );
                    const tokenDecimals = 18;
                    const tokenSymbol = token?.symbol ?? '';
                    return (
                      <tr key={trade._address + trade.created_at + trade.transaction_hash}>
                        <td className="text-left  border-b border-borderColor pl-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                trade.is_buy ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            {new Date(trade.created_at * 1000).toLocaleString()}
                          </div>
                        </td>
                        <td className="text-left  border-b border-borderColor pl-3">
                          <div className="flex items-center gap-2 w-full h-full">
                            <img
                              src={trade.account_info.image_uri}
                              alt={trade.account_info.nickname}
                              className="w-6 h-6 rounded-full"
                            />
                            {isAddress(trade.account_info.nickname)
                              ? trade.account_info.nickname.slice(0, 6)
                              : trade.account_info.nickname}
                          </div>
                        </td>
                        <td className="text-right py-2.5 border-b border-borderColor">
                          {formatAmount(trade.native_amount, 18)}
                        </td>

                        <td className="text-right border-b border-borderColor">
                          {formatAmount(trade.token_amount, tokenDecimals)} {tokenSymbol}
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
              )}
            </table>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {page > 1 && (
              <button
                className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
            )}
            <button
              className="bg-terciary hover:bg-terciary/80 text-white px-4 py-2 rounded-md"
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-2 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Something</h2>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

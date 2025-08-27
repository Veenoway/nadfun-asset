'use client';
import { useModalStore } from '@/store/useModalStore';
import { useEffect, useState } from 'react';
import { InfiniteTokenSelector } from './components/InfiniteTokenSelector';
import { MultiLineChart } from './components/MultiLineChart';
import { TokenModal } from './components/TokenModal';
import { TokenSwapDrawer } from './components/TokenSwapDrawer';
import { useTokensByCreationTime } from '@/hooks/useTokens';
import { makeChart } from './utils/makeChart';

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
  const { toggle, isOpen } = useModalStore();
  const [showTxPoints, setShowTxPoints] = useState(false);

  const { data: tokens, isLoading, error } = useTokensByCreationTime(1, 10);

  const assets = tokens?.order_token.map((token) => ({
    logo: token.token_info.image_uri,
    symbol: token.token_info.symbol,
    name: token.token_info.name,
    token_address: token.token_info.token_id,

    //price and chart are not real
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
              </div>
            </div>
            <MultiLineChart
              lines={lineConfigs}
              height="440px"
              data={[]}
              showTransactionPoints={showTxPoints}
            />
          </div>
        </div>
        <TokenModal />
        <div className="col-span-12 lg:col-span-4 row-span-3 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <TokenSwapDrawer>
                <button className="w-full bg-brandColor text-white px-4 py-3 rounded-md hover:bg-brandColor/80 transition-colors">
                  Open Swap Interface
                </button>
              </TokenSwapDrawer>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 row-span-3 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <h2 className="text-2xl font-bold">Something</h2>
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

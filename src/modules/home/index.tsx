import { MultiLineChart } from './components/MultiLineChart'
import { MultiLineDataPoint } from './types'
import { TokenSwapDrawer } from './components/Drawer'

const sampleData = [
  {
    date: '2024-01-01',
    price: 1300000,
    volume: 1000000,
    marketCap: 500000,
    buyPoint: true,
    sellPoint: false,
    buyAmount: 1000000,
    sellAmount: 0,
  },
  {
    date: '2024-01-02',
    price: 1044350,
    volume: 1200000,
    marketCap: 250000,
    buyPoint: false,
    sellPoint: true,
    buyAmount: 0,
    sellAmount: 1000000,
  },
  {
    date: '2024-01-03',
    price: 943430,
    volume: 800000,
    marketCap: 900000,
    buyPoint: false,
    sellPoint: false,
    buyAmount: 0,
    sellAmount: 0,
  },
  {
    date: '2024-01-04',
    price: 1100000,
    volume: 1500000,
    marketCap: 2000000,
    buyPoint: false,
    sellPoint: false,
    buyAmount: 0,
    sellAmount: 0,
  },
  {
    date: '2024-01-05',
    price: 1080000,
    volume: 900000,
    marketCap: 3000000,
    buyPoint: false,
    sellPoint: false,
    buyAmount: 0,
    sellAmount: 0,
  },
]

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
  {
    key: 'volume',
    label: 'Volume',
    lineColor: 'rgb(234, 57, 67)',
    fillColor: 'rgba(234, 57, 67, 0.2)',
    lineWidth: 2,
    yAxisID: 'y',
    fill: false,
  },
  {
    key: 'marketCap',
    label: 'Market Cap',
    lineColor: 'rgb(59, 130, 246)',
    fillColor: 'rgba(59, 130, 246, 0.2)',
    lineWidth: 2,
    yAxisID: 'y',
    fill: false,
    tension: 0.3,
  },
]
export default function Home() {
  return (
    <main className="max-w-screen-2xl mx-auto p-8 w-full">
      <section
        className="grid grid-cols-12 grid-flow-dense gap-4 min-h-screen
                   [grid-auto-rows:160px] md:[grid-auto-rows:220px] xl:[grid-auto-rows:260px]"
      >
        <div className="col-span-12 lg:col-span-8 row-span-2 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="h-full min-h-0">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-bold">Chart</h2>
              <div className="flex items-center gap-2">
                <button className="bg-white text-black px-4 py-2 rounded-md">
                  Select tokens
                </button>
              </div>
            </div>
            <MultiLineChart
              data={sampleData as MultiLineDataPoint[]}
              lines={lineConfigs}
              height="440px"
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-3 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Something</h2>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 row-span-3 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <h2 className="text-2xl font-bold">Something</h2>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-2 bg-primary p-6 rounded-lg h-full border border-borderColor">
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Token Swap</h2>
              <TokenSwapDrawer>
                <button className="w-full bg-brandColor text-white px-4 py-3 rounded-md hover:bg-brandColor/80 transition-colors">
                  Open Swap Interface
                </button>
              </TokenSwapDrawer>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

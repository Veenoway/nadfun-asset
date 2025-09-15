'use client';

import { useTokenChart } from '@/hooks/useTokens';
import { createChart, ColorType, CandlestickSeries, IChartApi } from 'lightweight-charts';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TokenChartProps {
  tokenAddress: string;
}

// In TokenChart.tsx
export function TokenChart({ tokenAddress }: TokenChartProps) {
  const { data: chartData } = useTokenChart(tokenAddress);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('chartData', chartData);
    if (!chartContainerRef.current || !chartData) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 360,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#333' },
        horzLines: { color: '#333' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Format and set the data
    const formattedData = chartData.t.map((timestamp: number, index: number) => ({
      time: timestamp,
      open: Number(chartData.o[index]),
      high: Number(chartData.h[index]),
      low: Number(chartData.l[index]),
      close: Number(chartData.c[index]),
    }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData]);

  // if (isLoading)
  //   return (
  //     <div className="flex justify-center items-center h-90">
  //       <Loader2 size={32} className=" animate-spin" />
  //     </div>
  //   );
  // if (error) return <div>Error loading chart</div>;

  return (
    <div className="w-full backdrop-blur-sm bg-black/20 border-[0.1px] border-borderLight/10 p-1 shadow-lg shadow-borderLighter/60">
      <div ref={chartContainerRef} className="h-90" />
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useMainStore } from '@/store/useMainStore';
import Chart from 'chart.js/auto';
import { useEffect, useMemo, useRef } from 'react';
import { MultiLineChartProps } from '../types';

type TxPoint = {
  buyPoint: boolean;
  sellPoint: boolean;
  buyAmount?: number;
  sellAmount?: number;
};

const PALETTE = [
  '#0ECB81',
  '#EA3943',
  '#3B82F6',
  '#F59E0B',
  '#A855F7',
  '#14B8A6',
  '#EF4444',
  '#22C55E',
  '#8B5CF6',
  '#10B981',
  '#F97316',
  '#06B6D4',
  '#E11D48',
  '#84CC16',
  '#6366F1',
];

export const MultiLineChart = ({
  data,
  dataType = 'price',
  height = '177px',
  pointRadius = 0,
  pointHoverRadius = 4,
  pointBorderWidth = 2,
  pointBorderColor = '#FFFFFF60',
  gridDisplay = true,
  tooltipBackground = 'rgba(30, 30, 30, 0.8)',
  tooltipTitleColor = '#FFFFFF',
  tooltipBodyColor = '#FFFFFF',
  tooltipBorderColor = '#836EF9',
  tooltipBorderWidth = 1,
  tooltipDisplayColors = true,
  tooltipPadding = 10,
  tooltipCornerRadius = 10,
  gridColor = 'rgba(255, 255, 255, 0.06)',
  axisColor = '#FFFFFF60',
  axisFontSize = 10,
  axisFontFamily = 'Arial',
  axisPadding = 5,
  enableAnimation = true,
  animationDuration = 750,
}: MultiLineChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { selectedTokens } = useMainStore();
  const chartInstance = useRef<Chart | null>(null);

  const tokenChart = useMemo(() => data?.map((entry) => entry.chart.data), [selectedTokens, data]);
  const tokenInfo = useMemo(() => data?.map((entry) => entry.token.data), [selectedTokens, data]);

  const labels = useMemo(() => {
    if (!tokenChart?.length) return [];

    const allTimestamps = new Set<number>();

    tokenChart.forEach((chartData) => {
      if (chartData?.length) {
        chartData.forEach((point: any) => {
          const timestamp =
            typeof point.time === 'number' ? point.time : new Date(point.time).getTime();
          allTimestamps.add(timestamp);
        });
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    return sortedTimestamps;
  }, [tokenChart]);

  const datasets = useMemo(() => {
    if (!tokenChart?.length || !labels.length) return [];

    return tokenChart.map((chartData, idx) => {
      const color = PALETTE[idx % PALETTE.length];
      const info = tokenInfo[idx];

      const priceByTimestamp = new Map<number, number>();
      if (chartData?.length) {
        chartData.forEach((point: any) => {
          const timestamp =
            typeof point.time === 'number' ? point.time : new Date(point.time).getTime();
          priceByTimestamp.set(timestamp, point[dataType === 'price' ? 'close' : 'volume']);
        });
      }

      const alignedData = labels.map((timestamp) => {
        const price = priceByTimestamp.get(timestamp);
        return price !== undefined ? price : null;
      });

      return {
        label: info?.symbol ?? info?.name ?? `Token ${idx + 1}`,
        data: alignedData,
        borderColor: color,
        backgroundColor: color + '33',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius,
        pointHoverRadius,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: pointBorderColor,
        pointHoverBorderWidth: pointBorderWidth,
        yAxisID: 'y' as const,
        spanGaps: true,
        // __tx: tx,
      } as any;
    });
  }, [selectedTokens, data]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    if (!labels.length || !datasets.length) {
      console.warn('No data available for chart rendering');
      return;
    }

    const yAxesConfig: any = {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        afterDataLimits: function (scale: any) {
          const padding = (scale.max - scale.min) * 0.1;
          scale.min = scale.min - padding;
          scale.max = scale.max + padding;
        },
        grid: { display: gridDisplay, color: gridColor },
        ticks: {
          color: axisColor,
          font: { size: axisFontSize, family: axisFontFamily },
          callback: function (value: any) {
            // Amélioration du formatage pour les très petits nombres
            if (typeof value !== 'number') return value;

            if (Math.abs(value) < 0.000001) {
              return value.toExponential(2);
            } else if (Math.abs(value) < 0.01) {
              return parseFloat(value.toFixed(8));
            } else if (Math.abs(value) < 1) {
              return parseFloat(value.toFixed(4));
            } else {
              return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              }).format(value);
            }
          },
        },
        border: { display: false },
        beginAtZero: false,
      },
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map((timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: enableAnimation ? animationDuration : 0 },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: axisColor,
              font: { size: axisFontSize, family: axisFontFamily },
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: tooltipBackground,
            titleColor: tooltipTitleColor,
            bodyColor: tooltipBodyColor,
            borderColor: tooltipBorderColor,
            borderWidth: tooltipBorderWidth,
            displayColors: tooltipDisplayColors,
            padding: tooltipPadding,
            cornerRadius: tooltipCornerRadius,
            boxWidth: 0,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label ? `${context.dataset.label}: ` : '';
                if (context.parsed.y !== null) {
                  // Formatage amélioré pour le tooltip
                  const value = context.parsed.y;
                  if (Math.abs(value) < 0.000001) {
                    label += value.toExponential(4);
                  } else {
                    label += new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    }).format(value);
                  }
                }
                return label;
              },
              afterLabel: (context) => {
                const ds: any = context.dataset;
                const txArr = ds.__tx as (TxPoint | null)[];
                const tx = txArr?.[context.dataIndex];
                const out: string[] = [];
                if (tx?.buyPoint) out.push(`Buy: ${tx.buyAmount ?? 'N/A'}`);
                if (tx?.sellPoint) out.push(`Sell: ${tx.sellAmount ?? 'N/A'}`);
                return out;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: gridDisplay, color: gridColor },
            ticks: {
              color: axisColor,
              font: { size: axisFontSize, family: axisFontFamily },
              padding: axisPadding,
              maxRotation: 45,
              minRotation: 0,
              maxTicksLimit: 8,
            },
            border: { display: false },
          },
          ...yAxesConfig,
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [selectedTokens, dataType, data]);

  if (!data || !data.length) {
    return (
      <div
        style={{
          height,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brandColor" />
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <canvas ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

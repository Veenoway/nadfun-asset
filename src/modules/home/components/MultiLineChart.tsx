/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMainStore } from "@/store/useMainStore";
import Chart from "chart.js/auto";
import { useEffect, useMemo, useRef } from "react";
import { AxisConfig, MultiLineChartProps } from "../types";

type TxPoint = {
  buyPoint: boolean;
  sellPoint: boolean;
  buyAmount?: number;
  sellAmount?: number;
};

const PALETTE = [
  "#0ECB81",
  "#EA3943",
  "#3B82F6",
  "#F59E0B",
  "#A855F7",
  "#14B8A6",
  "#EF4444",
  "#22C55E",
  "#8B5CF6",
  "#10B981",
  "#F97316",
  "#06B6D4",
  "#E11D48",
  "#84CC16",
  "#6366F1",
];

export const MultiLineChart = ({
  height = "177px",
  pointRadius = 0,
  pointHoverRadius = 4,
  pointBorderWidth = 2,
  pointBorderColor = "#FFFFFF60",
  gridDisplay = true,
  tooltipBackground = "rgba(30, 30, 30, 0.8)",
  tooltipTitleColor = "#FFFFFF",
  tooltipBodyColor = "#FFFFFF",
  tooltipBorderColor = "#836EF9",
  tooltipBorderWidth = 1,
  tooltipDisplayColors = true,
  tooltipPadding = 10,
  tooltipCornerRadius = 10,
  gridColor = "rgba(255, 255, 255, 0.06)",
  axisColor = "#FFFFFF60",
  axisFontSize = 10,
  axisFontFamily = "Arial",
  axisPadding = 5,
  enableAnimation = true,
  animationDuration = 750,
  enableSecondaryYAxis = false,
  secondaryYAxisPosition = "right",
  buyPointColor = "#00ff88",
  sellPointColor = "#ff4444",
  buyPointRadius = 8,
  sellPointRadius = 8,
  showTransactionPoints = true,
}: MultiLineChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { selectedTokens } = useMainStore();

  // 1) Labels = union triée de toutes les dates présentes
  const labels = useMemo(() => {
    const set = new Set<string>();
    selectedTokens?.forEach((a) => a.chart?.forEach((p) => set.add(p.date)));
    return Array.from(set).sort((a, b) => +new Date(a) - +new Date(b));
  }, []);

  // 2) Datasets = 1 par asset, data alignée sur 'labels'
  const datasets = useMemo(() => {
    if (!selectedTokens?.length) return [];

    return selectedTokens.map((asset, idx) => {
      const byDate = new Map(asset.chart.map((p) => [p.date, p]));
      const values: (number | null)[] = [];
      const tx: (TxPoint | null)[] = [];

      labels.forEach((d) => {
        const p = byDate.get(d);
        if (p) {
          values.push(p.price);
          tx.push({
            buyPoint: !!p.buyPoint,
            sellPoint: !!p.sellPoint,
            buyAmount: p.buyAmount,
            sellAmount: p.sellAmount,
          });
        } else {
          values.push(null); // gap si date absente
          tx.push(null);
        }
      });

      const color = PALETTE[idx % PALETTE.length];
      return {
        label: asset.symbol ?? asset.name,
        data: values,
        borderColor: color,
        backgroundColor: color + "33",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius,
        pointHoverRadius,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: pointBorderColor,
        pointHoverBorderWidth: pointBorderWidth,
        yAxisID: "y" as const,
        // on stocke les points de transaction pour le plugin
        __tx: tx,
      } as any;
    });
  }, [
    selectedTokens,
    labels,
    pointRadius,
    pointHoverRadius,
    pointBorderColor,
    pointBorderWidth,
  ]);

  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    const transactionPlugin = {
      id: "transactionPoints",
      afterDatasetsDraw: (chart: Chart) => {
        const { ctx } = chart;
        chart.data.datasets.forEach((ds: any, dsIndex: number) => {
          const meta = chart.getDatasetMeta(dsIndex);
          const txArr = ds.__tx as (TxPoint | null)[] | undefined;
          if (!txArr) return;

          meta.data.forEach((elem: any, i: number) => {
            if (!elem || !txArr[i]) return;
            const tx = txArr[i]!;
            if (!tx.buyPoint && !tx.sellPoint) return;

            const { x, y } = elem.getProps(["x", "y"], true);
            const isBuy = !!tx.buyPoint;
            const r = isBuy ? buyPointRadius : sellPointRadius;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fillStyle = isBuy ? buyPointColor : sellPointColor;
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "#FFFFFF";
            ctx.font = `bold ${Math.round(r)}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(isBuy ? "B" : "S", x, y);
            ctx.restore();
          });
        });
      },
    };

    const yAxesConfig: AxisConfig = {
      y: {
        type: "linear",
        display: true,
        position: "left",
        grid: { display: gridDisplay, color: gridColor },
        ticks: {
          color: axisColor,
          font: { size: axisFontSize, family: axisFontFamily },
        },
        border: { display: false },
      },
    };

    if (enableSecondaryYAxis) {
      yAxesConfig.y1 = {
        type: "linear",
        display: true,
        position: secondaryYAxisPosition,
        grid: { display: gridDisplay, color: gridColor },
        ticks: {
          color: axisColor,
          font: { size: axisFontSize, family: axisFontFamily },
        },
        border: { display: false },
      };
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.map((d) => new Date(d).toLocaleDateString()),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: enableAnimation ? animationDuration : 0 },
        plugins: {
          legend: {
            display: true,
            position: "top",
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
                let label = context.dataset.label
                  ? `${context.dataset.label}: $`
                  : "$";
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US").format(
                    context.parsed.y
                  );
                }
                return label;
              },
              afterLabel: (context) => {
                const ds: any = context.dataset;
                const txArr = ds.__tx as (TxPoint | null)[];
                const tx = txArr?.[context.dataIndex];
                const out: string[] = [];
                if (tx?.buyPoint) out.push(`Buy: ${tx.buyAmount ?? "N/A"}`);
                if (tx?.sellPoint) out.push(`Sell: ${tx.sellAmount ?? "N/A"}`);
                if (out.length === 0) return "";
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
              maxRotation: 0,
              minRotation: 0,
              callback: function (value, index, ticks) {
                if (index === 0) return this.getLabelForValue(value as number);
                if (index === ticks.length - 1)
                  return this.getLabelForValue(value as number);
                return "";
              },
            },
            border: { display: false },
          },
          ...yAxesConfig,
        },
        interaction: { intersect: false, mode: "index" },
      },
      plugins: showTransactionPoints ? [transactionPlugin as any] : [],
    });

    return () => chartInstance.current?.destroy();
  }, [
    selectedTokens,
    labels,
    datasets,
    gridDisplay,
    gridColor,
    axisColor,
    axisFontSize,
    axisFontFamily,
    axisPadding,
    enableAnimation,
    animationDuration,
    enableSecondaryYAxis,
    secondaryYAxisPosition,
    tooltipBackground,
    tooltipTitleColor,
    tooltipBodyColor,
    tooltipBorderColor,
    tooltipBorderWidth,
    tooltipDisplayColors,
    tooltipPadding,
    tooltipCornerRadius,
    buyPointColor,
    sellPointColor,
    buyPointRadius,
    sellPointRadius,
    showTransactionPoints,
  ]);

  return (
    <div style={{ height, width: "100%" }}>
      <canvas ref={chartRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

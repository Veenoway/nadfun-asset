'use client'
import Chart from 'chart.js/auto'
import { useEffect, useMemo, useRef } from 'react'
import { AxisConfig, MultiLineChartProps } from '../types'

export const MultiLineChart = ({
  data,
  lines,
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
  enableSecondaryYAxis = false,
  secondaryYAxisPosition = 'right',
  buyPointColor = '#00ff88',
  sellPointColor = '#ff4444',
  buyPointRadius = 8,
  sellPointRadius = 8,
  showTransactionPoints = true,
}: MultiLineChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const labels = useMemo(
    () => data?.map((entry) => new Date(entry.date).toLocaleDateString()) || [],
    [data],
  )

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current?.destroy()
    }

    const ctx = chartRef.current?.getContext('2d')

    const datasets = lines.map((lineConfig) => {
      const chartData =
        data?.map((entry) => entry[lineConfig.key] as number) || []

      return {
        label: lineConfig.label,
        data: chartData,
        borderColor: lineConfig.lineColor,
        backgroundColor: lineConfig.fillColor,
        borderWidth: lineConfig.lineWidth || 2,
        tension: lineConfig.tension || 0.5,
        fill: lineConfig.fill !== undefined ? lineConfig.fill : true,
        pointRadius: pointRadius,
        pointHoverRadius: pointHoverRadius,
        pointHoverBackgroundColor: lineConfig.lineColor,
        pointHoverBorderColor: pointBorderColor,
        pointHoverBorderWidth: pointBorderWidth,
        yAxisID: lineConfig.yAxisID || 'y',
      }
    })

    const transactionPlugin = {
      id: 'transactionPoints',
      afterDatasetsDraw: (chart: Chart) => {
        const {
          ctx,
          scales: { x, y },
        } = chart

        data.forEach((entry, index) => {
          if (entry.buyPoint || entry.sellPoint) {
            const xPos = x.getPixelForValue(index)
            const yPos = y.getPixelForValue(entry[lines[0].key] as number)

            ctx.save()
            ctx.beginPath()
            ctx.arc(xPos, yPos, buyPointRadius, 0, 2 * Math.PI)
            ctx.fillStyle = entry.buyPoint ? buyPointColor : sellPointColor
            ctx.fill()
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = '#FFFFFF'
            ctx.font = `bold ${Math.round(buyPointRadius)}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(entry.buyPoint ? 'B' : 'S', xPos, yPos)
            ctx.restore()
          }
        })
      },
    }

    const yAxesConfig: AxisConfig = {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          display: gridDisplay,
          color: gridColor,
        },
        ticks: {
          color: axisColor,
          font: {
            size: axisFontSize,
            family: axisFontFamily,
          },
        },
        border: {
          display: false,
        },
      },
    }

    if (enableSecondaryYAxis) {
      yAxesConfig.y1 = {
        type: 'linear',
        display: true,
        position: secondaryYAxisPosition,
        grid: {
          display: gridDisplay,
          color: gridColor,
        },
        ticks: {
          color: axisColor,
          font: {
            size: axisFontSize,
            family: axisFontFamily,
          },
        },
        border: {
          display: false,
        },
      }
    }

    if (!ctx) return

    chartInstance.current = new Chart(ctx as unknown as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: enableAnimation ? animationDuration : 0,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: axisColor,
              font: {
                size: axisFontSize,
                family: axisFontFamily,
              },
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
            callbacks: {
              label: function (context) {
                // const dataPoint = data[context.dataIndex];
                let label = context.dataset.label || ''

                if (label) {
                  label += ': $'
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US').format(
                    context.parsed.y,
                  )
                }
                return label
              },
              afterLabel: function (context) {
                const dataPoint = data[context.dataIndex]
                const transactions = []

                if (dataPoint.buyPoint) {
                  transactions.push(`Buy: ${dataPoint.buyAmount || 'N/A'}`)
                }
                if (dataPoint.sellPoint) {
                  transactions.push(`Sell: ${dataPoint.sellAmount || 'N/A'}`)
                }

                return transactions
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: gridDisplay,
              color: gridColor,
            },
            ticks: {
              color: axisColor,
              font: {
                size: axisFontSize,
                family: axisFontFamily,
              },
              padding: axisPadding,
              maxRotation: 0,
              minRotation: 0,
              callback: function (value, index) {
                if (index === 0) return labels[0]
                if (index === labels.length - 1)
                  return labels[labels.length - 1]
                return ''
              },
            },
            border: {
              display: false,
            },
          },
          ...yAxesConfig,
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
      plugins: showTransactionPoints ? [transactionPlugin] : [],
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [
    data,
    labels,
    lines,
    pointRadius,
    pointHoverRadius,
    pointBorderWidth,
    pointBorderColor,
    tooltipBackground,
    tooltipTitleColor,
    tooltipBodyColor,
    tooltipBorderColor,
    tooltipBorderWidth,
    tooltipDisplayColors,
    tooltipPadding,
    tooltipCornerRadius,
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
    buyPointColor,
    sellPointColor,
    buyPointRadius,
    sellPointRadius,
    showTransactionPoints,
  ])

  return (
    <div style={{ height, width: '100%' }}>
      <canvas ref={chartRef} style={{ maxHeight: '100%' }} />
    </div>
  )
}

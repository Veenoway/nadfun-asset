// CHART TYPES
export interface MultiLineChartProps {
  data: MultiLineDataPoint[];
  lines: LineConfig[];
  height?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBorderWidth?: number;
  pointBorderColor?: string;
  tooltipBackground?: string;
  tooltipTitleColor?: string;
  tooltipBodyColor?: string;
  tooltipBorderColor?: string;
  tooltipBorderWidth?: number;
  tooltipDisplayColors?: boolean;
  tooltipPadding?: number;
  tooltipCornerRadius?: number;
  buyPointColor?: string;
  sellPointColor?: string;
  buyPointRadius?: number;
  sellPointRadius?: number;
  showTransactionPoints?: boolean;
  gridDisplay?: boolean;
  gridColor?: string;
  axisColor?: string;
  axisFontSize?: number;
  axisFontFamily?: string;
  axisPadding?: number;
  enableAnimation?: boolean;
  animationDuration?: number;
  enableSecondaryYAxis?: boolean;
  secondaryYAxisPosition?: "left" | "right";
}

export interface MultiLineDataPoint {
  date: string;
  buyPoint?: boolean;
  sellPoint?: boolean;
  buyAmount?: number;
  sellAmount?: number;
  [key: string]: number | string | boolean | undefined;
}

export interface LineConfig {
  key: string;
  label: string;
  lineColor: string;
  fillColor: string;
  lineWidth?: number;
  tension?: number;
  fill?: boolean;
  yAxisID?: string;
}

export interface AxisConfig {
  y: {
    type: "linear";
    display: boolean;
    position: "left" | "right";
    grid?: {
      display?: boolean;
      color?: string;
      drawOnChartArea?: boolean;
    };
    ticks: {
      color: string;
      font: {
        size: number;
        family: string;
      };
    };
    border: {
      display: boolean;
    };
  };
  y1?: {
    type: "linear";
    display: boolean;
    position: "left" | "right";
    grid?: {
      display: boolean;
      color?: string;
      drawOnChartArea?: boolean;
    };
    ticks: {
      color: string;
      font: {
        size: number;
        family: string;
      };
    };
    border: {
      display: boolean;
    };
  };
}

// ASSET TYPES
export type ChartPoint = {
  date: string; // "YYYY-MM-DD"
  price: number;
  buyPoint: boolean;
  sellPoint: boolean;
  buyAmount: number;
  sellAmount: number;
};

export type Asset = {
  logo: string;
  symbol: string;
  name: string;
  price: number;
  chart: ChartPoint[];
};

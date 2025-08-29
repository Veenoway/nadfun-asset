// CHART TYPES
export interface MultiLineChartProps {
  data: AddressRow[];
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
  secondaryYAxisPosition?: 'left' | 'right';
  dataType?: DataType;
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
    type: 'linear';
    display: boolean;
    position: 'left' | 'right';
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
    type: 'linear';
    display: boolean;
    position: 'left' | 'right';
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

export type Asset = {
  logo: string;
  symbol: string;
  name: string;
  price: number;
  chart: ChartPoint[];
  address: string;
};

export type DataType = 'price' | 'volume';

export type TokenInfo = {
  image_uri: string;
  name: string;
  symbol: string;
  token_id: string;
};

export type ChartPoint = {
  data: { t: number; o: number; h: number; l: number; c: number; v?: number }[];
};

export type AddressRow<TChart = ChartPoint> = {
  address: `0x${string}`;
  token: TokenInfo;
  chart: TChart[];
  isLoading: boolean;
  error: Error | null;
};

export type AddressRows<TChart = ChartPoint> = AddressRow<TChart>[];

type UdfResponse = {
  s: string;
  t: number[]; // seconds
  o: (number | string)[];
  h: (number | string)[];
  l: (number | string)[];
  c: (number | string)[];
  v?: (number | string)[];
};

type CandlePoint = {
  time: number; // ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type ChartDataPoint = {
  date: string;
  price: number;
  buyPoint?: boolean;
  sellPoint?: boolean;
  buyAmount?: number;
  sellAmount?: number;
};

export function toPoints(r: UdfResponse): CandlePoint[] {
  const n = Math.min(
    r.t?.length ?? 0,
    r.o?.length ?? 0,
    r.h?.length ?? 0,
    r.l?.length ?? 0,
    r.c?.length ?? 0
  );

  const pts: CandlePoint[] = [];
  for (let i = 0; i < n; i++) {
    const time = timestampToDateString(r.t[i] * 1000); // → ms
    const open = parseFloat(r.o[i] as string);
    const high = parseFloat(r.h[i] as string);
    const low = parseFloat(r.l[i] as string);
    const close = parseFloat(r.c[i] as string);

    const volume = r.v && i < r.v.length ? parseFloat(r.v[i] as string) : undefined;

    pts.push({ time, open, high, low, close, volume });
  }

  return pts;
}

function timestampToDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

// Fonction pour forcer l'affichage décimal (pas scientifique)
export function toDecimalString(num: number): string {
  if (Math.abs(num) < 0.000001) {
    return num.toFixed(15).replace(/\.?0+$/, ''); // Supprime les zéros inutiles
  } else if (Math.abs(num) < 0.01) {
    return num.toFixed(10).replace(/\.?0+$/, '');
  } else if (Math.abs(num) < 1) {
    return num.toFixed(8).replace(/\.?0+$/, '');
  } else {
    return num.toFixed(4).replace(/\.?0+$/, '');
  }
}

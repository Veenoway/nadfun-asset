import { formatUnits } from 'viem';

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
    const time = r.t[i] * 1000;
    const open = parseFloat(r.o[i] as string);
    const high = parseFloat(r.h[i] as string);
    const low = parseFloat(r.l[i] as string);
    const close = parseFloat(r.c[i] as string);

    const volume = r.v && i < r.v.length ? parseFloat(r.v[i] as string) : undefined;

    pts.push({ time, open, high, low, close, volume });
  }

  return pts;
}

export function toDecimalString(num: number): string {
  if (Math.abs(num) < 0.000001) {
    return num.toFixed(15).replace(/\.?0+$/, '');
  } else if (Math.abs(num) < 0.01) {
    return num.toFixed(10).replace(/\.?0+$/, '');
  } else if (Math.abs(num) < 1) {
    return num.toFixed(8).replace(/\.?0+$/, '');
  } else {
    return num.toFixed(4).replace(/\.?0+$/, '');
  }
}

function toBigIntSafe(x: string | number | bigint): bigint {
  if (typeof x === 'bigint') return x;
  const s = String(x).trim();
  if (!/[eE]/.test(s)) return BigInt(s);

  const [coefStr, expStr] = s.toLowerCase().split('e');
  const exp = parseInt(expStr, 10);
  const [i = '0', f = ''] = coefStr.split('.');
  const digits = i + f;
  if (exp >= 0) {
    const zeros = exp - f.length;
    return BigInt(zeros >= 0 ? digits + '0'.repeat(zeros) : digits.slice(0, digits.length + zeros));
  }
  return BigInt(0);
}

function shiftDecimalStr(s: string, shift: number) {
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);

  const [intPart, fracPart = ''] = s.split('.');
  const digits = (intPart === '0' ? '' : intPart) + fracPart;
  const pos = intPart.length + shift;

  if (pos <= 0) {
    const zeros = '0'.repeat(-pos);
    s = '0.' + zeros + digits.replace(/^0+/, '');
  } else if (pos >= digits.length) {
    s = digits + '0'.repeat(pos - digits.length);
  } else {
    s = digits.slice(0, pos) + '.' + digits.slice(pos);
  }

  if (s.includes('.')) {
    s = s.replace(/^0+(?=\d)/, '');
    const [ip, fp] = s.split('.');
    s = (ip || '0') + '.' + fp.replace(/0+$/, '');
    if (s.endsWith('.')) s = s.slice(0, -1);
  } else {
    s = s.replace(/^0+(?=\d)/, '');
  }
  return (neg ? '-' : '') + (s || '0');
}

function formatDecimalFRCut(s: string, maxFrac: number) {
  const intPart = s.split('.')[0] || '0';
  let fracPart = s.split('.')[1] || '';
  if (maxFrac >= 0) fracPart = fracPart.slice(0, maxFrac);
  fracPart = fracPart.replace(/0+$/, '');
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return fracPart ? `${intFmt},${fracPart}` : intFmt;
}

type FormatOptions = {
  compact?: boolean; // active K/M/B/T
  compactThreshold?: number; // default 10000
  compactFrac?: number; // décimales en compact (default 2)
  normalFrac?: number; // décimales si >=1 (default 2)
  smallFrac?: number; // décimales si <1 (default 4)
};

const DEFAULT_OPTS: Required<FormatOptions> = {
  compact: true,
  compactThreshold: 10_000,
  compactFrac: 2,
  normalFrac: 2,
  smallFrac: 4,
};

export function formatAmount(
  raw: string | number | bigint,
  decimals: number,
  opts: FormatOptions = {}
) {
  const { compact, compactThreshold, compactFrac, normalFrac, smallFrac } = {
    ...DEFAULT_OPTS,
    ...opts,
  };

  const bi = toBigIntSafe(raw);
  const dec = formatUnits(bi, decimals);
  const [intPart] = dec.split('.');
  const intDigits = intPart.replace(/^0+/, '').length;

  const thresholdDigits = String(compactThreshold).length;
  const isCompact =
    compact &&
    (intDigits > thresholdDigits ||
      (intDigits === thresholdDigits && parseInt(intPart || '0', 10) >= compactThreshold));

  if (isCompact) {
    const p = Math.min(12, Math.max(3, Math.floor((intDigits - 1) / 3) * 3));
    const divided = shiftDecimalStr(dec, -p);
    const formatted = formatDecimalFRCut(divided, compactFrac);
    const suffix = p >= 12 ? 'T' : p >= 9 ? 'B' : p >= 6 ? 'M' : 'K';
    return `${formatted}${suffix}`;
  }

  const isSmall = intPart === '0';
  const maxFrac = isSmall ? smallFrac : normalFrac;
  return formatDecimalFRCut(dec, maxFrac);
}

import { useEffect, useMemo, useRef, useState } from 'react';

function getBucketConfig(timeFrame: string) {
  switch (timeFrame) {
    case '5m':
      return { buckets: 12, msPerBucket: 5 * 60 * 1000 };
    case '10m':
      return { buckets: 12, msPerBucket: 10 * 60 * 1000 };
    case '1h':
      return { buckets: 12, msPerBucket: 5 * 60 * 1000 };
    case '6h':
      return { buckets: 36, msPerBucket: 10 * 60 * 1000 };
    case '24h':
      return { buckets: 48, msPerBucket: 30 * 60 * 1000 };
    case '7d':
      return { buckets: 42, msPerBucket: 4 * 60 * 60 * 1000 };
    default:
      return { buckets: 48, msPerBucket: 30 * 60 * 1000 };
  }
}

const useLiveCurveStream = (token: string, timeFrame: string) => {
  const { buckets, msPerBucket } = useMemo(() => getBucketConfig(timeFrame), [timeFrame]);
  const [counts, setCounts] = useState<number[]>(() => Array.from({ length: buckets }, () => 0));
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  // Rotate buckets on interval
  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCounts((prev) => {
        const next = prev.slice(1);
        next.push(0);
        return next;
      });
    }, msPerBucket) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [msPerBucket]);

  // Reset counts when bucket size changes
  useEffect(() => {
    setCounts(Array.from({ length: buckets }, () => 0));
  }, [buckets]);

  // Connect WS - Temporarily disabled until WebSocket support is available in new API
  useEffect(() => {
    if (!token || token.length < 40 || !token.startsWith('0x')) return;

    // For now, just return without connecting to WebSocket
    // This will be re-enabled when the new API supports WebSocket
    console.log('WebSocket connection temporarily disabled for new API');

    // const url = `${WS_BASE}/ws/curve?token=${encodeURIComponent(token)}`;
    // const ws = new WebSocket(url);
    // wsRef.current = ws;
    // ... rest of WebSocket code

    return () => {
      // Cleanup if needed
    };
  }, [token, timeFrame]);

  return { counts };
};

export { useLiveCurveStream };

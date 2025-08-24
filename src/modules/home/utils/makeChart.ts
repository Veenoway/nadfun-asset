import { ChartPoint } from '../types';

/**
 * Génère 10 points avec variations up/down.
 * @param startPrice Prix de départ
 * @param seedInit   Graine pseudo-aléatoire
 * @param volatilityPct Amplitude max/jour (ex: 0.05 = ±5%)
 */
export const makeChart = (startPrice: number, seedInit = 1, volatilityPct = 0.05): ChartPoint[] => {
  const dateStr = (i: number) => `2024-01-${String(i + 1).padStart(2, '0')}`;

  let price = startPrice;
  let seed = seedInit;
  const points: ChartPoint[] = [];

  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280; // [0,1)
  };

  for (let i = 0; i < 10; i++) {
    const r = nextRand() - 0.5;

    let delta = Math.round(price * (r * (volatilityPct * 2)));
    if (delta === 0) delta = r > 0 ? 1 : -1;

    const newPrice = Math.max(1, price + delta);

    const buy = r > 0.25;
    const sell = r < -0.25;
    const amount = Math.max(10, Math.floor(Math.abs(delta) / 20));

    points.push({
      date: dateStr(i),
      price: newPrice,
      buyPoint: buy,
      sellPoint: sell,
      buyAmount: buy ? amount : 0,
      sellAmount: sell ? amount : 0,
    });

    price = newPrice;
  }

  return points;
};

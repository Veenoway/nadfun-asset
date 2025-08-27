import { Asset } from './types';
import { makeChart } from './utils/makeChart';

const cmc = (id: number) => `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`;

export const assets: Asset[] = [
  {
    logo: cmc(11419),
    symbol: 'TON',
    name: 'Toncoin',
    price: 720,
    chart: makeChart(690, 11),
  },
  {
    logo: cmc(6636),
    symbol: 'DOT',
    name: 'Polkadot',
    price: 680,
    chart: makeChart(640, 12),
  },
  {
    logo: cmc(2),
    symbol: 'LTC',
    name: 'Litecoin',
    price: 8800,
    chart: makeChart(8500, 13),
  },
  {
    logo: cmc(3890),
    symbol: 'MATIC',
    name: 'Polygon',
    price: 95,
    chart: makeChart(92, 14),
  },
  {
    logo: cmc(5994),
    symbol: 'SHIB',
    name: 'Shiba Inu',
    price: 0.02,
    chart: makeChart(0.019, 15),
  },
  {
    logo: cmc(5805),
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 3600,
    chart: makeChart(3500, 16),
  },
  {
    logo: cmc(1975),
    symbol: 'LINK',
    name: 'Chainlink',
    price: 1450,
    chart: makeChart(1400, 17),
  },
  {
    logo: cmc(7083),
    symbol: 'UNI',
    name: 'Uniswap',
    price: 780,
    chart: makeChart(750, 18),
  },
  {
    logo: cmc(512),
    symbol: 'XLM',
    name: 'Stellar',
    price: 12,
    chart: makeChart(11, 19),
  },
  {
    logo: cmc(3794),
    symbol: 'ATOM',
    name: 'Cosmos',
    price: 920,
    chart: makeChart(900, 20),
  },
];

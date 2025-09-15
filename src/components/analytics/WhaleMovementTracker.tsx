import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

const whaleMovements = [
  {
    id: 1,
    type: 'buy',
    amount: 850000,
    wallet: '0x7a5F...d9E2',
    time: '2 minutes ago',
    price: 0.00234,
  },
  {
    id: 2,
    type: 'sell',
    amount: 420000,
    wallet: '0x9bF3...a1C7',
    time: '5 minutes ago',
    price: 0.00231,
  },
  {
    id: 3,
    type: 'buy',
    amount: 1200000,
    wallet: '0x3eD8...f4B9',
    time: '8 minutes ago',
    price: 0.00229,
  },
  {
    id: 4,
    type: 'sell',
    amount: 680000,
    wallet: '0x5cA2...e8D1',
    time: '12 minutes ago',
    price: 0.00235,
  },
];

const WhaleMovementTracker = () => {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="gradient-text text-xl font-bold">Whale Movement Tracker</h3>
          <p className="text-gray-400 text-sm">Real-time large transaction alerts</p>
        </div>
        <div className="pulse-glow px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
          <span className="text-orange-400 text-sm font-medium">🐋 Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {whaleMovements.map((movement, index) => (
          <div
            key={movement.id}
            className="whale-alert"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-lg ${
                    movement.type === 'buy'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {movement.type === 'buy' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold text-lg ${
                        movement.type === 'buy' ? 'gradient-text-success' : 'gradient-text-danger'
                      }`}
                    >
                      {movement.type === 'buy' ? '+' : '-'}
                      {movement.amount.toLocaleString()} HYG/MON
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'buy'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {movement.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <span>Wallet: {movement.wallet}</span>
                    <span>Price: ${movement.price}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-400">{movement.time}</div>
                <div className="text-lg font-bold gradient-text">
                  ${(movement.amount * movement.price).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-2 right-2">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-cyan-400 pulse-glow" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full ping-glow"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">24h Whale Volume</div>
            <div className="counter gradient-text text-2xl font-bold">
              ${(3150000).toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Whale Transactions</div>
            <div className="counter gradient-text text-2xl font-bold">47</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { WhaleMovementTracker };

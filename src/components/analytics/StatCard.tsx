import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
      {trend === 'up' ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      )}
    </div>
    <div className="text-2xl font-bold text-white mb-1">
      {typeof value === 'string' ? value : value}
    </div>
    <div className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{change}</div>
  </div>
);

export { StatCard };

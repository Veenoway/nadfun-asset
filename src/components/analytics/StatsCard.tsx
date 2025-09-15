import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  format?: 'number' | 'currency' | 'percentage';
  animated?: boolean;
}

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
  animated = true,
}: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (animated && typeof value === 'number') {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.min(stepValue * currentStep, value));

        if (currentStep >= steps) {
          clearInterval(timer);
          setIsLoaded(true);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(typeof value === 'number' ? value : 0);
      setIsLoaded(true);
    }
  }, [value, animated]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val.toFixed(2)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = () => {
    if (change > 0) return 'gradient-text-success';
    if (change < 0) return 'gradient-text-danger';
    return 'text-gray-400';
  };

  const getChangeIcon = () => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="holo-card glow-border p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex items-center space-x-1">
          <span
            className={`text-sm font-medium ${getChangeColor()} animate-bounce-arrow`}
            style={{ animationDelay: '0.5s' }}
          >
            {getChangeIcon()}
          </span>
          <span className={`text-sm font-bold ${getChangeColor()}`}>
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="counter gradient-text text-3xl font-bold">
          {animated && typeof value === 'number'
            ? formatValue(displayValue)
            : typeof value === 'string'
              ? value
              : formatValue(value)}
        </div>
      </div>

      {isLoaded && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full pulse-glow">
          <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full ping-glow"></div>
        </div>
      )}
    </div>
  );
};

export { StatsCard };

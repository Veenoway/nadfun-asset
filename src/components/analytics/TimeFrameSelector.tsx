import { useState } from 'react';

interface TimeFrameSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const TimeFrameSelector = ({ value = '24h', onChange }: TimeFrameSelectorProps) => {
  const [timeFrame, setTimeFrame] = useState(value);

  const handleChange = (tf: string) => {
    setTimeFrame(tf);
    if (onChange) onChange(tf);
  };

  return (
    <div className="flex gap-2 bg-gray-800/40 rounded-lg p-1">
      {['1h', '6h', '24h', '7d'].map((tf) => (
        <button
          key={tf}
          onClick={() => handleChange(tf)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            timeFrame === tf ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
};

export { TimeFrameSelector };

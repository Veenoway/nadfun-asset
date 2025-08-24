'use client';

import { useMainStore } from '@/store/useMainStore';
import { cn } from '@/utils/cn';
import * as React from 'react';
import { Asset } from '../types';

type Token = { logo: string; symbol: string; name: string; price?: number };
type Props = {
  tokens: Token[];
  speed?: number;
  className?: string;
  onCompare?: (token: Token) => void;
};

type TokenItemProps = {
  token: Token;
  onCompare?: (t: Token) => void;
};

export function InfiniteTokenSelector({ tokens, speed = 80, className, onCompare }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const seqRef = React.useRef<HTMLDivElement>(null);
  const [copies, setCopies] = React.useState(2);
  const [duration, setDuration] = React.useState(20);
  const [paused, setPaused] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  const measure = React.useCallback(() => {
    const seq = seqRef.current;
    const wrap = containerRef.current;
    if (!seq || !wrap) return;

    const seqWidth = Math.max(1, Math.round(seq.scrollWidth));
    const wrapWidth = Math.max(1, Math.round(wrap.clientWidth));

    const needed = Math.max(2, Math.ceil(wrapWidth / seqWidth) + 1);
    setCopies(needed);

    setDuration(seqWidth / Math.max(1, speed));

    wrap.style.setProperty('--seq', `${seqWidth}px`);
  }, [speed]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const apply = () => setReduceMotion(mq.matches);
      apply();
      mq.addEventListener?.('change', apply);
      return () => mq.removeEventListener?.('change', apply);
    }
  }, []);

  React.useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (seqRef.current) ro.observe(seqRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure, tokens]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden select-none mb-4 group',
        'border border-white/10 rounded-lg bg-primary/20',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      style={{ '--duration': `${duration}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          'flex w-max will-change-transform',
          !reduceMotion && 'animate-[marquee_var(--duration)_linear_infinite]',
          paused && '[animation-play-state:paused]',
        )}
        style={{ animationDirection: 'reverse' }}
      >
        <div ref={seqRef} className="flex shrink-0">
          {tokens.map((t, idx) => (
            <TokenItem key={`a-${t.symbol}-${idx}`} token={t} onCompare={onCompare} />
          ))}
        </div>

        {Array.from({ length: copies - 1 }).map((_, k) => (
          <div key={`copy-${k}`} className="flex shrink-0" aria-hidden>
            {tokens.map((t, idx) => (
              <TokenItem key={`copy-${k}-${t.symbol}-${idx}`} token={t} onCompare={onCompare} />
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-1 * var(--seq, 300px)));
          }
        }
      `}</style>
    </div>
  );
}

const TokenItem = ({ token, onCompare }: TokenItemProps) => {
  const { setSelectedTokens, selectedTokens } = useMainStore();
  const selected = selectedTokens.some((t) => t.symbol === token.symbol);

  return (
    <button
      type="button"
      className={cn(
        'group/item flex items-center gap-3 px-3 py-2 m-2 rounded-md',
        'bg-primary border border-white/10 hover:border-white/20',
        'shadow-sm hover:shadow transition-colors',
        selected && 'bg-white/30',
      )}
      title={token.name}
      onClick={() => {
        if (selected) {
          setSelectedTokens(selectedTokens.filter((t) => t.symbol !== token.symbol));
        } else {
          setSelectedTokens([...selectedTokens, token as Asset]);
        }
      }}
      onDoubleClick={() => onCompare?.(token)}
    >
      <img
        src={token.logo}
        alt={`${token.name} logo`}
        width={20}
        height={20}
        className="rounded-sm"
      />
      <span className="font-medium">{token.symbol}</span>
    </button>
  );
};

import React from 'react';
import { ClayCard } from './ClayCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  changePct?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  badgeText?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  changePct,
  trendDirection = 'neutral',
  icon,
  badgeText,
  className
}) => {
  return (
    <ClayCard className={clsx('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6A62]">
          {label}
        </span>
        {icon && <div className="p-2 rounded-lg bg-[#EAE6DD] text-[#3157D5]">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-3xl font-bold text-[#171717] tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {changePct !== undefined && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded',
              trendDirection === 'up' && 'bg-[#4C8768]/15 text-[#4C8768]',
              trendDirection === 'down' && 'bg-[#C15D5D]/15 text-[#C15D5D]',
              trendDirection === 'neutral' && 'bg-[#6E6A62]/15 text-[#6E6A62]'
            )}
          >
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
            {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        {subtext && <span className="text-xs text-[#6E6A62] font-normal">{subtext}</span>}
        {badgeText && (
          <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] border border-[#D8D3C8]">
            {badgeText}
          </span>
        )}
      </div>
    </ClayCard>
  );
};

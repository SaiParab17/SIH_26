import React from 'react';
import { Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface DataFreshnessBadgeProps {
  lastUpdated?: string;
  status?: 'fresh' | 'syncing' | 'partial' | 'stale';
  className?: string;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  lastUpdated = '2 min ago',
  status = 'fresh',
  className
}) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono font-medium',
        status === 'fresh' && 'bg-[#FDF9F0] text-[#171717] border-[#D8D3C8]',
        status === 'syncing' && 'bg-[#3157D5]/10 text-[#3157D5] border-[#3157D5]/30',
        status === 'partial' && 'bg-[#C18A34]/10 text-[#C18A34] border-[#C18A34]/30',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={clsx(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            status === 'fresh' && 'bg-[#4C8768]',
            status === 'syncing' && 'bg-[#3157D5]',
            status === 'partial' && 'bg-[#C18A34]'
          )}
        ></span>
        <span
          className={clsx(
            'relative inline-flex rounded-full h-2 w-2',
            status === 'fresh' && 'bg-[#4C8768]',
            status === 'syncing' && 'bg-[#3157D5]',
            status === 'partial' && 'bg-[#C18A34]'
          )}
        ></span>
      </span>

      <div className="flex items-center gap-1">
        {status === 'syncing' ? (
          <RefreshCw className="w-3 h-3 animate-spin text-[#3157D5]" />
        ) : status === 'partial' ? (
          <AlertTriangle className="w-3 h-3 text-[#C18A34]" />
        ) : (
          <Clock className="w-3 h-3 text-[#6E6A62]" />
        )}
        <span>Data Freshness: {lastUpdated}</span>
      </div>
    </div>
  );
};

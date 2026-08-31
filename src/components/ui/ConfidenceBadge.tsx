import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  score?: number; // 0.0 to 1.0
  level?: 'High' | 'Medium' | 'Low';
  showIcon?: boolean;
  labelPrefix?: string;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  level,
  showIcon = true,
  labelPrefix = 'Confidence',
  className
}) => {
  const computedLevel = level || (score !== undefined ? (score >= 0.8 ? 'High' : score >= 0.6 ? 'Medium' : 'Low') : 'High');
  const pctText = score !== undefined ? `${Math.round(score * 100)}%` : computedLevel;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 badge-mono border px-2 py-0.5 rounded',
        computedLevel === 'High' && 'bg-[#4C8768]/15 text-[#4C8768] border-[#4C8768]/30',
        computedLevel === 'Medium' && 'bg-[#C18A34]/15 text-[#C18A34] border-[#C18A34]/30',
        computedLevel === 'Low' && 'bg-[#C15D5D]/15 text-[#C15D5D] border-[#C15D5D]/30',
        className
      )}
    >
      {showIcon && (computedLevel === 'High' ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />)}
      <span>{labelPrefix}: {pctText}</span>
    </span>
  );
};

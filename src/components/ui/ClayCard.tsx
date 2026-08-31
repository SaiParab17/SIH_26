import React from 'react';
import { clsx } from 'clsx';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  className,
  onClick,
  hoverEffect = true
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-[#FDF9F0] border border-[#D8D3C8]/80 rounded-xl p-5 shadow-[0_4px_16px_-2px_rgba(45,38,25,0.06)]',
        hoverEffect && 'hover:shadow-[0_8px_24px_-4px_rgba(45,38,25,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface PartialResultBannerProps {
  message?: string;
  platform?: string;
  target?: number;
  fetched?: number;
}

export const PartialResultBanner: React.FC<PartialResultBannerProps> = ({
  message = "Collection returned fewer usable records than configured target. Analytics are computed using available valid data.",
  platform = "Instagram",
  target = 1000,
  fetched = 710
}) => {
  return (
    <div className="bg-[#C18A34]/10 border border-[#C18A34]/30 text-[#171717] px-4 py-3 rounded-lg flex items-start gap-3 text-xs mb-6">
      <AlertCircle className="w-4 h-4 text-[#C18A34] shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 font-mono font-semibold text-[#C18A34] uppercase tracking-wide mb-0.5">
          <span>Partial Dataset Notice</span>
          <span className="bg-[#C18A34]/20 px-1.5 py-0.5 rounded">{platform}: {fetched}/{target} valid items</span>
        </div>
        <p className="text-[#171717]/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

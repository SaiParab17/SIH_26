import React from 'react';
import { SocialPlatform } from '../../types';
import { Send, MessageSquare, Globe, Share2, Play, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';

interface PlatformBadgeProps {
  platform: SocialPlatform | string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  showLabel = true,
  size = 'md',
  className
}) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'telegram':
        return <Send className="w-3.5 h-3.5" />;
      case 'reddit':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'instagram':
        return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'youtube':
        return <Play className="w-3.5 h-3.5" />;
      case 'facebook':
        return <Globe className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  const getStyles = () => {
    switch (platform.toLowerCase()) {
      case 'x':
        return 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/30';
      case 'telegram':
        return 'bg-[#24A1DE]/10 text-[#24A1DE] border-[#24A1DE]/30';
      case 'reddit':
        return 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/30';
      case 'instagram':
        return 'bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/30';
      case 'youtube':
        return 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/30';
      case 'facebook':
        return 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/30';
      default:
        return 'bg-[#58779F]/10 text-[#58779F] border-[#58779F]/30';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono font-medium border rounded-md px-2 py-0.5 capitalize',
        size === 'sm' && 'text-[11px] py-0.5 px-1.5',
        size === 'md' && 'text-xs py-1 px-2.5',
        size === 'lg' && 'text-sm py-1.5 px-3',
        getStyles(),
        className
      )}
    >
      {getIcon()}
      {showLabel && <span>{platform}</span>}
    </span>
  );
};

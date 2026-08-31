import React from 'react';
import { Search, Filter, Play, Download, Bell, Database } from 'lucide-react';
import { DataFreshnessBadge } from '../ui/DataFreshnessBadge';

interface HeaderProps {
  activeTab: string;
  onOpenCollect: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCollect, onOpenReport }) => {
  return (
    <header className="bg-[#FDF9F0] border-b border-[#D8D3C8] px-6 py-3 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Target Active Monitoring Session */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4C8768] animate-ping"></div>
          <span className="font-heading font-semibold text-sm text-[#171717]">
            Active Monitoring: <span className="text-[#3157D5]">"AI Regulation & Social Intelligence"</span>
          </span>
        </div>
        <span className="text-[#D8D3C8]">|</span>
        <DataFreshnessBadge lastUpdated="2 min ago" status="fresh" />
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
          <input
            type="text"
            placeholder="Search keywords, posts, authors..."
            className="bg-[#EAE6DD] text-xs font-sans pl-8 pr-3 py-1.5 rounded-md border border-[#D8D3C8] focus:outline-none focus:border-[#3157D5] w-64 placeholder:text-[#6E6A62]"
          />
        </div>

        <button
          onClick={onOpenCollect}
          className="clay-button-secondary text-xs px-3 py-1.5 font-sans flex items-center gap-1.5"
        >
          <Database className="w-3.5 h-3.5 text-[#3157D5]" />
          <span>New Collection</span>
        </button>

        <button
          onClick={onOpenReport}
          className="clay-button text-xs px-3.5 py-1.5 font-sans flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};

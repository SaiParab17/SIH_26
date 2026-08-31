import React from 'react';
import {
  LayoutDashboard,
  Database,
  Activity,
  SmilePlus,
  Users,
  Layers,
  TrendingUp,
  Share2,
  Columns,
  FileCheck,
  Bot,
  FileText,
  Settings,
  Globe,
  Radio
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'landing', label: 'Public Portal', icon: Globe, section: 'Core' },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, section: 'Core' },
    { id: 'collect', label: 'Setup Collection', icon: Database, section: 'Data Ingestion' },
    { id: 'status', label: 'Live Pipeline Status', icon: Activity, section: 'Data Ingestion' },
    { id: 'sentiment', label: 'Sentiment & Emotion', icon: SmilePlus, section: 'Analytics' },
    { id: 'audience', label: 'Audience Intelligence', icon: Users, section: 'Analytics' },
    { id: 'topics', label: 'Topic Explorer', icon: Layers, section: 'Analytics' },
    { id: 'trends', label: 'Trend Intelligence', icon: TrendingUp, section: 'Analytics' },
    { id: 'network', label: 'Network & Propagation', icon: Share2, section: 'Intelligence' },
    { id: 'platforms', label: 'Cross-Platform', icon: Columns, section: 'Intelligence' },
    { id: 'evidence', label: 'Evidence Vault', icon: FileCheck, section: 'Verification' },
    { id: 'ai-analyst', label: 'AI Intelligence Analyst', icon: Bot, section: 'Verification', badge: 'RAG' },
    { id: 'reports', label: 'Executive Reports', icon: FileText, section: 'Output' },
    { id: 'settings', label: 'Settings & Models', icon: Settings, section: 'Output' }
  ];

  return (
    <aside className="w-64 bg-[#EAE6DD] border-r border-[#D8D3C8] flex flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#D8D3C8] flex items-center gap-3 bg-[#FDF9F0]/60">
        <div className="w-9 h-9 rounded-lg bg-[#3157D5] flex items-center justify-center text-white shadow-md">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-[#171717] tracking-tight leading-tight">
            SocialScope
          </h1>
          <p className="font-mono text-[10px] text-[#6E6A62] uppercase tracking-wider">
            SIH 26152 • Intelligence OS
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {['Core', 'Data Ingestion', 'Analytics', 'Intelligence', 'Verification', 'Output'].map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E6A62]/80 mb-1.5">
                {section}
              </div>
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#3157D5] text-white shadow-sm font-semibold'
                        : 'text-[#171717] hover:bg-[#FDF9F0] hover:text-[#3157D5]'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-[#6E6A62]')} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={clsx(
                          'text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase',
                          isActive ? 'bg-white/20 text-white' : 'bg-[#3157D5]/10 text-[#3157D5]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer provenance */}
      <div className="p-3 m-3 bg-[#FDF9F0] border border-[#D8D3C8] rounded-lg text-center">
        <span className="font-mono text-[10px] text-[#6E6A62] block">
          Model: Gemini 3.6 Flash
        </span>
        <span className="text-[11px] font-semibold text-[#3157D5] block">
          Status: Ingestion Active
        </span>
      </div>
    </aside>
  );
};

import React from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { Download, Printer, ShieldCheck, FileText, Info } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Executive Intelligence Report Generator
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement G • Executive intelligence report with methodology & limitations audit
          </p>
        </div>

        <button onClick={handlePrint} className="clay-button text-xs px-4 py-2 flex items-center gap-2">
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Report Container */}
      <ClayCard className="p-8 bg-[#FDF9F0] border-2 border-[#D8D3C8] space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b border-[#D8D3C8] pb-6 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-[#3157D5] uppercase tracking-wider block mb-1">
              SocialScope Intelligence Audit • Executive Brief
            </span>
            <h1 className="font-heading font-extrabold text-3xl text-[#171717]">
              Multi-Platform Social Conversation Briefing
            </h1>
            <span className="text-xs text-[#6E6A62] block mt-1">
              Topic: "AI Regulation & Social Intelligence" | Period: Last 24 Hours
            </span>
          </div>

          <div className="text-right font-mono text-xs text-[#6E6A62]">
            <span className="block font-bold text-[#171717]">DOC_ID: REP_2026_0831</span>
            <span>Date: 2026-08-31</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#171717] border-b border-[#D8D3C8]/60 pb-1">
            1. Executive Summary
          </h2>
          <p className="text-xs text-[#171717] leading-relaxed">
            During the analyzed 24-hour window, 182,430 canonical social events across six platforms (X, Telegram, Reddit, Instagram, YouTube, Facebook) were evaluated. Discussion around AI compliance and agentic safety frameworks dominated topic volume, exhibiting a 340% increase in growth velocity.
          </p>
        </div>

        {/* Section 2: Key Intelligence Findings */}
        <div className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-[#171717] border-b border-[#D8D3C8]/60 pb-1">
            2. Primary Intelligence Findings
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[#6E6A62] block">Dominant Sentiment</span>
              <span className="font-bold text-[#4C8768]">Positive 46.2% | Negative 32.8%</span>
            </div>
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[#6E6A62] block">Top Influence Lead</span>
              <span className="font-bold text-[#3157D5]">@tech_analyst_raj (PageRank: 0.88)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Methodology & Limitations (SIH Spec Rule) */}
        <div className="space-y-3 pt-4 border-t border-[#D8D3C8]">
          <h2 className="font-heading font-bold text-lg text-[#171717] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3157D5]" />
            3. Ingestion Methodology & Audit Notice
          </h2>
          <div className="p-4 bg-[#EAE6DD] rounded-lg text-xs font-mono space-y-2 text-[#6E6A62]">
            <p>• Data collection targets were fulfilled based on valid unique deduplicated items (182,430 items total).</p>
            <p>• Demographic attributes are aggregate estimates derived from public bio indicators and topic graphs.</p>
            <p>• TrendScore predictions carry a +1h/+6h/+24h probability horizon based on observable acceleration metrics.</p>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

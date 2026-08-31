import React from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { INITIAL_PLATFORMS } from '../services/mockData';
import { Columns, ArrowUpRight, BarChart2, CheckCircle2 } from 'lucide-react';

export const CrossPlatformPage: React.FC = () => {
  const comparisonMatrix = [
    { platform: 'x', name: 'X (Twitter)', volumePct: 41, sentimentPos: 42, sentimentNeg: 38, topTopic: 'AI Regulation & Compliance', velocity: 'High' },
    { platform: 'telegram', name: 'Telegram', volumePct: 24, sentimentPos: 38, sentimentNeg: 46, topTopic: 'Data Protection & Telemetry', velocity: 'Very High' },
    { platform: 'reddit', name: 'Reddit', volumePct: 18, sentimentPos: 35, sentimentNeg: 53, topTopic: 'Agent Sandboxing Security', velocity: 'Moderate' },
    { platform: 'instagram', name: 'Instagram', volumePct: 9, sentimentPos: 68, sentimentNeg: 18, topTopic: 'AI Tools & Visual Showcase', velocity: 'Moderate' },
    { platform: 'youtube', name: 'YouTube', volumePct: 5, sentimentPos: 62, sentimentNeg: 22, topTopic: 'Deep-Dive Video Analysis', velocity: 'Steady' },
    { platform: 'facebook', name: 'Facebook', volumePct: 3, sentimentPos: 51, sentimentNeg: 32, topTopic: 'General Public Discussion', velocity: 'Low' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Cross-Platform Analytical Comparison Matrix
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement F • Comparative sentiment, topic volume, and velocity rates across 6 social networks
          </p>
        </div>
        <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] px-3 py-1 text-xs">
          Normalized Rates
        </span>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <ClayCard className="p-6 bg-[#FDF9F0] overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
          <Columns className="w-5 h-5 text-[#3157D5]" />
          <h2 className="font-heading font-bold text-base text-[#171717]">
            Multi-Platform Metric Breakdown
          </h2>
        </div>

        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-[#D8D3C8] font-mono text-[#6E6A62] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Platform Connector</th>
              <th className="py-3 px-4">Volume Share %</th>
              <th className="py-3 px-4">Positive %</th>
              <th className="py-3 px-4">Negative %</th>
              <th className="py-3 px-4">Dominant Topic</th>
              <th className="py-3 px-4">Velocity State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D3C8]">
            {comparisonMatrix.map((row) => (
              <tr key={row.platform} className="hover:bg-[#EAE6DD] transition-colors font-medium">
                <td className="py-3.5 px-4">
                  <PlatformBadge platform={row.platform} />
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#171717]">
                  {row.volumePct}%
                </td>
                <td className="py-3.5 px-4 font-mono text-[#4C8768] font-bold">
                  {row.sentimentPos}%
                </td>
                <td className="py-3.5 px-4 font-mono text-[#C15D5D] font-bold">
                  {row.sentimentNeg}%
                </td>
                <td className="py-3.5 px-4 text-[#171717]">
                  {row.topTopic}
                </td>
                <td className="py-3.5 px-4">
                  <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] border border-[#D8D3C8]">
                    {row.velocity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ClayCard>
    </div>
  );
};

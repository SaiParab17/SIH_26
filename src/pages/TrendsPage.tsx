import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { MOCK_TRENDS } from '../services/mockData';
import { TrendingUp, Sparkles, Info, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { TrendItem } from '../types';

export const TrendsPage: React.FC = () => {
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(MOCK_TRENDS[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Real-Time Trend Detection & Rising-Trend Forecast
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement D • Multivariate TrendScore heuristics & +1h / +6h / +24h time-series forecast
          </p>
        </div>
        <ConfidenceBadge level="High" score={0.93} labelPrefix="Forecast Accuracy" />
      </div>

      {/* TrendScore Formula Transparency Notice (SIH Spec Rule) */}
      <ClayCard className="p-5 bg-[#FDF9F0] border-l-4 border-l-[#3157D5]">
        <div className="flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-[#3157D5] shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold text-sm text-[#171717] block mb-1">
              Configurable TrendScore Methodology
            </span>
            <div className="font-mono text-xs text-[#6E6A62] bg-[#EAE6DD] p-2.5 rounded border border-[#D8D3C8] font-medium leading-relaxed">
              TrendScore = 0.35 × GrowthRate + 0.25 × EngagementVelocity + 0.20 × UniqueUserGrowth + 0.10 × CrossPlatformSpread + 0.10 × Recency
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Ranked Trends & Selected Forecast Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Trend List */}
        <ClayCard className="lg:col-span-2 p-6 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3157D5]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Ranked Emerging & Accelerating Trends
              </h2>
            </div>
            <span className="badge-mono bg-[#EAE6DD] text-[#3157D5]">Live Ranking</span>
          </div>

          <div className="space-y-4">
            {MOCK_TRENDS.map((trend, idx) => (
              <div
                key={trend.id}
                onClick={() => setSelectedTrend(trend)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTrend?.id === trend.id
                    ? 'bg-[#EAE6DD] border-[#3157D5] ring-2 ring-[#3157D5]/20 shadow-md'
                    : 'bg-[#FDF9F0] border-[#D8D3C8] hover:bg-[#EAE6DD]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-[#3157D5] w-6 text-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#171717]">{trend.topic}</h3>
                      <span className="text-xs text-[#6E6A62]">{trend.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-[#171717] block">
                      {trend.trendScore.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#4C8768] bg-[#4C8768]/15 px-2 py-0.5 rounded">
                      ↑ {trend.growthRatePct}%
                    </span>
                  </div>
                </div>

                {/* Sub-component Scores */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono pt-2 border-t border-[#D8D3C8]/60 mt-2">
                  <div>
                    <span className="text-[#6E6A62] block">Velocity</span>
                    <span className="font-bold text-[#171717]">{trend.engagementVelocity}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A62] block">User Growth</span>
                    <span className="font-bold text-[#171717]">{trend.uniqueUsersGrowth}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A62] block">Cross Spread</span>
                    <span className="font-bold text-[#171717]">{trend.crossPlatformSpread}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A62] block">Forecast 24h</span>
                    <span className="font-bold text-[#3157D5]">{trend.forecast24h}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Selected Trend Forecast Window */}
        {selectedTrend && (
          <ClayCard className="p-6 bg-[#FDF9F0] flex flex-col justify-between border-2 border-[#3157D5]/40">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#3157D5]" />
                <span className="font-mono text-xs font-bold uppercase text-[#3157D5]">
                  Time-Series Predictive Forecast
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-[#171717] mb-4">
                {selectedTrend.topic}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="p-3 bg-[#EAE6DD] rounded-lg">
                  <span className="text-xs text-[#6E6A62] block">Current TrendScore</span>
                  <span className="font-mono text-3xl font-bold text-[#171717]">
                    {selectedTrend.trendScore.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono p-2 bg-[#EAE6DD] rounded">
                    <span className="text-[#6E6A62] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> +1 Hour Horizon:
                    </span>
                    <span className="font-bold text-[#3157D5]">{selectedTrend.forecast1h.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono p-2 bg-[#EAE6DD] rounded">
                    <span className="text-[#6E6A62] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> +6 Hours Horizon:
                    </span>
                    <span className="font-bold text-[#3157D5]">{selectedTrend.forecast6h.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono p-2 bg-[#EAE6DD] rounded">
                    <span className="text-[#6E6A62] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> +24 Hours Horizon:
                    </span>
                    <span className="font-bold text-[#3157D5]">{selectedTrend.forecast24h.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#4C8768]/15 border border-[#4C8768]/30 rounded-lg text-xs">
                <span className="font-mono font-bold text-[#4C8768] uppercase block mb-1">
                  Predictive Classification
                </span>
                <span className="font-sans font-semibold text-[#171717] capitalize">
                  {selectedTrend.prediction.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <span className="text-[11px] text-[#6E6A62] mt-4 block text-center italic">
              Forecast indicates high trajectory probability based on current momentum.
            </span>
          </ClayCard>
        )}
      </div>
    </div>
  );
};

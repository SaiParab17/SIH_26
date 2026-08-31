import React, { useState, useEffect } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { INITIAL_PLATFORMS, MOCK_PIPELINE_STEPS } from '../services/mockData';
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Layers, Database, ArrowRight } from 'lucide-react';

interface CollectionStatusPageProps {
  onProceedToDashboard: () => void;
}

export const CollectionStatusPage: React.FC<CollectionStatusPageProps> = ({ onProceedToDashboard }) => {
  const [pipelineSteps, setPipelineSteps] = useState(MOCK_PIPELINE_STEPS);
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Live Collection Telemetry & Pipeline Status
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement A • WebSocket/SSE live job progression and per-source telemetry
          </p>
        </div>

        <button
          onClick={onProceedToDashboard}
          className="clay-button text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <span>Explore Computed Analytics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Per-Platform Ingestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_PLATFORMS.map(platform => (
          <ClayCard key={platform.id} className="p-5 bg-[#FDF9F0]">
            <div className="flex items-center justify-between mb-3 border-b border-[#D8D3C8] pb-2">
              <PlatformBadge platform={platform.id} size="md" />
              <span
                className={`font-mono text-xs font-bold ${
                  platform.completionPercentage === 100
                    ? 'text-[#4C8768]'
                    : 'text-[#3157D5]'
                }`}
              >
                {platform.completionPercentage === 100 ? 'COMPLETE' : 'INGESTING'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="flex justify-between">
                <span className="text-[#6E6A62]">Target Items Cap:</span>
                <span className="text-[#171717] font-semibold">{platform.targetItems.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6A62]">Valid Unique Fetched:</span>
                <span className="text-[#4C8768] font-bold">{platform.validUniqueCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6A62]">Deduplicated Items:</span>
                <span className="text-[#DE775A]">{platform.duplicateCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6A62]">API Errors / Skipped:</span>
                <span className="text-[#C15D5D]">{platform.errorCount}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#6E6A62]">Progress</span>
                <span className="font-bold text-[#171717]">{platform.completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3157D5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${platform.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </ClayCard>
        ))}
      </div>

      {/* Analysis Pipeline Steps Sequence */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3157D5]" />
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Multi-Stage Analytical Pipeline Progress
            </h2>
          </div>
          {isSimulating ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#3157D5]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Stream Ingestion Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#4C8768] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Ready
            </span>
          )}
        </div>

        <div className="space-y-3">
          {pipelineSteps.map(step => (
            <div
              key={step.id}
              className="p-3.5 bg-[#EAE6DD] rounded-lg border border-[#D8D3C8] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4C8768] shrink-0" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-[#3157D5] animate-spin shrink-0" />
                )}
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#171717]">{step.name}</h3>
                  {step.detailMessage && (
                    <span className="text-xs text-[#6E6A62] font-mono">{step.detailMessage}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#171717]">
                  {step.progressPct}%
                </span>
                <span className="badge-mono bg-[#FDF9F0] text-[#3157D5] border border-[#D8D3C8]">
                  {step.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
};

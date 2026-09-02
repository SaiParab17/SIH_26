import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, Code2, Copy, Check } from 'lucide-react';
import { CanonicalSocialEvent } from '../../types';
import { PlatformBadge } from '../ui/PlatformBadge';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { ClayCard } from '../ui/ClayCard';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CanonicalSocialEvent | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'provenance' | 'json'>('provenance');

  if (!isOpen || !event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-xl bg-[#EAE6DD] h-full shadow-2xl flex flex-col border-l border-[#D8D3C8]">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D8D3C8] bg-[#FDF9F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PlatformBadge platform={event.platform} />
              <ConfidenceBadge score={event.analysis?.sentiment?.score ?? 0.8} />
            </div>
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Evidence Inspection: {event.event_id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EAE6DD] text-[#6E6A62] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 py-2.5 border-b border-[#D8D3C8] bg-[#EAE6DD] flex items-center gap-2">
          <button
            onClick={() => setViewTab('provenance')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewTab === 'provenance' ? 'bg-[#3157D5] text-white' : 'text-[#6E6A62] hover:bg-[#FDF9F0]'
            }`}
          >
            Provenance & Metadata
          </button>
          <button
            onClick={() => setViewTab('json')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              viewTab === 'json' ? 'bg-[#3157D5] text-white' : 'text-[#6E6A62] hover:bg-[#FDF9F0]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Raw JSON Model
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {viewTab === 'provenance' ? (
            <>
              {/* Event Content Snippet */}
              <ClayCard className="bg-[#FDF9F0]">
                <h3 className="font-heading text-xs font-bold text-[#6E6A62] uppercase tracking-wider mb-2">
                  Public Social Event Text
                </h3>
                <p className="text-sm text-[#171717] leading-relaxed font-sans font-medium mb-3">
                  "{event.content?.text || ''}"
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {(event.content?.hashtags || []).map((tag) => (
                    <span key={tag} className="font-mono text-[#3157D5] bg-[#3157D5]/10 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </ClayCard>

              {/* Multi-Dimensional Inference */}
              <div className="grid grid-cols-2 gap-3">
                <ClayCard className="p-3">
                  <span className="text-[11px] font-mono text-[#6E6A62] block mb-1">Sentiment</span>
                  <span className="font-heading font-bold text-sm text-[#171717] capitalize">
                    {event.analysis?.sentiment?.label ?? 'neutral'} ({Math.round((event.analysis?.sentiment?.score ?? 0) * 100)}%)
                  </span>
                </ClayCard>

                <ClayCard className="p-3">
                  <span className="text-[11px] font-mono text-[#6E6A62] block mb-1">Emotion</span>
                  <span className="font-heading font-bold text-sm text-[#171717] capitalize">
                    {event.analysis?.emotion?.label ?? 'surprise'} ({Math.round((event.analysis?.emotion?.score ?? 0) * 100)}%)
                  </span>
                </ClayCard>

                <ClayCard className="p-3">
                  <span className="text-[11px] font-mono text-[#6E6A62] block mb-1">Stance</span>
                  <span className="font-heading font-bold text-sm text-[#171717] capitalize">
                    {event.analysis?.stance?.label ?? 'neutral'} ({Math.round((event.analysis?.stance?.score ?? 0) * 100)}%)
                  </span>
                </ClayCard>

                <ClayCard className="p-3">
                  <span className="text-[11px] font-mono text-[#6E6A62] block mb-1">Sarcasm Detected</span>
                  <span className="font-heading font-bold text-sm text-[#171717]">
                    {event.analysis?.sarcasm?.detected ? 'Yes (Confidence: High)' : 'No'}
                  </span>
                </ClayCard>
              </div>

              {/* Author & Telemetry */}
              <ClayCard className="bg-[#FDF9F0]">
                <h3 className="font-heading text-xs font-bold text-[#6E6A62] uppercase tracking-wider mb-2">
                  Author & Collection Provenance
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#D8D3C8]/60 pb-1">
                    <span className="text-[#6E6A62]">Author Username:</span>
                    <span className="font-bold text-[#171717]">@{event.author?.username || 'unknown'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D8D3C8]/60 pb-1">
                    <span className="text-[#6E6A62]">Display Name:</span>
                    <span className="text-[#171717]">{event.author?.display_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D8D3C8]/60 pb-1">
                    <span className="text-[#6E6A62]">Collector Engine:</span>
                    <span className="text-[#3157D5]">{event.source?.collector || 'unknown'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#D8D3C8]/60 pb-1">
                    <span className="text-[#6E6A62]">Created Timestamp:</span>
                    <span className="text-[#171717]">{event.timestamps?.created_at || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6A62]">Collected Timestamp:</span>
                    <span className="text-[#171717]">{event.timestamps?.collected_at || 'N/A'}</span>
                  </div>
                </div>
              </ClayCard>

              {/* Link out */}
              <a
                href={event.source.url}
                target="_blank"
                rel="noreferrer"
                className="clay-button-secondary text-xs w-full justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Original Public Post
              </a>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 p-1.5 rounded bg-[#FDF9F0] border border-[#D8D3C8] text-xs font-mono text-[#171717] hover:bg-[#EAE6DD] flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4C8768]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
              <pre className="p-4 bg-[#171717] text-[#FDF9F0] rounded-lg font-mono text-xs overflow-x-auto max-h-[500px]">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

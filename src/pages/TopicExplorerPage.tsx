import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { MOCK_TOPICS } from '../services/mockData';
import { Layers, Search, ArrowRight, Hash, X } from 'lucide-react';
import { TopicCluster } from '../types';

export const TopicExplorerPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<TopicCluster | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Automated Topic Discovery & Cluster Hub
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement D • Vector embedding & HDBSCAN topic clustering over 182,430 items
          </p>
        </div>
        <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] px-3 py-1 text-xs">
          124 Distinct Topics Discovered
        </span>
      </div>

      {/* Topic Cluster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TOPICS.map((topic) => (
          <ClayCard
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className="p-6 bg-[#FDF9F0] border-2 border-[#D8D3C8] hover:border-[#3157D5] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#D8D3C8] pb-2">
              <span className="font-mono text-xs font-bold text-[#3157D5] bg-[#3157D5]/10 px-2 py-0.5 rounded">
                Trend Score: {topic.trendScore.toFixed(2)}
              </span>
              <span className="font-mono text-xs font-semibold text-[#4C8768]">
                ↑ {topic.growthRatePct}% Growth
              </span>
            </div>

            <h2 className="font-heading font-bold text-xl text-[#171717] mb-2">
              {topic.title}
            </h2>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {topic.keywords.map((kw) => (
                <span key={kw} className="font-mono text-[11px] bg-[#EAE6DD] text-[#171717] px-2 py-0.5 rounded">
                  #{kw}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 bg-[#EAE6DD] rounded-lg mb-4">
              <div>
                <span className="text-[10px] text-[#6E6A62] block">Volume</span>
                <span className="font-mono font-bold text-[#171717]">{topic.volume.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#4C8768] block">Positive</span>
                <span className="font-mono font-bold text-[#4C8768]">{topic.sentiment.positive}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#C15D5D] block">Negative</span>
                <span className="font-mono font-bold text-[#C15D5D]">{topic.sentiment.negative}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D8D3C8] text-xs">
              <div className="flex items-center gap-1">
                {topic.platforms.map((p) => (
                  <PlatformBadge key={p} platform={p} showLabel={false} size="sm" />
                ))}
              </div>
              <span className="font-mono font-semibold text-[#3157D5] flex items-center gap-1">
                Inspect Cluster <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </ClayCard>
        ))}
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FDF9F0] border-2 border-[#D8D3C8] rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#3157D5] uppercase block mb-1">
                  Topic Deep Dive
                </span>
                <h2 className="font-heading font-bold text-2xl text-[#171717]">{selectedTopic.title}</h2>
              </div>
              <button onClick={() => setSelectedTopic(null)} className="p-1 rounded-lg hover:bg-[#EAE6DD]">
                <X className="w-6 h-6 text-[#6E6A62]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#EAE6DD] rounded-lg">
                <span className="text-[#6E6A62] block mb-1">Total Mentions Volume</span>
                <span className="text-xl font-bold text-[#171717]">{selectedTopic.volume.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#EAE6DD] rounded-lg">
                <span className="text-[#6E6A62] block mb-1">Trend Velocity Score</span>
                <span className="text-xl font-bold text-[#3157D5]">{selectedTopic.trendScore}</span>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-sm text-[#171717] mb-2">Key Opinion Leaders Driving Topic</h3>
              <div className="space-y-1 text-xs font-mono">
                {selectedTopic.topInfluencers.map((inf) => (
                  <div key={inf} className="p-2 bg-[#EAE6DD] rounded flex justify-between">
                    <span className="font-bold text-[#171717]">{inf}</span>
                    <span className="text-[#3157D5]">High Engagement Lead</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-3 border-t border-[#D8D3C8]">
              <button onClick={() => setSelectedTopic(null)} className="clay-button text-xs">
                Close Topic Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

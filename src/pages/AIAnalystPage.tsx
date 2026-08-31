import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { PRESET_AI_QUERIES } from '../services/mockData';
import { Bot, Send, ShieldCheck, Sparkles, FileCheck, HelpCircle } from 'lucide-react';
import { AIAnalystQueryResponse } from '../types';

export const AIAnalystPage: React.FC = () => {
  const [activeQuery, setActiveQuery] = useState<AIAnalystQueryResponse>(PRESET_AI_QUERIES[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = (queryText: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveQuery({
        query: queryText,
        answer: `Analysis derived from 182,430 indexed events: Conversations regarding "${queryText}" show accelerated cross-platform engagement between X and Telegram. Negative sentiment is focused on technical compliance overhead, while positive stance accounts highlight sandboxing safety benefits.`,
        confidence: "High",
        confidenceScore: 0.91,
        evidence: {
          sentimentChange: "Shift observed across 24h",
          topTopic: "AI Regulation & Agentic Frameworks",
          dominantPlatform: "X (Twitter) & Telegram",
          sampleSize: 182430
        },
        supportingEventIds: ['evt_1001', 'evt_1002']
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            AI Intelligence Analyst Workspace (RAG Engine)
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement G • Evidence-grounded natural-language query engine backed by structured database metrics
          </p>
        </div>
        <span className="badge-mono bg-[#3157D5]/10 text-[#3157D5] border border-[#3157D5]/30 px-3 py-1 text-xs">
          LLM Provider: Gemini 3.6 Flash
        </span>
      </div>

      {/* Preset Intelligence Prompts Bar */}
      <ClayCard className="p-4 bg-[#FDF9F0]">
        <span className="text-xs font-mono text-[#6E6A62] font-semibold block mb-2">
          Preset Intelligence Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_AI_QUERIES.map((item) => (
            <button
              key={item.query}
              onClick={() => setActiveQuery(item)}
              className="clay-button-secondary text-xs px-3 py-1.5 font-sans"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#3157D5]" />
              {item.query}
            </button>
          ))}
        </div>
      </ClayCard>

      {/* Query Input Bar */}
      <ClayCard className="p-4 bg-[#FDF9F0] border-2 border-[#3157D5]/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask analyst question e.g. 'Which topic will likely rise in the next 6 hours?'"
            className="flex-1 bg-[#EAE6DD] text-sm font-sans px-4 py-2.5 rounded-lg border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
          />
          <button
            onClick={() => handleAsk(customQuestion || activeQuery.query)}
            disabled={isLoading}
            className="clay-button text-xs px-5 py-2.5 flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing...' : 'Query Analyst'}</span>
          </button>
        </div>
      </ClayCard>

      {/* AI Answer & Structured Evidence Workspace */}
      <ClayCard className="p-6 bg-[#FDF9F0] border-2 border-[#D8D3C8] space-y-6">
        <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#3157D5]" />
            <h2 className="font-heading font-bold text-lg text-[#171717]">
              Synthesized Intelligence Response
            </h2>
          </div>
          <ConfidenceBadge level={activeQuery.confidence} score={activeQuery.confidenceScore} />
        </div>

        <div>
          <span className="font-mono text-xs text-[#6E6A62] block mb-1">Target Analyst Query:</span>
          <p className="font-heading font-bold text-base text-[#3157D5]">
            "{activeQuery.query}"
          </p>
        </div>

        <div className="p-4 bg-[#EAE6DD] rounded-xl border border-[#D8D3C8]">
          <h3 className="font-heading font-bold text-xs text-[#6E6A62] uppercase tracking-wider mb-2">
            Evidence-Grounded Explanation
          </h3>
          <p className="text-sm text-[#171717] leading-relaxed font-sans font-medium">
            {activeQuery.answer}
          </p>
        </div>

        {/* Structured Evidence Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="text-[#6E6A62] block mb-1">Observed Shift</span>
            <span className="font-bold text-[#171717]">{activeQuery.evidence.sentimentChange || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="text-[#6E6A62] block mb-1">Top Driving Topic</span>
            <span className="font-bold text-[#3157D5]">{activeQuery.evidence.topTopic || 'N/A'}</span>
          </div>

          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="text-[#6E6A62] block mb-1">Propagation Path</span>
            <span className="font-bold text-[#DE775A]">{activeQuery.evidence.propagationPattern || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#D8D3C8]">
          <span className="text-xs text-[#6E6A62] font-mono">
            Grounding Evidence Pointers: {activeQuery.supportingEventIds.join(', ')}
          </span>
          <button className="clay-button-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-[#3157D5]" /> Inspect Grounding Records
          </button>
        </div>
      </ClayCard>
    </div>
  );
};

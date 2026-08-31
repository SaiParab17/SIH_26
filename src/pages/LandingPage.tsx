import React from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { Radio, ArrowRight, ShieldCheck, Cpu, Share2, Layers, TrendingUp, Search, Database } from 'lucide-react';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreDashboard
}) => {
  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#171717] pb-16">
      {/* Top Banner */}
      <header className="border-b border-[#D8D3C8] bg-[#FDF9F0] px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3157D5] flex items-center justify-center text-white shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-heading font-bold text-xl tracking-tight text-[#171717]">
              SocialScope
            </span>
            <span className="ml-2 font-mono text-xs text-[#3157D5] bg-[#3157D5]/10 px-2 py-0.5 rounded font-semibold">
              SIH 26152
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onExploreDashboard} className="clay-button-secondary text-xs">
            Explore Intelligence
          </button>
          <button onClick={onStartAnalysis} className="clay-button text-xs">
            Start Analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#3157D5] bg-[#3157D5]/10 border border-[#3157D5]/20 px-3 py-1 rounded-full mb-6">
          <ShieldCheck className="w-4 h-4" />
          AI-Powered Social Intelligence & Audience Analytics
        </div>

        <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-[#171717] leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
          See the conversation. <br />
          Understand the audience. <br />
          <span className="text-[#3157D5]">Trace the influence.</span>
        </h1>

        <p className="text-lg md:text-xl text-[#6E6A62] max-w-3xl mx-auto leading-relaxed mb-8 font-sans">
          SocialScope transforms multi-platform public social media data into evidence-backed intelligence across sentiment, emotion, audience composition, emerging trends, and network propagation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button onClick={onStartAnalysis} className="clay-button text-sm px-6 py-3 font-semibold">
            Configure Data Collection <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onExploreDashboard} className="clay-button-secondary text-sm px-6 py-3 font-semibold">
            View Live Intelligence Dashboard
          </button>
        </div>

        {/* Tactile Hero Object (Interactive Telemetry Preview) */}
        <div className="max-w-4xl mx-auto clay-card p-6 bg-[#FDF9F0] text-left border-2 border-[#D8D3C8] shadow-xl">
          <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#4C8768] animate-ping"></div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171717]">
                Live Research Instrument Telemetry
              </span>
            </div>
            <span className="font-mono text-xs text-[#6E6A62]">
              Analysis ID: <span className="text-[#171717] font-semibold">ANL_2026_0831</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[11px] font-mono uppercase text-[#6E6A62] block mb-1">Processed Events</span>
              <span className="font-mono text-2xl font-bold text-[#171717]">182,430</span>
            </div>
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[11px] font-mono uppercase text-[#6E6A62] block mb-1">Unique Authors</span>
              <span className="font-mono text-2xl font-bold text-[#171717]">31,882</span>
            </div>
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[11px] font-mono uppercase text-[#6E6A62] block mb-1">Dominant Sentiment</span>
              <span className="font-mono text-2xl font-bold text-[#4C8768]">Positive 46%</span>
            </div>
            <div className="p-3 bg-[#EAE6DD] rounded-lg">
              <span className="text-[11px] font-mono uppercase text-[#6E6A62] block mb-1">Rising Trends</span>
              <span className="font-mono text-2xl font-bold text-[#3157D5]">12 Topics</span>
            </div>
          </div>

          {/* Supported Connectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8D3C8]">
            <span className="text-xs font-mono text-[#6E6A62] font-semibold">Active Platforms:</span>
            <div className="flex flex-wrap items-center gap-2">
              <PlatformBadge platform="x" />
              <PlatformBadge platform="telegram" />
              <PlatformBadge platform="reddit" />
              <PlatformBadge platform="instagram" />
              <PlatformBadge platform="youtube" />
              <PlatformBadge platform="facebook" />
            </div>
          </div>
        </div>
      </section>

      {/* Six-Stage Pipeline Workflow */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl text-[#171717] mb-2">
            Multi-Platform Pipeline Architecture
          </h2>
          <p className="text-sm text-[#6E6A62]">
            SIH 26152 compliant continuous ingestion and multi-dimensional analysis workflow.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Collect', desc: 'Multi-platform ingestion', icon: Database },
            { step: '02', title: 'Normalize', desc: 'Canonical event model', icon: Cpu },
            { step: '03', title: 'Understand', desc: 'Sentiment, emotion & stance', icon: Layers },
            { step: '04', title: 'Detect', desc: 'Real-time topics & trends', icon: TrendingUp },
            { step: '05', title: 'Trace', desc: 'Network & propagation', icon: Share2 },
            { step: '06', title: 'Explain', desc: 'Evidence-backed RAG AI', icon: ShieldCheck }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <ClayCard key={item.step} className="p-4 text-center">
                <span className="font-mono text-xs font-bold text-[#3157D5] bg-[#3157D5]/10 px-2 py-0.5 rounded inline-block mb-2">
                  {item.step}
                </span>
                <Icon className="w-5 h-5 mx-auto text-[#171717] mb-2" />
                <h3 className="font-heading font-bold text-sm text-[#171717]">{item.title}</h3>
                <p className="text-[11px] text-[#6E6A62] mt-1">{item.desc}</p>
              </ClayCard>
            );
          })}
        </div>
      </section>

      {/* Four Dimensions Overview */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClayCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-[#3157D5]/10 text-[#3157D5] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-xl text-[#171717] mb-2">
              Multi-Dimensional Sentiment & Emotion
            </h3>
            <p className="text-sm text-[#6E6A62] leading-relaxed mb-4">
              Separates positive/negative sentiment from emotion (fear, anxiety, joy) and policy stance (support vs against). Includes sarcasm detection to prevent false inferences.
            </p>
            <span className="font-mono text-xs text-[#3157D5] font-semibold">
              SIH Requirement B • Detailed Sentiment Breakdown →
            </span>
          </ClayCard>

          <ClayCard className="p-6">
            <div className="w-10 h-10 rounded-lg bg-[#DE775A]/10 text-[#DE775A] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-xl text-[#171717] mb-2">
              Trend Intelligence & Forecasting
            </h3>
            <p className="text-sm text-[#6E6A62] leading-relaxed mb-4">
              Calculates multi-variate <code className="font-mono text-xs font-bold text-[#171717]">TrendScore</code> using velocity, unique-user growth, and cross-platform spread to predict +1h, +6h, +24h trends.
            </p>
            <span className="font-mono text-xs text-[#DE775A] font-semibold">
              SIH Requirement D • Trend Forecasting Engine →
            </span>
          </ClayCard>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <ClayCard className="p-10 bg-[#EAE6DD]">
          <h2 className="font-heading font-extrabold text-3xl text-[#171717] mb-3">
            Ready to analyze public social conversations?
          </h2>
          <p className="text-sm text-[#6E6A62] max-w-xl mx-auto mb-6">
            Experience SocialScope's Tactile Intelligence platform designed for research, policy analysis, and operational social intelligence.
          </p>
          <button onClick={onStartAnalysis} className="clay-button text-sm px-6 py-3">
            Open Setup Portal <ArrowRight className="w-4 h-4" />
          </button>
        </ClayCard>
      </section>
    </div>
  );
};

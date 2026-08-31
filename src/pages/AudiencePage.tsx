import React from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { MOCK_AUDIENCE } from '../services/mockData';
import { Users, Globe2, Briefcase, Languages, Info } from 'lucide-react';

export const AudiencePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Automated Aggregate Audience Intelligence
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement C • Anonymized aggregate audience profiling from public signals
          </p>
        </div>
        <ConfidenceBadge score={0.82} level="High" labelPrefix="Aggregate Sample Confidence" />
      </div>

      {/* Privacy Notice (SIH Spec Rule) */}
      <div className="bg-[#EAE6DD] border border-[#D8D3C8] p-4 rounded-lg flex items-start gap-3 text-xs text-[#171717]">
        <Info className="w-4 h-4 text-[#3157D5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy & Probability Notice:</strong> Individual profile attributes are estimated from public bio text, language patterns, and topic graphs. Precise age or sensitive personal data is never exposed. Displayed percentages represent estimated aggregate distribution.
        </p>
      </div>

      {/* Primary Grid: Age Brackets & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estimated Age Brackets */}
        <ClayCard className="p-6 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3157D5]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Estimated Age Bracket Composition
              </h2>
            </div>
            <span className="badge-mono bg-[#EAE6DD] text-[#3157D5]">4 Segments</span>
          </div>

          <div className="space-y-4">
            {MOCK_AUDIENCE.ageBrackets.map((bracket) => (
              <div key={bracket.segment} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-[#171717]">{bracket.segment}</span>
                    <span className="text-[10px] font-mono text-[#6E6A62]">({bracket.sample_size.toLocaleString()} sample)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#3157D5]">{bracket.percentage}%</span>
                    <ConfidenceBadge score={bracket.confidence} showIcon={false} />
                  </div>
                </div>

                <div className="w-full bg-[#EAE6DD] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3157D5] h-full rounded-full"
                    style={{ width: `${bracket.percentage}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#6E6A62] block">Basis: {bracket.basis}</span>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Geographic Signals */}
        <ClayCard className="p-6 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#DE775A]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Geographic Signals & Stated Locations
              </h2>
            </div>
            <span className="badge-mono bg-[#EAE6DD] text-[#DE775A]">Aggregated</span>
          </div>

          <div className="space-y-3">
            {MOCK_AUDIENCE.geography.map((geo) => (
              <div key={geo.country} className="p-3 bg-[#EAE6DD] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{geo.flag}</span>
                  <div>
                    <span className="font-heading font-bold text-sm text-[#171717] block">{geo.country}</span>
                    <span className="text-[10px] font-mono text-[#6E6A62]">{geo.count.toLocaleString()} observed accounts</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-[#171717]">{geo.percentage}%</span>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>

      {/* Languages & Inferred Professional Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages */}
        <ClayCard className="p-6 bg-[#FDF9F0]">
          <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
            <Languages className="w-5 h-5 text-[#4C8768]" />
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Detected Content Languages
            </h2>
          </div>

          <div className="space-y-3">
            {MOCK_AUDIENCE.languages.map((lang) => (
              <div key={lang.code} className="flex items-center justify-between text-xs p-2.5 bg-[#EAE6DD] rounded">
                <div className="flex items-center gap-2">
                  <span className="badge-mono bg-[#FDF9F0] text-[#171717]">{lang.code}</span>
                  <span className="font-semibold text-[#171717]">{lang.language}</span>
                </div>
                <span className="font-mono font-bold text-[#171717]">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Inferred Interests */}
        <ClayCard className="p-6 bg-[#FDF9F0]">
          <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
            <Briefcase className="w-5 h-5 text-[#3157D5]" />
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Inferred Professional & Topic Interests
            </h2>
          </div>

          <div className="space-y-3">
            {MOCK_AUDIENCE.interests.map((interest) => (
              <div key={interest.interest} className="flex items-center justify-between text-xs p-2.5 bg-[#EAE6DD] rounded">
                <div>
                  <span className="font-semibold text-[#171717] block">{interest.interest}</span>
                  <span className="text-[10px] text-[#6E6A62] font-mono">{interest.category}</span>
                </div>
                <span className="font-mono font-bold text-[#3157D5]">{interest.percentage}%</span>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

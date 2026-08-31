import React from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { MOCK_SENTIMENT, MOCK_EMOTIONS, MOCK_STANCE } from '../services/mockData';
import { SmilePlus, ShieldAlert, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const SentimentPage: React.FC = () => {
  const emotionData = [
    { subject: 'Joy', A: MOCK_EMOTIONS.joy, fullMark: 100 },
    { subject: 'Anger', A: MOCK_EMOTIONS.anger, fullMark: 100 },
    { subject: 'Fear', A: MOCK_EMOTIONS.fear, fullMark: 100 },
    { subject: 'Anxiety', A: MOCK_EMOTIONS.anxiety, fullMark: 100 },
    { subject: 'Excitement', A: MOCK_EMOTIONS.excitement, fullMark: 100 },
    { subject: 'Sadness', A: MOCK_EMOTIONS.sadness, fullMark: 100 },
    { subject: 'Surprise', A: MOCK_EMOTIONS.surprise, fullMark: 100 }
  ];

  const stanceData = [
    { stance: 'Supportive', value: MOCK_STANCE.support, fill: '#4C8768' },
    { stance: 'Against', value: MOCK_STANCE.against, fill: '#C15D5D' },
    { stance: 'Neutral', value: MOCK_STANCE.neutral, fill: '#6E6A62' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Multi-Dimensional Sentiment & Emotion Intelligence
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement B • Distinct inference across Positive/Negative, Emotions, Policy Stance & Sarcasm
          </p>
        </div>
        <ConfidenceBadge level="High" score={0.91} labelPrefix="Model Confidence" />
      </div>

      {/* Critical Guidance Notice (SIH Spec Rule) */}
      <div className="bg-[#EAE6DD] border border-[#D8D3C8] p-4 rounded-lg flex items-start gap-3 text-xs text-[#171717]">
        <AlertCircle className="w-4 h-4 text-[#3157D5] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Multi-dimensional separation:</strong> A message can carry negative sentiment while simultaneously expressing support for policy reform. Sentiment, Emotion, and Stance are evaluated as separate analytical dimensions.
        </p>
      </div>

      {/* Primary Split: Emotion Radar & Policy Stance Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Radar Chart */}
        <ClayCard className="p-6 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
            <div className="flex items-center gap-2">
              <SmilePlus className="w-5 h-5 text-[#3157D5]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Detected Emotional Dimensions
              </h2>
            </div>
            <span className="badge-mono bg-[#EAE6DD] text-[#3157D5]">7 Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={emotionData}>
                <PolarGrid stroke="#D8D3C8" />
                <PolarAngleAxis dataKey="subject" stroke="#171717" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} stroke="#6E6A62" fontSize={10} />
                <Radar name="Emotion Score %" dataKey="A" stroke="#3157D5" fill="#3157D5" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Policy Stance & Sarcasm Card */}
        <div className="space-y-6">
          <ClayCard className="p-6 bg-[#FDF9F0]">
            <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#DE775A]" />
                <h2 className="font-heading font-bold text-base text-[#171717]">
                  Target Topic Stance Analysis
                </h2>
              </div>
              <span className="badge-mono bg-[#EAE6DD] text-[#DE775A]">Policy Stance</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stanceData} layout="vertical">
                  <XAxis type="number" stroke="#6E6A62" fontSize={11} />
                  <YAxis type="category" dataKey="stance" stroke="#171717" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>

          {/* Sarcasm Detection Telemetry */}
          <ClayCard className="p-5 bg-[#FDF9F0]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-[#6E6A62] uppercase tracking-wider block">
                  Sarcasm & Irony Detection
                </span>
                <span className="font-heading font-bold text-lg text-[#171717]">
                  4.2% Sarcastic Events Detected
                </span>
              </div>
              <ConfidenceBadge score={0.88} level="High" />
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};

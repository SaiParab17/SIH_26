import React, { useState, useEffect } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { MetricCard } from '../components/ui/MetricCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { PartialResultBanner } from '../components/ui/PartialResultBanner';
import { MOCK_SENTIMENT, MOCK_TRENDS, INITIAL_PLATFORMS, MOCK_TOPICS } from '../services/mockData';
import { fetchYouTubeStats, checkHealth } from '../services/youtubeApi';
import { Activity, TrendingUp, Users, MessageSquare, Layers, ArrowUpRight, ShieldAlert, Play } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const pieColors = ['#4C8768', '#C15D5D', '#6E6A62'];

  // Real YouTube and Python backend stats
  const [ytStats, setYtStats] = useState<{ totalEvents: number; posts: number; comments: number } | null>(null);
  const [pyStats, setPyStats] = useState<{ xEvents: number; fbEvents: number; instaEvents: number } | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [pythonOnline, setPythonOnline] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      const online = await checkHealth();
      setBackendOnline(online);
      if (online) {
        try {
          const stats = await fetchYouTubeStats();
          setYtStats({
            totalEvents: stats.totalEvents,
            posts: stats.eventsByType.posts,
            comments: stats.eventsByType.comments,
          });
        } catch (err) {
          console.error('Failed to fetch YouTube stats:', err);
        }
      }

      // Check python backend and fetch events
      try {
        const { checkPythonHealth, fetchPythonEvents } = await import('../services/pythonApi');
        const pyOnline = await checkPythonHealth();
        setPythonOnline(pyOnline);
        if (pyOnline) {
          const pyRes = await fetchPythonEvents({ limit: 5000 });
          const xCount = pyRes.events.filter(e => e.platform === 'x').length;
          const fbCount = pyRes.events.filter(e => e.platform === 'facebook').length;
          const instaCount = pyRes.events.filter(e => e.platform === 'instagram').length;
          setPyStats({ xEvents: xCount, fbEvents: fbCount, instaEvents: instaCount });
        }
      } catch (err) {
        console.error('Failed to fetch Python stats:', err);
      }
    };
    loadStats();
  }, []);

  // Merge real YouTube and Python stats into platform data
  const platforms = INITIAL_PLATFORMS.map(p => {
    if (p.id === 'youtube' && ytStats) {
      return {
        ...p,
        validUniqueCount: ytStats.totalEvents,
        completionPercentage: Math.min(100, (ytStats.totalEvents / p.targetItems) * 100),
      };
    }
    if (p.id === 'x' && pyStats) {
      return {
        ...p,
        validUniqueCount: pyStats.xEvents,
        completionPercentage: Math.min(100, (pyStats.xEvents / p.targetItems) * 100),
      };
    }
    if (p.id === 'facebook' && pyStats) {
      return {
        ...p,
        validUniqueCount: pyStats.fbEvents,
        completionPercentage: Math.min(100, (pyStats.fbEvents / p.targetItems) * 100),
      };
    }
    if (p.id === 'instagram' && pyStats) {
      return {
        ...p,
        validUniqueCount: pyStats.instaEvents,
        completionPercentage: Math.min(100, (pyStats.instaEvents / p.targetItems) * 100),
      };
    }
    return p;
  });

  const sentimentData = [
    { name: 'Positive', value: MOCK_SENTIMENT?.positive ?? 46.2 },
    { name: 'Negative', value: MOCK_SENTIMENT?.negative ?? 32.8 },
    { name: 'Neutral', value: MOCK_SENTIMENT?.neutral ?? 21.0 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717] tracking-tight">
            Intelligence Overview Dashboard
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH 26152 • Multi-platform real-time public social conversation intelligence summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('collect')} className="clay-button-secondary text-xs">
            Configure Sources
          </button>
          <button onClick={() => onNavigate('ai-analyst')} className="clay-button text-xs">
            Ask AI Analyst
          </button>
        </div>
      </div>

      {/* Partial Data Notice Banner */}
      <PartialResultBanner
        platform="Instagram"
        target={1000}
        fetched={710}
        message="Instagram collection returned 710 valid records out of 1000 target items. Analytics are computed using available valid data."
      />

      {/* Primary KPI Grid (Question 1 & SIH Core Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Social Events"
          value={182430 + (ytStats?.totalEvents ?? 0) + (pyStats?.xEvents ?? 0) + (pyStats?.fbEvents ?? 0) + (pyStats?.instaEvents ?? 0)}
          changePct={14.2}
          trendDirection="up"
          subtext="Normalized canonical items"
          badgeText="Live Stream"
          icon={<Activity className="w-5 h-5 text-[#3157D5]" />}
        />

        <MetricCard
          label="Unique Authors"
          value={31882}
          changePct={8.4}
          trendDirection="up"
          subtext="Anonymized public accounts"
          badgeText="Verified"
          icon={<Users className="w-5 h-5 text-[#DE775A]" />}
        />

        <MetricCard
          label="Dominant Sentiment"
          value="Positive 46.2%"
          changePct={-2.1}
          trendDirection="down"
          subtext="Negative: 32.8% | Neutral: 21.0%"
          badgeText="Multi-dim"
          icon={<MessageSquare className="w-5 h-5 text-[#4C8768]" />}
        />

        <MetricCard
          label="Top Emerging Trend"
          value="AI Regulation"
          changePct={340}
          trendDirection="up"
          subtext="TrendScore: 0.92 / 1.00"
          badgeText="Viral Rank #1"
          icon={<TrendingUp className="w-5 h-5 text-[#3157D5]" />}
        />
      </div>

      {/* Timeline & Sentiment Overview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversation Volume & Sentiment Timeline */}
        <ClayCard className="lg:col-span-2 p-5 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Conversation Volume & Sentiment Shift over 24h
              </h2>
              <span className="text-xs text-[#6E6A62]">
                X-axis: UTC Time | Y-axis: Inferred Sentiment Ratio
              </span>
            </div>
            <button
              onClick={() => onNavigate('sentiment')}
              className="text-xs font-mono font-semibold text-[#3157D5] hover:underline flex items-center gap-1"
            >
              Detailed Breakdown <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SENTIMENT?.timeline ?? []}>
                <defs>
                  <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4C8768" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4C8768" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C15D5D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C15D5D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#6E6A62" fontSize={11} tickLine={false} />
                <YAxis stroke="#6E6A62" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="positive" stroke="#4C8768" fillOpacity={1} fill="url(#colorPos)" name="Positive %" />
                <Area type="monotone" dataKey="negative" stroke="#C15D5D" fillOpacity={1} fill="url(#colorNeg)" name="Negative %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ClayCard>

        {/* Sentiment Distribution Pie & Key Signals */}
        <ClayCard className="p-5 bg-[#FDF9F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Aggregate Sentiment Split
              </h2>
              <ConfidenceBadge level="High" score={0.89} />
            </div>
            <p className="text-xs text-[#6E6A62] mb-4">
              Continuous BERT inference over 182,430 items
            </p>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#171717', color: '#FFF', borderRadius: '6px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="font-mono text-xl font-bold text-[#171717]">46.2%</span>
                <span className="text-[10px] text-[#6E6A62] block font-semibold uppercase">Positive</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#D8D3C8]">
            <div className="p-2 bg-[#EAE6DD] rounded">
              <span className="text-[10px] text-[#4C8768] font-bold block">Positive</span>
              <span className="font-mono text-sm font-bold text-[#171717]">46.2%</span>
            </div>
            <div className="p-2 bg-[#EAE6DD] rounded">
              <span className="text-[10px] text-[#C15D5D] font-bold block">Negative</span>
              <span className="font-mono text-sm font-bold text-[#171717]">32.8%</span>
            </div>
            <div className="p-2 bg-[#EAE6DD] rounded">
              <span className="text-[10px] text-[#6E6A62] font-bold block">Neutral</span>
              <span className="font-mono text-sm font-bold text-[#171717]">21.0%</span>
            </div>
          </div>
        </ClayCard>
      </div>

      {/* Ranked Trends & Platform Ingestion Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 4 Ranked Rising Trends */}
        <ClayCard className="p-5 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3157D5]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Top Ranked Emerging & Rising Trends
              </h2>
            </div>
            <button
              onClick={() => onNavigate('trends')}
              className="text-xs font-mono font-semibold text-[#3157D5] hover:underline"
            >
              View All Trends →
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_TRENDS.slice(0, 4).map((trend, idx) => (
              <div
                key={trend.id}
                onClick={() => onNavigate('trends')}
                className="p-3 bg-[#EAE6DD] rounded-lg border border-[#D8D3C8] flex items-center justify-between hover:bg-[#E0DACF] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#3157D5] w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#171717]">{trend.topic}</h3>
                    <span className="text-[11px] text-[#6E6A62]">{trend.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#171717] block">
                    Score: {trend.trendScore.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-[#4C8768] bg-[#4C8768]/15 px-1.5 py-0.5 rounded">
                    ↑ {trend.growthRatePct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Platform Connectors & Ingestion Target Status */}
        <ClayCard className="p-5 bg-[#FDF9F0]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#DE775A]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Multi-Platform Source Ingestion Status
              </h2>
            </div>
            <button
              onClick={() => onNavigate('status')}
              className="text-xs font-mono font-semibold text-[#3157D5] hover:underline"
            >
              Live Telemetry →
            </button>
          </div>

          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="p-3 bg-[#EAE6DD] rounded-lg border border-[#D8D3C8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={platform.id} />
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#171717] block">
                      Target: {platform.targetItems.toLocaleString()} items
                    </span>
                    <span className="text-[10px] text-[#6E6A62]">
                      Fetched: {platform.validUniqueCount.toLocaleString()} valid unique
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#D8D3C8] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#3157D5] h-full rounded-full"
                      style={{ width: `${platform.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#171717] w-12 text-right">
                    {Math.round(platform.completionPercentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

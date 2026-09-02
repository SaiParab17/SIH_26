import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { Database, Play, CheckCircle2, Sliders, Info, Clock, Layers, Loader2, AlertCircle } from 'lucide-react';
import { INITIAL_PLATFORMS } from '../services/mockData';
import { ingestYouTube, checkHealth, type YouTubeIngestionResult } from '../services/youtubeApi';
import {
  triggerXCollection,
  triggerFacebookCollection,
  triggerInstagramCollection,
  triggerMultiCollection,
  pollJobUntilComplete,
  checkPythonHealth,
  type PythonJobResponse,
} from '../services/pythonApi';

interface CollectionSetupPageProps {
  onStartCollection: () => void;
}

export const CollectionSetupPage: React.FC<CollectionSetupPageProps> = ({ onStartCollection }) => {
  const [platforms, setPlatforms] = useState(INITIAL_PLATFORMS);
  const [topicQuery, setTopicQuery] = useState('SIH 2026');
  const [hashtags, setHashtags] = useState('#SIH2026, #SmartIndiaHackathon, #InnovateIndia');
  const [mentions, setMentions] = useState('@mhrd_innovation, @aicte_hq, @sih2026');
  const [timeWindow, setTimeWindow] = useState('24h');
  const [recentPct, setRecentPct] = useState(60);
  const [engagementPct, setEngagementPct] = useState(20);
  const [velocityPct, setVelocityPct] = useState(20);
  const [visibleBrowser, setVisibleBrowser] = useState(true);

  // Ingestion state
  const [isIngesting, setIsIngesting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [ingestionResult, setIngestionResult] = useState<YouTubeIngestionResult | null>(null);
  const [xJobResult, setXJobResult] = useState<PythonJobResponse | null>(null);
  const [fbJobResult, setFbJobResult] = useState<PythonJobResponse | null>(null);
  const [instaJobResult, setInstaJobResult] = useState<PythonJobResponse | null>(null);
  const [ingestionError, setIngestionError] = useState<string | null>(null);

  const handleLaunchCollection = async () => {
    setIsIngesting(true);
    setIngestionResult(null);
    setXJobResult(null);
    setFbJobResult(null);
    setInstaJobResult(null);
    setIngestionError(null);
    setCurrentStep('');

    try {
      // 1. Check connectivity
      setCurrentStep('Checking backend connectivity...');
      const [nodeOnline, pythonOnline] = await Promise.all([checkHealth(), checkPythonHealth()]);

      if (!nodeOnline && !pythonOnline) {
        setIngestionError('Neither backend server is accessible. Ensure both servers are running.');
        return;
      }

      // 2. YouTube Node backend ingestion (ONLY if YouTube checkbox/platform is ENABLED)
      const ytPlatform = platforms.find(p => p.id === 'youtube');
      if (nodeOnline && ytPlatform && ytPlatform.status !== 'disabled') {
        setCurrentStep('Ingesting YouTube videos & comments...');
        const maxResults = Math.min(Math.ceil((ytPlatform.targetItems ?? 500) / 20), 25);

        try {
          const result = await ingestYouTube({
            query: topicQuery,
            maxResults,
            maxCommentsPerVideo: 20,
          });

          setIngestionResult(result);
        } catch (ytErr) {
          const msg = ytErr instanceof Error ? ytErr.message : 'YouTube ingestion failed';
          setIngestionError(`YouTube: ${msg}`);
        }
      }

      // 3. X, Facebook & Instagram Python FastAPI collector ingestion
      if (pythonOnline) {
        const xPlatform = platforms.find(p => p.id === 'x');
        const fbPlatform = platforms.find(p => p.id === 'facebook');
        const instaPlatform = platforms.find(p => p.id === 'instagram');

        const isFbEnabled = fbPlatform && fbPlatform.status !== 'disabled';
        const isInstaEnabled = instaPlatform && instaPlatform.status !== 'disabled';
        const isXEnabled = xPlatform && xPlatform.status !== 'disabled';

        const enabledWebPlatforms: string[] = [];
        if (isFbEnabled) enabledWebPlatforms.push('facebook');
        if (isInstaEnabled) enabledWebPlatforms.push('instagram');
        if (isXEnabled) enabledWebPlatforms.push('x');

        // Multi-Platform Continuous Browser Session (Facebook -> Instagram -> X)
        if (enabledWebPlatforms.length >= 2) {
          const platformNamesText = enabledWebPlatforms.map(p => p.toUpperCase()).join(' -> ');
          setCurrentStep(`Launching single Chromium browser session for ${platformNamesText}...`);
          try {
            const multiJob = await triggerMultiCollection(enabledWebPlatforms, {
              query: topicQuery,
              target_posts: Math.min(fbPlatform?.targetItems || 15, 20),
              max_pages: 10,
              comments_per_post: 5,
              posts_per_platform: 5,
              headless: !visibleBrowser,
            }, false);

            if (isFbEnabled) setFbJobResult(multiJob);
            if (isInstaEnabled) setInstaJobResult(multiJob);
            if (isXEnabled) setXJobResult(multiJob);

            await pollJobUntilComplete(multiJob.job_id, (st) => {
              if (st.message) setCurrentStep(`[Continuous Browser Pipeline] ${st.message}`);
            });
          } catch (multiErr) {
            console.warn('Multi-platform continuous browser collection error:', multiErr);
          }
        } else {
          // Individual Platform Fallback
          if (isFbEnabled) {
            setCurrentStep('Starting Facebook live scraping job...');
            try {
              const fbJob = await triggerFacebookCollection({
                query: topicQuery,
                target_posts: Math.min(fbPlatform.targetItems, 20),
                max_pages: 10,
                comments_per_post: 5,
                posts_per_platform: 5,
                headless: !visibleBrowser,
              }, false);
              setFbJobResult(fbJob);

              await pollJobUntilComplete(fbJob.job_id, (st) => {
                if (st.message) setCurrentStep(`[Facebook] ${st.message}`);
              });
            } catch (fbErr) {
              console.warn('Facebook live collection error:', fbErr);
            }
          }

          if (isInstaEnabled) {
            setCurrentStep('Starting Instagram live scraping job...');
            try {
              const instaJob = await triggerInstagramCollection({
                query: topicQuery,
                target_posts: Math.min(instaPlatform.targetItems, 15),
                max_pages: 10,
                comments_per_post: 5,
                posts_per_platform: 5,
                headless: !visibleBrowser,
              }, false);
              setInstaJobResult(instaJob);

              await pollJobUntilComplete(instaJob.job_id, (st) => {
                if (st.message) setCurrentStep(`[Instagram] ${st.message}`);
              });
            } catch (instaErr) {
              console.warn('Instagram live collection error:', instaErr);
            }
          }

          if (isXEnabled) {
            setCurrentStep('Starting X (Twitter) live scraping job...');
            try {
              const xJob = await triggerXCollection({
                query: topicQuery,
                target_posts: Math.min(xPlatform.targetItems, 10),
                max_pages: 10,
                comments_per_post: 5,
                posts_per_platform: 5,
                headless: !visibleBrowser,
              }, false);
              setXJobResult(xJob);

              await pollJobUntilComplete(xJob.job_id, (st) => {
                if (st.message) setCurrentStep(`[X Twitter] ${st.message}`);
              });
            } catch (xErr) {
              console.warn('X live collection error:', xErr);
            }
          }
        }
      }
    } catch (err) {
      setIngestionError(err instanceof Error ? err.message : 'Live collection pipeline failed unexpectedly');
    } finally {
      setCurrentStep('');
      setIsIngesting(false);
    }
  };

  const handleTargetChange = (id: string, newTarget: number) => {
    setPlatforms(prev =>
      prev.map(p => (p.id === id ? { ...p, targetItems: newTarget } : p))
    );
  };

  const handleTogglePlatform = (id: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'disabled' ? 'connected' : 'disabled'
            }
          : p
      )
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Data Collection & Ingestion Setup
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement A • Multi-platform continuous data collection & timeline target configuration
          </p>
        </div>

        <button
          onClick={handleLaunchCollection}
          disabled={isIngesting}
          className="clay-button text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60"
        >
          {isIngesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{currentStep || 'Launching...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Collection Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* Target Item Count Notice (SIH Spec Rule) */}
      <div className="bg-[#3157D5]/10 border border-[#3157D5]/30 p-4 rounded-lg flex items-start gap-3 text-xs text-[#171717]">
        <Info className="w-4 h-4 text-[#3157D5] shrink-0 mt-0.5" />
        <div>
          <span className="font-mono font-bold text-[#3157D5] uppercase tracking-wide block mb-0.5">
            Item-Count Target Architecture
          </span>
          <p className="text-[#171717]/90 leading-relaxed">
            Collection targets refer strictly to <strong>valid unique deduplicated items</strong> collected, not elapsed time. The system will continue incremental fetching until the item-count cap is met or stream expires.
          </p>
        </div>
      </div>

      {/* Ingestion Result Banners */}
      {ingestionResult && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 text-xs ${
          ingestionResult.success
            ? 'bg-[#4C8768]/10 border-[#4C8768]/30'
            : 'bg-[#C15D5D]/10 border-[#C15D5D]/30'
        }`}>
          {ingestionResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-[#4C8768] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C15D5D] shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-mono font-bold text-[#171717] block mb-1">
              YouTube Ingestion Complete — "{ingestionResult.query}"
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono text-[#171717]/80">
              <span>📹 Videos: <strong>{ingestionResult.videosProcessed}</strong></span>
              <span>💬 Comments: <strong>{ingestionResult.commentsCollected}</strong></span>
              <span>💾 Stored: <strong>{ingestionResult.totalEventsStored}</strong></span>
              <span>🔄 Duplicates: <strong>{ingestionResult.duplicatesSkipped}</strong></span>
            </div>
            <span className="text-[10px] text-[#6E6A62] mt-1 block">
              Completed in {ingestionResult.durationMs}ms
            </span>
          </div>
        </div>
      )}

      {/* X Job Banner */}
      {xJobResult && (
        <div className="p-4 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-lg flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1DA1F2] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono font-bold text-[#171717] block mb-0.5">
              🐦 X (Twitter) Live Scraping Finished — Job ID: {xJobResult.job_id}
            </span>
            <p className="text-[11px] text-[#171717]/80">{xJobResult.message}</p>
          </div>
        </div>
      )}

      {/* Facebook Job Banner */}
      {fbJobResult && (
        <div className="p-4 bg-[#1877F2]/10 border border-[#1877F2]/30 rounded-lg flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono font-bold text-[#171717] block mb-0.5">
              📘 Facebook Live Scraping Finished — Job ID: {fbJobResult.job_id}
            </span>
            <p className="text-[11px] text-[#171717]/80">{fbJobResult.message}</p>
          </div>
        </div>
      )}

      {/* Instagram Job Banner */}
      {instaJobResult && (
        <div className="p-4 bg-[#E1306C]/10 border border-[#E1306C]/30 rounded-lg flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#E1306C] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-mono font-bold text-[#171717] block mb-0.5">
              📸 Instagram Live Scraping Finished — Job ID: {instaJobResult.job_id}
            </span>
            <p className="text-[11px] text-[#171717]/80">{instaJobResult.message}</p>
          </div>
        </div>
      )}

      {/* Ingestion Error Banner */}
      {ingestionError && (
        <div className="bg-[#C15D5D]/10 border border-[#C15D5D]/30 p-4 rounded-lg flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-[#C15D5D] shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold text-[#C15D5D] block mb-0.5">Ingestion Error</span>
            <p className="text-[#171717]/80">{ingestionError}</p>
          </div>
        </div>
      )}

      {/* Query & Topic Configuration */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
          <Sliders className="w-5 h-5 text-[#3157D5]" />
          <h2 className="font-heading font-bold text-base text-[#171717]">
            Primary Ingestion Query Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-1">
              Topic / Keywords
            </label>
            <input
              type="text"
              value={topicQuery}
              onChange={e => setTopicQuery(e.target.value)}
              className="w-full bg-[#EAE6DD] text-[#171717] font-sans p-2.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-1">
              Target Hashtags (Comma separated)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              className="w-full bg-[#EAE6DD] text-[#171717] font-sans p-2.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-1">
              Account Mentions / Handles
            </label>
            <input
              type="text"
              value={mentions}
              onChange={e => setMentions(e.target.value)}
              className="w-full bg-[#EAE6DD] text-[#171717] font-sans p-2.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-mono font-semibold uppercase text-[#6E6A62] block mb-1">
              Historical Lookback Time Window
            </label>
            <select
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value)}
              className="w-full bg-[#EAE6DD] text-[#171717] font-sans p-2.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Live Browser Launch Control Toggle */}
        <div className="mt-4 pt-4 border-t border-[#D8D3C8] flex items-center justify-between bg-[#EAE6DD] p-3 rounded-lg">
          <div>
            <span className="font-heading font-bold text-xs text-[#171717] flex items-center gap-1.5">
              🌐 Live Interactive Browser Launch (Headful Mode)
              <span className="bg-[#4C8768]/15 text-[#4C8768] text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                ACTIVE
              </span>
            </span>
            <p className="text-[11px] text-[#6E6A62] mt-0.5">
              Automatically opens a visible browser window (Camoufox / Playwright) on your screen to execute live searching, scrolling, and comment scraping.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={visibleBrowser}
              onChange={e => setVisibleBrowser(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#D8D3C8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3157D5]"></div>
          </label>
        </div>
      </ClayCard>

      {/* Multi-Platform Connector Selection & Item Caps */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#DE775A]" />
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Platform Selection & Target Item-Counts
            </h2>
          </div>
          <span className="text-xs font-mono text-[#6E6A62]">6 Connectors Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`p-4 rounded-lg border transition-all ${
                platform.status !== 'disabled'
                  ? 'bg-[#EAE6DD] border-[#D8D3C8]'
                  : 'bg-[#EAE6DD]/50 border-[#D8D3C8]/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={platform.status !== 'disabled'}
                    onChange={() => handleTogglePlatform(platform.id)}
                    className="w-4 h-4 rounded text-[#3157D5] focus:ring-0"
                  />
                  <PlatformBadge platform={platform.id} size="md" />
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    platform.status === 'connected'
                      ? 'bg-[#4C8768]/15 text-[#4C8768]'
                      : platform.status === 'partially_configured'
                      ? 'bg-[#C18A34]/15 text-[#C18A34]'
                      : 'bg-[#6E6A62]/15 text-[#6E6A62]'
                  }`}
                >
                  {platform.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#6E6A62]">Target Items Cap:</span>
                <input
                  type="number"
                  value={platform.targetItems}
                  onChange={e => handleTargetChange(platform.id, parseInt(e.target.value) || 0)}
                  disabled={platform.status === 'disabled'}
                  className="w-24 bg-[#FDF9F0] font-mono text-right p-1 rounded border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </ClayCard>

      {/* Sampling Strategy Heuristics */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#D8D3C8] pb-3">
          <Layers className="w-5 h-5 text-[#4C8768]" />
          <h2 className="font-heading font-bold text-base text-[#171717]">
            Heuristic Sampling Strategy Weights
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="font-mono text-lg font-bold text-[#3157D5] block">{recentPct}%</span>
            <span className="font-semibold text-[#171717] block mt-1">Recent & Relevant</span>
            <span className="text-[10px] text-[#6E6A62]">Chronological baseline</span>
          </div>

          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="font-mono text-lg font-bold text-[#DE775A] block">{engagementPct}%</span>
            <span className="font-semibold text-[#171717] block mt-1">High Engagement</span>
            <span className="text-[10px] text-[#6E6A62]">Amplified posts</span>
          </div>

          <div className="p-3 bg-[#EAE6DD] rounded-lg">
            <span className="font-mono text-lg font-bold text-[#4C8768] block">{velocityPct}%</span>
            <span className="font-semibold text-[#171717] block mt-1">High Velocity</span>
            <span className="text-[10px] text-[#6E6A62]">Accelerating signals</span>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

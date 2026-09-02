import React, { useState, useEffect } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { MOCK_EVENTS } from '../services/mockData';
import { fetchYouTubeEvents, checkHealth } from '../services/youtubeApi';
import { fetchPythonEvents, checkPythonHealth } from '../services/pythonApi';
import { FileCheck, Search, Filter, ExternalLink, Code2, Loader2, Play, RefreshCw } from 'lucide-react';
import { CanonicalSocialEvent } from '../types';

export const EvidenceVaultPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CanonicalSocialEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all'); // 'all', 'latest', 'past_24h', 'earlier'
  const [dataOriginFilter, setDataOriginFilter] = useState<string>('all'); // 'all', 'live_only', 'demo_only'

  // Backend events
  const [youtubeEvents, setYoutubeEvents] = useState<CanonicalSocialEvent[]>([]);
  const [pythonEvents, setPythonEvents] = useState<CanonicalSocialEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [pythonOnline, setPythonOnline] = useState(false);
  const [totalYoutubeEvents, setTotalYoutubeEvents] = useState(0);

  // Check backend health and load events on mount
  useEffect(() => {
    const init = async () => {
      const online = await checkHealth();
      const pyOnline = await checkPythonHealth();
      setBackendOnline(online);
      setPythonOnline(pyOnline);
      await loadEvents();
    };
    init();
  }, []);

  const loadEvents = async (query?: string) => {
    setIsLoading(true);
    try {
      try {
        const response = await fetchYouTubeEvents({ limit: 5000, q: query });
        setYoutubeEvents(response.events);
        setTotalYoutubeEvents(response.total);
      } catch (ytErr) {
        console.warn('YouTube backend not reachable:', ytErr);
      }

      try {
        const pyRes = await fetchPythonEvents({ limit: 5000 });
        setPythonEvents(pyRes.events);
      } catch (pyErr) {
        console.warn('Python backend not reachable:', pyErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspect = (event: CanonicalSocialEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const realLiveEvents = [...youtubeEvents, ...pythonEvents];
  const allEvents =
    dataOriginFilter === 'live_only'
      ? realLiveEvents
      : dataOriginFilter === 'demo_only'
      ? MOCK_EVENTS
      : [...realLiveEvents, ...MOCK_EVENTS];

  const totalItems = allEvents.length;

  // Apply filters safely
  const term = searchTerm.trim().toLowerCase();
  const now = Date.now();
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const filteredEvents = allEvents.filter(e => {
    const text = (e.content?.text || '').toLowerCase();
    const username = (e.author?.username || '').toLowerCase();
    const displayName = (e.author?.display_name || '').toLowerCase();
    const eventId = (e.event_id || '').toLowerCase();
    const hashtags = (e.content?.hashtags || []).join(' ').toLowerCase();

    const matchesSearch =
      term === '' ||
      text.includes(term) ||
      username.includes(term) ||
      displayName.includes(term) ||
      eventId.includes(term) ||
      hashtags.includes(term);

    const matchesPlatform =
      platformFilter === 'all' || e.platform === platformFilter;

    // Timeframe Filter
    let matchesTimeframe = true;
    const createdAtTime = e.timestamps?.created_at
      ? new Date(e.timestamps.created_at).getTime()
      : 0;

    if (timeframeFilter === 'latest') {
      matchesTimeframe = createdAtTime >= twoHoursAgo || !createdAtTime;
    } else if (timeframeFilter === 'past_24h') {
      matchesTimeframe = createdAtTime >= twentyFourHoursAgo;
    } else if (timeframeFilter === 'earlier') {
      matchesTimeframe = createdAtTime > 0 && createdAtTime < twentyFourHoursAgo;
    }

    return matchesSearch && matchesPlatform && matchesTimeframe;
  });

  // Sort descending: newest / most recently ingested items FIRST at the top of Evidence Vault
  const getEventTimestamp = (e: CanonicalSocialEvent) => {
    const ts = e.timestamps?.collected_at || e.timestamps?.created_at;
    if (!ts) return 0;
    const time = new Date(ts).getTime();
    return isNaN(time) ? 0 : time;
  };
  filteredEvents.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Evidence Vault & Canonical Record Inspector
          </h1>
          <p className="text-xs text-[#6E6A62]">
            Multi-platform live ingestion audit trail & canonical records inspector
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full ${
            backendOnline || pythonOnline
              ? 'bg-[#4C8768]/15 text-[#4C8768]'
              : 'bg-[#C15D5D]/15 text-[#C15D5D]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendOnline || pythonOnline ? 'bg-[#4C8768] animate-pulse' : 'bg-[#C15D5D]'}`} />
            {backendOnline || pythonOnline ? 'Collector API Live' : 'Backend Offline'}
          </div>

          <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] px-3 py-1 text-xs font-bold">
            {realLiveEvents.length} Real Live Scraped Events
          </span>
        </div>
      </div>

      {/* Live Data Summary Banner */}
      <div className="bg-[#3157D5]/10 border border-[#3157D5]/30 p-3.5 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Play className="w-4 h-4 text-[#3157D5] shrink-0" />
          <span className="text-[#171717]">
            Showing <strong>{filteredEvents.length}</strong> records (Live Scraped: <strong>{realLiveEvents.length}</strong> | Demo Mock: <strong>{MOCK_EVENTS.length}</strong>).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDataOriginFilter(prev => prev === 'live_only' ? 'all' : 'live_only')}
            className={`text-xs py-1 px-3 rounded font-mono font-bold transition-all ${
              dataOriginFilter === 'live_only'
                ? 'bg-[#3157D5] text-white'
                : 'clay-button-secondary'
            }`}
          >
            {dataOriginFilter === 'live_only' ? '✓ Showing Live Only' : '⚡ Show Live Scraped Only'}
          </button>
          <button
            onClick={() => loadEvents()}
            disabled={isLoading}
            className="clay-button-secondary text-xs py-1 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Multi-Level Filter Bar */}
      <ClayCard className="p-4 bg-[#FDF9F0] space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by topic keyword, author @handle, post text, event ID..."
              className="w-full bg-[#EAE6DD] text-xs font-sans pl-9 pr-4 py-2 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
            />
          </div>

          {/* Platform Filter Dropdown */}
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="bg-[#EAE6DD] text-xs font-mono px-3 py-2 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
          >
            <option value="all">🌐 All Platforms</option>
            <option value="youtube">🎬 YouTube</option>
            <option value="x">🐦 X (Twitter)</option>
            <option value="facebook">📘 Facebook</option>
            <option value="instagram">📸 Instagram</option>
            <option value="telegram">📨 Telegram</option>
            <option value="reddit">📋 Reddit</option>
          </select>
        </div>

        {/* Timeframe & Data Origin Filter Dropdowns */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#D8D3C8]/60 text-xs">
          <span className="font-mono text-[#6E6A62] font-semibold">Filter Ingestion Batch:</span>

          {/* Timeframe Dropdown */}
          <select
            value={timeframeFilter}
            onChange={e => setTimeframeFilter(e.target.value)}
            className="bg-[#EAE6DD] text-xs font-mono px-3 py-1.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
          >
            <option value="all">🕒 All Historical Sessions</option>
            <option value="latest">⚡ Latest Ingestion Run (Recent)</option>
            <option value="past_24h">📅 Past 24 Hours Data</option>
            <option value="earlier">📁 Earlier Historical Runs</option>
          </select>

          {/* Data Origin Dropdown */}
          <select
            value={dataOriginFilter}
            onChange={e => setDataOriginFilter(e.target.value)}
            className="bg-[#EAE6DD] text-xs font-mono px-3 py-1.5 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
          >
            <option value="all">📊 All Records (Live + Demo Mock)</option>
            <option value="live_only">⚡ Live Scraped Real Data Only</option>
            <option value="demo_only">🧪 Hardcoded Demo Data Only</option>
          </select>

          {(searchTerm || platformFilter !== 'all' || timeframeFilter !== 'all' || dataOriginFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPlatformFilter('all');
                setTimeframeFilter('all');
                setDataOriginFilter('all');
              }}
              className="text-xs font-mono text-[#C15D5D] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </ClayCard>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-[#6E6A62]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-mono">Loading YouTube events from backend...</span>
        </div>
      )}

      {/* Social Event Records */}
      <div className="space-y-3">
        {filteredEvents.length === 0 && !isLoading && (
          <ClayCard className="p-8 bg-[#FDF9F0] text-center space-y-3">
            <p className="text-sm font-semibold text-[#171717]">
              No events found matching <span className="font-mono text-[#3157D5]">"{searchTerm}"</span>
              {platformFilter !== 'all' && <span> under <span className="font-mono uppercase">{platformFilter}</span> filter</span>}
            </p>
            <p className="text-xs text-[#6E6A62]">
              The searched keywords do not match any stored records. You can clear the search bar or run a new collection query on the <strong>Collection Setup</strong> page.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { setSearchTerm(''); setPlatformFilter('all'); }}
                className="clay-button-secondary text-xs px-4 py-2"
              >
                Clear Search & Filters
              </button>
            </div>
          </ClayCard>
        )}

        {filteredEvents.map(event => (
          <ClayCard key={event.event_id} className={`p-5 bg-[#FDF9F0] border-2 ${
            event.platform === 'youtube'
              ? 'border-[#FF0000]/30'
              : 'border-[#D8D3C8]'
          }`}>
            <div className="flex items-center justify-between mb-3 border-b border-[#D8D3C8] pb-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={event.platform} />
                <span className="font-mono text-xs text-[#6E6A62]">ID: {event.event_id}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                  event.event_type === 'post'
                    ? 'bg-[#3157D5]/15 text-[#3157D5]'
                    : event.event_type === 'comment'
                    ? 'bg-[#DE775A]/15 text-[#DE775A]'
                    : 'bg-[#4C8768]/15 text-[#4C8768]'
                }`}>
                  {event.event_type}
                </span>
                {event.source?.collector === 'youtube_data_api_v3' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-[#FF0000]/10 text-[#FF0000]">
                    LIVE DATA
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge score={event.analysis?.sentiment?.score ?? 0.8} />
                <span className="font-mono text-xs text-[#6E6A62]">
                  {event.timestamps?.created_at ? new Date(event.timestamps.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-[#171717] mb-3 leading-relaxed font-sans line-clamp-3">
              "{event.content?.text || ''}"
            </p>

            {/* Engagement Metrics Row */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-[#6E6A62] mb-3">
              {event.engagement?.views !== undefined && (event.engagement?.views ?? 0) > 0 && (
                <span>👁 {event.engagement.views.toLocaleString()} views</span>
              )}
              {(event.engagement?.likes ?? 0) > 0 && (
                <span>❤️ {event.engagement.likes.toLocaleString()} likes</span>
              )}
              {(event.engagement?.comments ?? 0) > 0 && (
                <span>💬 {event.engagement.comments.toLocaleString()} comments</span>
              )}
              {(event.engagement?.shares ?? 0) > 0 && (
                <span>🔗 {event.engagement.shares.toLocaleString()} shares</span>
              )}
              {(event.content?.hashtags?.length ?? 0) > 0 && (
                <span>🏷️ {event.content.hashtags.length} tags</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D8D3C8]/60">
              <span className="font-mono text-[#6E6A62]">
                Author: <strong className="text-[#171717]">@{event.author?.username === event.author?.user_id ? (event.author?.display_name || 'Anonymous') : (event.author?.username || 'unknown')}</strong> ({event.author?.display_name || 'Anonymous'})
              </span>
              <div className="flex items-center gap-2">
                {event.source.url && (
                  <a
                    href={event.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-button-secondary text-xs py-1 px-3 flex items-center gap-1.5 no-underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#3157D5]" /> View Source
                  </a>
                )}
                <button
                  onClick={() => handleInspect(event)}
                  className="clay-button-secondary text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#3157D5]" /> Inspect JSON
                </button>
              </div>
            </div>
          </ClayCard>
        ))}
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

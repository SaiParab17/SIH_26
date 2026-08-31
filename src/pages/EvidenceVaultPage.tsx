import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { MOCK_EVENTS } from '../services/mockData';
import { FileCheck, Search, Filter, ExternalLink, Code2 } from 'lucide-react';
import { CanonicalSocialEvent } from '../types';

export const EvidenceVaultPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CanonicalSocialEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInspect = (event: CanonicalSocialEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const filteredEvents = MOCK_EVENTS.filter(
    e =>
      e.content.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.author.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.event_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Evidence Vault & Canonical Record Inspector
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement G • Audit trail, raw event provenance, and model grounding pointers
          </p>
        </div>
        <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] px-3 py-1 text-xs">
          182,430 Verified Items Indexed
        </span>
      </div>

      {/* Search & Filter Bar */}
      <ClayCard className="p-4 bg-[#FDF9F0] flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search event ID, text keywords, author username..."
            className="w-full bg-[#EAE6DD] text-xs font-sans pl-9 pr-4 py-2 rounded-md border border-[#D8D3C8] focus:border-[#3157D5] focus:outline-none"
          />
        </div>
        <button className="clay-button-secondary text-xs px-3.5 py-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter by Platform
        </button>
      </ClayCard>

      {/* Social Event Records Table */}
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <ClayCard key={event.event_id} className="p-5 bg-[#FDF9F0] border-2 border-[#D8D3C8]">
            <div className="flex items-center justify-between mb-3 border-b border-[#D8D3C8] pb-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={event.platform} />
                <span className="font-mono text-xs text-[#6E6A62]">ID: {event.event_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge score={event.analysis.sentiment.score} />
                <span className="font-mono text-xs text-[#6E6A62]">{event.timestamps.created_at}</span>
              </div>
            </div>

            <p className="text-sm font-medium text-[#171717] mb-3 leading-relaxed font-sans">
              "{event.content.text}"
            </p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D8D3C8]/60">
              <span className="font-mono text-[#6E6A62]">
                Author: <strong className="text-[#171717]">@{event.author.username}</strong> ({event.author.display_name})
              </span>
              <button
                onClick={() => handleInspect(event)}
                className="clay-button-secondary text-xs py-1 px-3 flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5 text-[#3157D5]" /> Inspect Provenance & JSON
              </button>
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

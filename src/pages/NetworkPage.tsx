import React, { useState } from 'react';
import { ClayCard } from '../components/ui/ClayCard';
import { ConfidenceBadge } from '../components/ui/ConfidenceBadge';
import { MOCK_NETWORK_NODES, MOCK_COMMUNITIES, MOCK_PROPAGATION } from '../services/mockData';
import { Share2, Users, Network, Clock, ArrowRight, ShieldCheck, Play, ChevronRight } from 'lucide-react';
import { NetworkNode } from '../types';

export const NetworkPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(MOCK_NETWORK_NODES[0]);
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#171717]">
            Link Analysis, Network Topology & Information Propagation
          </h1>
          <p className="text-xs text-[#6E6A62]">
            SIH Requirement E • Graph topology, PageRank, Louvain modularity communities & temporal flow
          </p>
        </div>
        <span className="badge-mono bg-[#EAE6DD] text-[#3157D5] px-3 py-1 text-xs">
          Graph Modularity: 0.68 (3 Communities)
        </span>
      </div>

      {/* Primary Split: Interactive Topology Preview & Community Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Topology Visualizer Canvas */}
        <ClayCard className="lg:col-span-2 p-6 bg-[#FDF9F0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-[#3157D5]" />
              <h2 className="font-heading font-bold text-base text-[#171717]">
                Community Topology Graph (Louvain Clusters)
              </h2>
            </div>
            <span className="badge-mono bg-[#EAE6DD] text-[#3157D5]">Interactive Graph</span>
          </div>

          {/* Canvas Render Simulation */}
          <div className="h-80 bg-[#171717] rounded-xl relative overflow-hidden p-6 flex items-center justify-center border border-[#D8D3C8]">
            {/* Visual Node Representations */}
            <div className="absolute inset-0 flex items-center justify-center opacity-90">
              <svg className="w-full h-full">
                {/* Connecting Edges */}
                <line x1="200" y1="120" x2="380" y2="180" stroke="#3157D5" strokeWidth="2" strokeDasharray="4" />
                <line x1="380" y1="180" x2="520" y2="100" stroke="#DE775A" strokeWidth="2" />
                <line x1="200" y1="120" x2="520" y2="100" stroke="#4C8768" strokeWidth="1.5" />
              </svg>

              {/* Node 1 */}
              <div
                onClick={() => setSelectedNode(MOCK_NETWORK_NODES[0])}
                className="absolute left-1/4 top-1/3 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-[#3157D5] text-white font-mono text-xs font-bold border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
              >
                @tech_analyst_raj
              </div>

              {/* Node 2 */}
              <div
                onClick={() => setSelectedNode(MOCK_NETWORK_NODES[2])}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-[#DE775A] text-white font-mono text-xs font-bold border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
              >
                @open_agent_dev
              </div>

              {/* Node 3 */}
              <div
                onClick={() => setSelectedNode(MOCK_NETWORK_NODES[4])}
                className="absolute right-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-[#4C8768] text-white font-mono text-xs font-bold border-4 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
              >
                @privacy_watch_in
              </div>
            </div>

            <div className="absolute bottom-3 left-3 bg-[#171717]/80 backdrop-blur-xs p-2 rounded text-[11px] font-mono text-white/80 space-x-3">
              <span className="text-[#3157D5]">● Policy Lab</span>
              <span className="text-[#DE775A]">● Dev Guild</span>
              <span className="text-[#4C8768]">● Privacy Advocates</span>
            </div>
          </div>

          <span className="text-[11px] text-[#6E6A62] mt-3 block">
            Click nodes to inspect centrality metrics, PageRank scores, and cross-community reach.
          </span>
        </ClayCard>

        {/* Node Centrality Metrics Inspector */}
        {selectedNode && (
          <ClayCard className="p-6 bg-[#FDF9F0] border-2 border-[#3157D5]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="badge-mono bg-[#3157D5]/10 text-[#3157D5] border border-[#3157D5]/30 capitalize">
                  {selectedNode.role.replace(/_/g, ' ')}
                </span>
                <ConfidenceBadge score={selectedNode.influenceScore} showIcon={false} />
              </div>

              <h2 className="font-heading font-bold text-xl text-[#171717] mb-1">
                @{selectedNode.username}
              </h2>
              <span className="text-xs text-[#6E6A62] block mb-4">{selectedNode.name}</span>

              <div className="space-y-3 font-mono text-xs mb-6">
                <div className="p-2.5 bg-[#EAE6DD] rounded flex justify-between">
                  <span className="text-[#6E6A62]">Influence Score:</span>
                  <span className="font-bold text-[#171717]">{selectedNode.influenceScore}</span>
                </div>
                <div className="p-2.5 bg-[#EAE6DD] rounded flex justify-between">
                  <span className="text-[#6E6A62]">PageRank Centrality:</span>
                  <span className="font-bold text-[#3157D5]">{selectedNode.pageRank}</span>
                </div>
                <div className="p-2.5 bg-[#EAE6DD] rounded flex justify-between">
                  <span className="text-[#6E6A62]">Betweenness Score:</span>
                  <span className="font-bold text-[#DE775A]">{selectedNode.betweenness}</span>
                </div>
                <div className="p-2.5 bg-[#EAE6DD] rounded flex justify-between">
                  <span className="text-[#6E6A62]">Estimated Reach:</span>
                  <span className="font-bold text-[#171717]">{selectedNode.reach.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#EAE6DD] rounded-lg text-xs font-mono">
              <span className="text-[#6E6A62] block">Community Association:</span>
              <span className="font-bold text-[#171717]">{selectedNode.communityName}</span>
            </div>
          </ClayCard>
        )}
      </div>

      {/* Temporal Information Propagation Player */}
      <ClayCard className="p-6 bg-[#FDF9F0]">
        <div className="flex items-center justify-between mb-4 border-b border-[#D8D3C8] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#DE775A]" />
            <h2 className="font-heading font-bold text-base text-[#171717]">
              Temporal Information Propagation Flow
            </h2>
          </div>
          <span className="badge-mono bg-[#EAE6DD] text-[#DE775A]">Sequential Path</span>
        </div>

        <div className="space-y-4">
          {MOCK_PROPAGATION.map((step) => (
            <div
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeStep === step.step
                  ? 'bg-[#EAE6DD] border-[#DE775A] ring-2 ring-[#DE775A]/20'
                  : 'bg-[#FDF9F0] border-[#D8D3C8] hover:bg-[#EAE6DD]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-[#DE775A] text-white px-2 py-0.5 rounded font-bold">
                    Step {step.step}
                  </span>
                  <span className="text-[#6E6A62]">{step.timestamp}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-[#DE775A] bg-[#DE775A]/10 px-2 py-0.5 rounded">
                  Lag: +{step.timeLagMinutes} mins
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm font-heading font-bold text-[#171717] mb-2">
                <span>{step.fromCommunity}</span>
                <ChevronRight className="w-4 h-4 text-[#DE775A]" />
                <span>{step.toCommunity}</span>
              </div>

              <p className="text-xs text-[#6E6A62] font-sans italic bg-[#FDF9F0] p-2.5 rounded border border-[#D8D3C8]">
                "{step.keyPostSnippet}"
              </p>
            </div>
          ))}
        </div>
      </ClayCard>
    </div>
  );
};

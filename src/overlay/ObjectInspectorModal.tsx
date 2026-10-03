import React from 'react';
import { X, ArrowUpRight, TrendingUp, Sparkles, BarChart2 } from 'lucide-react';
import { ContentObject, CompetitorData, ClusterTheme } from '../types';

interface ObjectInspectorModalProps {
  selectedObject: ContentObject | null;
  selectedCompetitor: CompetitorData | null;
  selectedCluster: ClusterTheme | null;
  onClose: () => void;
  onOpenWorkspaces: () => void;
}

export const ObjectInspectorModal: React.FC<ObjectInspectorModalProps> = ({
  selectedObject,
  selectedCompetitor,
  selectedCluster,
  onClose,
  onOpenWorkspaces
}) => {
  if (!selectedObject && !selectedCompetitor && !selectedCluster) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 max-w-sm w-full glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 animate-fade-in text-paper select-text">
      {/* Header with Close */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2 text-xs font-mono-code text-signal-orange">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">
            {selectedCompetitor
              ? 'Competitor Telemetry'
              : selectedCluster
              ? 'Topic Cluster Analysis'
              : 'Content Node Inspector'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Competitor Content */}
      {selectedCompetitor && (
        <div className="space-y-3">
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold font-display">{selectedCompetitor.name}</h3>
              <span className="text-xs font-mono-code text-signal-emerald uppercase px-2 py-0.5 rounded bg-signal-emerald/10 border border-signal-emerald/20">
                {selectedCompetitor.status}
              </span>
            </div>
            <p className="text-xs font-mono-code text-muted">{selectedCompetitor.handle}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-ink-900 border border-white/5 space-y-1.5">
            <div className="text-[11px] font-mono-code text-muted uppercase">Recent Movement</div>
            <p className="text-xs text-paper/90 leading-relaxed font-sans">{selectedCompetitor.recentChange}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
            <div className="p-2 rounded bg-ink-900 border border-white/5">
              <span className="text-[10px] text-muted block">VELOCITY</span>
              <span className="text-signal-orange font-semibold">{selectedCompetitor.velocityChange}</span>
            </div>
            <div className="p-2 rounded bg-ink-900 border border-white/5">
              <span className="text-[10px] text-muted block">OBSERVED POSTS</span>
              <span className="text-paper font-semibold">{selectedCompetitor.observedPosts}</span>
            </div>
          </div>

          <div className="text-xs font-mono-code text-muted">
            <span className="block mb-1 text-[10px] uppercase">Active Formats:</span>
            <div className="flex flex-wrap gap-1">
              {selectedCompetitor.formats.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-ink-900 border border-white/10 text-paper/80 text-[10px]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenWorkspaces}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-signal-orange/15 border border-signal-orange/40 text-signal-orange text-xs font-semibold hover:bg-signal-orange hover:text-white transition-colors"
          >
            <span>Open in Competitor Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cluster Content */}
      {selectedCluster && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold font-display">{selectedCluster.name}</h3>
            {selectedCluster.isOpportunity && (
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-signal-orange/20 text-signal-orange border border-signal-orange/30">
                White Space Gap
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono-code">
            <div className="p-2.5 rounded bg-ink-900 border border-white/5 space-y-1">
              <div className="flex justify-between text-muted text-[10px]">
                <span>CATEGORY SHARE</span>
                <span className="text-paper font-semibold">{selectedCluster.marketShare}%</span>
              </div>
              <div className="w-full h-1.5 bg-ink-800 rounded-full overflow-hidden">
                <div className="h-full bg-signal-orange" style={{ width: `${selectedCluster.marketShare}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded bg-ink-900 border border-white/5 space-y-1">
              <div className="flex justify-between text-muted text-[10px]">
                <span>YOUR BRAND SHARE</span>
                <span className="text-paper font-semibold">{selectedCluster.brandShare}%</span>
              </div>
              <div className="w-full h-1.5 bg-ink-800 rounded-full overflow-hidden">
                <div className="h-full bg-signal-emerald" style={{ width: `${selectedCluster.brandShare}%` }} />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-signal-orange/10 border border-signal-orange/20">
            <div className="text-[10px] font-mono-code text-signal-orange uppercase flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              Strategic Opportunity
            </div>
            <p className="text-xs text-paper/90 mt-1">
              The category is heavily invested here, while your brand is currently under-indexing by {(selectedCluster.marketShare - selectedCluster.brandShare)}%.
            </p>
          </div>

          <button
            onClick={onOpenWorkspaces}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-paper text-ink-950 text-xs font-semibold hover:bg-signal-orange hover:text-white transition-colors"
          >
            <span>Generate Strategy in Autopilot</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content Node */}
      {selectedObject && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-ink-900 border border-white/10 text-signal-orange">
              {selectedObject.format}
            </span>
            <span className="text-xs font-mono-code text-muted">Cluster: {selectedObject.cluster}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono-code text-muted uppercase block mb-1">Hook / Headline</span>
            <p className="text-sm font-semibold font-serif italic text-paper leading-snug">
              “{selectedObject.hook}”
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
            <div className="p-2 rounded bg-ink-900 border border-white/5">
              <span className="text-[10px] text-muted block">ENGAGEMENT INDEX</span>
              <span className="text-signal-emerald font-semibold">{selectedObject.engagement} / 200</span>
            </div>
            <div className="p-2 rounded bg-ink-900 border border-white/5">
              <span className="text-[10px] text-muted block">VELOCITY COEFFICIENT</span>
              <span className="text-signal-orange font-semibold">{selectedObject.velocity}x</span>
            </div>
          </div>

          <button
            onClick={onOpenWorkspaces}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-ink-900 border border-white/10 text-paper text-xs font-semibold hover:border-signal-orange/60 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5 text-signal-orange" />
            <span>Dissect Creative DNA</span>
          </button>
        </div>
      )}
    </div>
  );
};

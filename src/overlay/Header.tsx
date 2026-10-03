import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown, Database } from 'lucide-react';

interface HeaderProps {
  currentSceneTitle: string;
  currentSceneNumber: string;
  scrollProgress: number;
  onOpenWorkspaces: () => void;
  onJumpToProgress: (target: number) => void;
  backendOnline: boolean;
  onCheckBackend: () => void;
}

const JOURNEY_STEPS = [
  { p: 0, label: '01 · Choose a client' },
  { p: 0.695, label: '02 · Find an opportunity' },
  { p: 0.835, label: '03 · Plan a campaign' },
  { p: 0.965, label: '04 · Review results' },
];

export const Header: React.FC<HeaderProps> = ({
  currentSceneTitle,
  currentSceneNumber,
  scrollProgress,
  onOpenWorkspaces,
  onJumpToProgress,
  backendOnline,
  onCheckBackend
}) => {
  const [showJourney, setShowJourney] = useState(false);
  const pct = Math.round(scrollProgress * 100);
  const currentStepIndex = JOURNEY_STEPS.reduce((active, step, index) => scrollProgress >= step.p ? index : active, 0);

  return (
    <>
      <span className="sr-only" aria-live="polite">Part {currentSceneNumber}: {currentSceneTitle}</span>
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-ink-800/60 z-50 pointer-events-none">
        <div
          className="h-full bg-signal-orange transition-all duration-75 ease-linear"
          style={{ width: `${pct}%`, boxShadow: '0 0 10px 1px rgba(200,168,115,0.7)' }}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3.5 pointer-events-none">
        <button
          onClick={() => onJumpToProgress(0)}
          className="group flex items-center gap-2.5 pointer-events-auto focus:outline-none"
          aria-label="Return to the beginning"
        >
          <div className="relative w-8 h-8 rounded-lg bg-ink-900 border border-white/10 flex items-center justify-center font-bold text-sm text-signal-orange transition-all group-hover:border-signal-orange/50 group-hover:shadow-[0_0_12px_rgba(200,168,115,0.3)]">
            S.
          </div>
          <div className="hidden sm:block leading-none text-left">
            <span className="font-display font-semibold text-[13px] text-paper tracking-tight block">SYNTARA</span>
            <span className="text-[9px] font-mono-code uppercase text-muted tracking-widest">agency workspace</span>
          </div>
        </button>

        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={onCheckBackend}
            title={backendOnline ? 'Local workspace connected' : 'Check local workspace connection'}
            aria-label={backendOnline ? 'Local workspace connected' : 'Check local workspace connection'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-panel text-[10px] font-mono-code border transition-all ${backendOnline ? 'text-emerald-300 border-emerald-400/25' : 'text-muted border-white/10 hover:text-paper'}`}
          >
            <Database className="w-3 h-3" />
            {backendOnline ? 'SAVED' : 'RETRY'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowJourney((open) => !open)}
              aria-expanded={showJourney}
              aria-label="Open journey navigation"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-[11px] font-mono-code text-muted hover:text-paper border border-transparent hover:border-white/15 transition-all"
            >
              <span className="text-signal-orange">{String(currentStepIndex + 1).padStart(2, '0')} / 04</span>
              <span>Journey</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showJourney && (
              <div className="absolute top-full right-0 mt-2 w-56 glass-panel rounded-xl border border-white/10 py-1.5 z-50 animate-fade-in shadow-2xl">
                {JOURNEY_STEPS.map((step, index) => (
                  <button
                    key={step.p}
                    onClick={() => {
                      onJumpToProgress(step.p);
                      setShowJourney(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-mono-code text-left transition-colors hover:bg-white/5 ${index === currentStepIndex ? 'text-paper' : 'text-muted'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${index <= currentStepIndex ? 'bg-signal-orange' : 'bg-white/20'}`} />
                    {step.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenWorkspaces}
            className="hidden sm:flex items-center px-3 py-1.5 rounded-full glass-panel text-[11px] font-mono-code text-muted hover:text-paper border border-transparent hover:border-white/15 transition-all"
          >
            Get started
          </button>

          <a
            href="agency.html"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-paper text-ink-950 text-xs font-semibold font-display hover:bg-signal-orange hover:text-white transition-all shadow-sm"
          >
            <span>Client portfolio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>
    </>
  );
};

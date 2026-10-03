import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Activity } from 'lucide-react';
import { audioSystem } from '../audio';

interface PreloaderProps {
  onEnter: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onEnter }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing market telemetry...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stages = [
      { p: 25, label: 'Connecting to category post streams...' },
      { p: 55, label: 'Mapping competitor velocity clusters...' },
      { p: 80, label: 'Calibrating white space spatial coordinates...' },
      { p: 100, label: 'Market intelligence universe ready.' }
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setIsReady(true);
          setStage('Market intelligence universe ready.');
          return 100;
        }
        const match = stages.find(s => next <= s.p);
        if (match) setStage(match.label);
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    audioSystem.playPulse();
    onEnter();
  };

  return (
    <div
      onClick={() => {
        handleStart();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950 px-6 select-none cursor-pointer"
    >
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-signal-orange/5 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 flex flex-col items-center text-center pointer-events-auto">
        {/* Brand Mark */}
        <div className="w-16 h-16 rounded-2xl bg-ink-900 border border-white/10 flex items-center justify-center text-2xl font-bold text-signal-orange mb-6 shadow-2xl relative group">
          <div className="absolute -inset-1 rounded-2xl bg-signal-orange/20 blur opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 font-display">f.</span>
        </div>

        {/* Title */}
        <h2 className="font-display font-semibold text-xs tracking-[0.25em] uppercase text-signal-orange mb-2 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>SYNTARA INTELLIGENCE ENGINE</span>
        </h2>

        <h1 className="font-serif italic text-3xl sm:text-4xl text-paper font-normal mb-6">
          The market never stops moving.
        </h1>

        {/* Dynamic Progress or Enter Button */}
        {!isReady ? (
          <div className="w-full space-y-3">
            <div className="w-full h-1 bg-ink-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-signal-orange transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono-code text-muted">
              <span className="truncate pr-2">{stage}</span>
              <span className="font-semibold text-paper">{progress}%</span>
            </div>
            <div className="text-[10px] font-mono-code text-signal-orange/70">
              [ Click anywhere to enter directly ]
            </div>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-paper text-ink-950 font-medium text-sm hover:bg-signal-orange hover:text-white transition-all duration-300 shadow-xl hover:shadow-[0_0_24px_rgba(200,168,115,0.4)]"
          >
            <Sparkles className="w-4 h-4 text-signal-orange group-hover:text-white transition-colors" />
            <span className="tracking-wide uppercase font-mono-code font-semibold text-xs">
              ENTER THE MARKET
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Telemetry Footer */}
        <div className="mt-12 text-[10px] tracking-widest uppercase font-mono-code text-muted/60">
          Continuous 3D Narrative Universe · Scroll To Drive
        </div>
      </div>
    </div>
  );
};

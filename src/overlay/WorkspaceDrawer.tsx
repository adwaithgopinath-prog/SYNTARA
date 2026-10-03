import React from 'react';
import { X, ArrowUpRight, Compass, Layers, LineChart, ShieldCheck, Wand2 } from 'lucide-react';

interface WorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const START_HERE = [
  {
    step: '01',
    name: 'Choose a client',
    href: 'agency.html',
    desc: 'Add an account, its business goal, and the person who owns it.',
    icon: Compass,
    note: 'PORTFOLIO'
  },
  {
    step: '02',
    name: 'Plan a campaign',
    href: 'campaigns.html#campaign-planner',
    desc: 'Create a draft and send it for your team to review.',
    icon: Wand2,
    note: 'DRAFT ONLY'
  },
  {
    step: '03',
    name: 'Prepare a client review',
    href: 'performance.html#performance-learning',
    desc: 'Log outcomes against the client and see the account’s saved work.',
    icon: LineChart,
    note: 'CLIENT RESULTS'
  }
];

export const WorkspaceDrawer: React.FC<WorkspaceDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in select-text">
      <div className="w-full max-w-md h-full bg-ink-950 border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono-code text-signal-orange uppercase tracking-wider block">
                SYNTARA
              </span>
              <h2 className="text-xl font-bold font-display text-paper">Choose your next step</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close start menu"
              className="p-1.5 rounded-lg text-muted hover:text-paper hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted mt-3 mb-6 font-sans">
            Start with a client account. Keep the plan and outcome tied to that client.
          </p>

          <div className="space-y-3">
            {START_HERE.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="group block p-4 rounded-xl glass-panel border border-white/5 hover:border-signal-orange/40 hover:bg-ink-900 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-ink-900 border border-white/10 flex items-center justify-center text-signal-orange group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm text-paper group-hover:text-signal-orange transition-colors">
                        <span className="mr-2 text-[10px] font-mono-code text-muted">{item.step}</span>
                        {item.name}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-signal-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted leading-relaxed font-sans pl-10">
                    {item.desc}
                  </p>
                  <span className="block pl-10 mt-2 text-[9px] font-mono-code tracking-wider text-signal-orange/80">{item.note}</span>
                </a>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="block mb-3 text-[10px] font-mono-code text-muted uppercase tracking-wider">More tools</span>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs">
              <a className="flex items-center gap-1.5 text-paper/75 hover:text-paper" href="intelligence.html"><Layers className="w-3.5 h-3.5 text-signal-orange" /> Market signals</a>
              <a className="flex items-center gap-1.5 text-paper/75 hover:text-paper" href="studio.html#creative-studio"><Wand2 className="w-3.5 h-3.5 text-signal-orange" /> Creative studio</a>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/10 mt-6">
          <div className="flex items-start gap-2 text-xs font-mono-code text-muted leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-signal-emerald shrink-0" />
            <span>Sample information is clearly labeled. Nothing publishes without your say-so.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

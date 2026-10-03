import React from 'react';
import {
  ArrowDown, ArrowUpRight, Sparkles, AlertCircle,
  Compass, TrendingUp, Activity, Layers, Zap,
  BarChart2, RefreshCcw, Eye
} from 'lucide-react';

interface SceneOverlaysProps {
  progress: number;
  onOpenWorkspaces: () => void;
  onSelectCompetitorByName: (name: string) => void;
}

interface SceneProps {
  start: number;
  end: number;
  progress: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
  className?: string;
  anchor?: 'center' | 'left' | 'right';
  framed?: boolean;
}

function ScenePanel({
  start, end, progress, fadeIn = 0.004, fadeOut = 0.004,
  children, className = '', anchor = 'center', framed = true
}: SceneProps) {
  if (progress < start - fadeIn || progress > end + fadeOut) return null;

  let opacity = 1;
  if (progress < start) {
    opacity = Math.max(0, (progress - (start - fadeIn)) / fadeIn);
  } else if (progress > end) {
    opacity = Math.max(0, 1 - (progress - end) / fadeOut);
  }

  const translateY = (1 - opacity) * 20;

  const anchorClass =
    anchor === 'left'  ? 'items-start pl-4 sm:pl-8 md:pl-16 lg:pl-24' :
    anchor === 'right' ? 'items-end  pr-4 sm:pr-8 md:pr-16 lg:pr-24' :
                         'items-center';
  const sceneMark = String(Math.round(start * 100)).padStart(2, '0');
  const sceneIndex = [0, 0.068, 0.14, 0.215, 0.30, 0.38, 0.46, 0.545, 0.625, 0.695, 0.770, 0.835, 0.89, 0.935, 0.965, 0.983, 0.994]
    .findIndex((sceneStart) => Math.abs(sceneStart - start) < 0.001) + 1;

  return (
    <div
      className={`scene-panel scene-panel-${sceneMark} absolute inset-0 flex flex-col justify-center ${anchorClass} pointer-events-none`}
      data-scene={sceneMark}
      data-index={sceneIndex}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
      }}
    >
      <div className={`scene-content scene-content--${framed ? 'framed' : 'open'} scene-content--${anchor} ${className} pointer-events-auto`}>
        {children}
      </div>
    </div>
  );
}

// Floating stat badge used inside scenes
function StatBadge({ label, value, color = '#c8a873' }: { label: string; value: string; color?: string }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value" style={{ color }}>{value}</span>
    </div>
  );
}

export const SceneOverlays: React.FC<SceneOverlaysProps> = ({
  progress, onOpenWorkspaces, onSelectCompetitorByName
}) => {
  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none overflow-hidden"
      aria-live="polite"
    >
      {/* ════════════════════════════════════════════════════════
          SCENE 01 · THE MARKET  [0.00 – 0.065]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.00} end={0.065} progress={progress} anchor="center" framed={false} fadeIn={0.008} fadeOut={0.008}>
        <div className="text-center max-w-2xl mx-auto px-6 space-y-6">
          <div className="signal-tag animate-fade-in">
            <span className="live-pulse" />
            SYNTARA · MARKET OBSERVATION · LIVE
          </div>

          <h1 className="headline-fluid font-serif italic text-paper animate-slide-up animate-delay-100">
            The market is<br />
            <em className="not-italic text-signal-orange">moving.</em>
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-lg mx-auto font-sans font-light leading-relaxed animate-slide-up animate-delay-200">
            Competitors publish, angles shift, and new formats take root every hour.
              You just can’t see it yet. Scroll to follow the evidence.
          </p>

          <div className="flex items-center justify-center gap-3 animate-fade-in animate-delay-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono-code text-paper/70">
              <ArrowDown className="w-3.5 h-3.5 text-signal-orange animate-bounce" />
              SCROLL TO TRAVEL FORWARD
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-4 flex-wrap animate-fade-in animate-delay-400">
            <div className="flex items-center gap-2 text-xs font-mono-code text-muted/70">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-orange" />
              110+ content nodes mapped
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-muted/70">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald" />
              4 competitors surveilled
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-muted/70">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
              8 cluster themes indexed
            </div>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 02 · CONTENT STREAMS  [0.068 – 0.135]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.068} end={0.135} progress={progress} anchor="left">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <Activity className="w-3 h-3" />
            SCENE 02 · CONTENT STREAMS
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Every day,<br />your market<br />creates more.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Reels, carousels, founder posts, stories, and campaigns fill the category.
            Each printed signal in the field represents a piece of public market creative.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-mono-code">
            {['Reel', 'Carousel', 'Founder Post', 'Story', 'Video', 'Article'].map((f) => (
              <span key={f}
                className="px-2.5 py-1 rounded-md bg-ink-900/80 border border-white/10 text-paper/70 hover:border-signal-orange/40 transition-colors">
                {f}
              </span>
            ))}
          </div>
          <div className="text-xs font-mono-code text-muted">
            <span className="text-signal-orange font-semibold">110 illustrative content nodes</span> · sample public posts · last 30 days
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 03 · CHAOS  [0.14 – 0.205]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.14} end={0.205} progress={progress} anchor="center" framed={false}>
        <div className="text-center max-w-lg mx-auto px-6 space-y-5">
          <div className="signal-tag" style={{ background: 'rgba(200,168,115,0.08)', borderColor: 'rgba(200,168,115,0.28)', color: '#e0c898' }}>
            <AlertCircle className="w-3 h-3" />
            INFORMATION OVERLOAD
          </div>
          <h2 className="font-display font-bold text-paper tracking-tighter leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
            You just<br />
            can’t see<br />
            <span className="text-signal-orange">the shift.</span>
          </h2>
          <p className="text-base text-muted font-sans max-w-sm mx-auto leading-relaxed">
            Every post adds another voice. The change is there, hidden in the repetition.
          </p>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 04 · INTELLIGENCE / PATTERNS  [0.215 – 0.29]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.215} end={0.29} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag signal-tag-emerald">
            <Sparkles className="w-3 h-3" />
            SCENE 04 · SYNTHESIS ENGINE
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Find the<br />pattern.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Watch chaos snap to order. The Syntara Signal Engine groups 110+ unstructured
            posts into 8 deterministic market-topic clusters automatically.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatBadge label="Cluster Cohesion" value="94.2%" color="#b8ce72" />
            <StatBadge label="Themes Indexed" value="8 Pillars" />
          </div>
          <div className="text-xs font-mono-code text-muted leading-relaxed">
            CHAOS&nbsp;&nbsp;→&nbsp;&nbsp;<span className="text-signal-orange">STRUCTURE</span>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 05 · COMPETITOR INTELLIGENCE  [0.30 – 0.37]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.30} end={0.37} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <Eye className="w-3 h-3" />
            SCENE 05 · COMPETITOR PROFILES
          </div>
          <h2 className="headline-sm-fluid font-display font-semibold text-paper">
            Surveil every brand<br />in your space.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Click a competitor archive in the 3D field to reveal publishing velocity,
            dominant topic share, messaging shifts, and active campaigns.
          </p>
          <div className="space-y-2">
            {[
              { name: 'Northstar Studio', status: 'Accelerating +32%', color: '#c8a873' },
              { name: 'Orbit Works', status: '2.4× cadence', color: '#c5bca8' },
              { name: 'Monday Practice', status: 'Steady · 4 pw', color: '#b8ce72' },
              { name: 'Signal House', status: '+18% this month', color: '#a29d91' },
            ].map((comp) => (
              <button
                key={comp.name}
                onClick={() => onSelectCompetitorByName(comp.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-ink-900/90 border border-white/5 hover:border-white/20 transition-colors text-left text-xs font-mono-code"
              >
                <span className="text-paper font-medium">{comp.name}</span>
                <span style={{ color: comp.color }}>{comp.status}</span>
              </button>
            ))}
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 06 · COMPETITOR MOVEMENT  [0.38 – 0.45]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.38} end={0.45} progress={progress} anchor="right">
        <div className="max-w-md glass-panel-accent rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="flex items-center gap-2 signal-tag" style={{ color: '#b8ce72', background: 'transparent', borderColor: '#b8ce72' }}>
            <AlertCircle className="w-3 h-3" />
            VELOCITY ACCELERATION DETECTED
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Something<br />changed.
          </h2>
          <div className="p-4 rounded-xl bg-ink-950/80 border border-signal-orange/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-display text-paper">NORTHSTAR STUDIO</span>
              <span className="px-3 py-1 rounded-full bg-signal-orange text-white text-xs font-bold font-mono-code">
                +32% EDUCATIONAL CONTENT
              </span>
            </div>
            <p className="text-xs text-muted font-sans leading-relaxed">
              Pivoted from static product posts to daily short-form problem-first education.
              "The Better Brief" weekly series launched this month.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono-code text-signal-orange">
              <Zap className="w-3 h-3" />
              Signal beam now live → Education cluster
            </div>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 07 · SIGNAL FILTERING  [0.46 – 0.535]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.46} end={0.535} progress={progress} anchor="center" framed={false}>
        <div className="w-full text-center max-w-5xl mx-auto px-6 space-y-6">
          <div className="signal-tag signal-tag-emerald">
            <Activity className="w-3 h-3 animate-pulse" />
            ADAPTIVE FILTERING ACTIVE
          </div>
          <h2 className="font-display font-bold text-paper tracking-tighter"
            style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', lineHeight: 1 }}>
            Until<br />
            <span className="text-signal-orange">now.</span>
          </h2>
          <p className="text-base text-muted font-sans max-w-sm mx-auto leading-relaxed">
            One idea repeats across brands. The field quiets, and the outlier holds its shape.
          </p>
          <div className="flex justify-center gap-3 pt-2 flex-wrap text-xs font-mono-code text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-signal-orange" /> Highlighted: Signal</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink-800 border border-white/15" /> Faded: Noise</span>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 08 · CREATIVE DNA  [0.545 – 0.615]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.545} end={0.615} progress={progress} anchor="left">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <Layers className="w-3 h-3" />
            SCENE 08 · CREATIVE DNA DECONSTRUCTION
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Understand<br />why it works.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            The 3D creative separates into seven working layers. Each layer
            can be recombined to generate new creative angles.
          </p>
          <div className="p-3.5 rounded-xl bg-ink-950/90 border border-white/8">
            <div className="text-xs font-mono-code text-signal-orange mb-2 font-semibold">HERO HOOK ANALYSIS</div>
            <p className="text-sm font-serif italic text-paper mb-2">
              "You're probably briefing creative backwards."
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-code text-muted">
              {['[ HOOK ]', '[ MESSAGE ]', '[ ANGLE ]', '[ FORMAT ]', '[ EMOTION ]', '[ CTA ]', '[ AUDIENCE ]'].map((l) => (
                <span key={l} className="px-1.5 py-0.5 rounded bg-ink-900 border border-white/6 text-center">{l}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <StatBadge label="Save Rate" value="+4.8%" color="#b8ce72" />
            <StatBadge label="vs Baseline" value="1.8x" />
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 09 · MARKET LANDSCAPE  [0.625 – 0.685]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.625} end={0.685} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <TrendingUp className="w-3 h-3" />
            SCENE 09 · CATEGORY TOPOGRAPHY
          </div>
          <h2 className="headline-sm-fluid font-display font-semibold text-paper">
            The entire category<br />from 3,000 metres.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Competitors occupy crowded territories. Some corners of the market
            are almost completely open. You can see exactly where to go next.
          </p>
          <div className="space-y-1.5 text-xs font-mono-code">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-signal-orange block" />
              <span className="text-muted">Competitor-dense zones (Product, Social Proof)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-signal-amber block" />
              <span className="text-muted">White space zones (Education × Community)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-white/80 block" />
              <span className="text-muted">Your brand core (Syntara)</span>
            </div>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 10 · WHITE SPACE  [0.695 – 0.760]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.695} end={0.760} progress={progress} anchor="left">
        <div className="max-w-md glass-panel-amber rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag signal-tag-amber">
            <Sparkles className="w-3 h-3" />
            SCENE 10 · WHITE SPACE ENGINE
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            {progress < 0.714 ? <>Everyone is<br />talking here.</> : progress < 0.738 ? <>No one is<br />talking there.</> : <>That’s the<br /><em className="not-italic text-signal-orange">opportunity.</em></>}
          </h2>
          <div className="p-4 rounded-xl bg-ink-950/80 border border-signal-amber/30 space-y-3">
            <div className="text-xs font-mono-code text-signal-amber font-semibold uppercase tracking-wider">
              QUIET TERRITORY · 02 / 18 BRANDS
            </div>
            <div className="text-2xl font-bold font-display text-paper">
              Education × community
            </div>
            <div className="text-sm text-paper/80 font-mono-code">
              The market is loud here. Your voice can be distinct.
            </div>
            <div className="w-full h-1.5 bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-signal-amber" style={{ width: '11%' }} />
            </div>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 11 · OPPORTUNITY  [0.770 – 0.825]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.770} end={0.825} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag signal-tag-emerald">
            <Sparkles className="w-3 h-3" />
            SCENE 11 · STRATEGIC SYNTHESIS
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            A gap becomes<br />an opportunity.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Several quiet signals converge on one useful move. Each step keeps its evidence in view.
          </p>
          <div className="signal-convergence font-mono-code text-xs">
            <div><i>01</i><span>Market activity</span><b>32% rise</b></div>
            <div><i>02</i><span>Repeated angle</span><b>3 brands</b></div>
            <div><i>03</i><span>Coverage gap</span><b>2 / 18</b></div>
            <div className="convergence-result"><i>↘</i><span>Make the thinking visible</span></div>
          </div>
          <div className="p-3 rounded-lg bg-signal-emerald/10 border border-signal-emerald/20 text-sm font-mono-code text-signal-emerald">
            "Make the thinking visible"
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 12 · CAMPAIGN GENERATION  [0.835 – 0.88]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.835} end={0.88} progress={progress} anchor="left">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <Zap className="w-3 h-3" />
            SCENE 12 · AUTOPILOT GENERATOR
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Now do something<br />with it.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Watch the opportunity structure branch into 4 content pillars —
            each populating specific hooks, formats, and posting cadence.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
            {[
              ['01', 'What We Believe', '#c8a873'],
              ['02', 'Show Your Working', '#b8ce72'],
              ['03', 'Teach The Shortcut', '#c5bca8'],
              ['04', 'Community Spotlight', '#8e8b84'],
            ].map(([num, title, color]) => (
              <div key={num} className="p-2.5 rounded-lg bg-ink-900 border border-white/6">
                <span className="block text-[10px] mb-0.5" style={{ color }}>PILLAR {num}</span>
                <span className="text-paper font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 13 · MARKETING AUTOPILOT  [0.89 – 0.93]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.89} end={0.925} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <RefreshCcw className="w-3 h-3" />
            SCENE 13 · ORCHESTRATION
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Insight becomes<br />a working plan.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            A market opening becomes a campaign angle, then a series, creative variations, and a schedule for your team to review.
          </p>
          <div className="autopilot-steps font-mono-code text-xs">
            {[
              ['01', 'Opportunity', 'Education × community'],
              ['02', 'Campaign angle', 'Make the thinking visible'],
              ['03', 'Content series', '4 pillars · 6 ideas'],
              ['04', 'Publishing plan', '3 weeks · team approved'],
            ].map(([num, label, value]) => (
              <div key={num}><i>{num}</i><span>{label}</span><b>{value}</b></div>
            ))}
            <div className="autopilot-ready"><span>READY FOR REVIEW</span><b>Nothing publishes without your say-so.</b>
            </div>
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 14 · CONTENT CALENDAR  [0.935 – 0.962]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.935} end={0.95} progress={progress} anchor="left" fadeIn={0.012}>
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-4">
          <div className="signal-tag">
            <BarChart2 className="w-3 h-3" />
            SCENE 14 · SPATIAL CALENDAR
          </div>
          <h2 className="headline-sm-fluid font-display font-bold text-paper">
            A plan with<br />room to move.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Campaign pieces slot into the week's publishing windows.
            Projected performance metrics appear before a single post goes live.
          </p>
          <div className="space-y-2">
            {[
              { day: 'MON', fmt: 'REEL', title: 'The backwards brief problem', est: '3.8% est. saves' },
              { day: 'TUE', fmt: 'CAROUSEL', title: 'Anatomy of a viral B2B hook', est: '4.4% est. saves' },
              { day: 'THU', fmt: 'REEL', title: 'The 3-second brief test', est: '+28% est. reach' },
            ].map((entry) => (
              <div key={entry.day} className="flex items-center gap-3 p-2.5 rounded-lg bg-ink-900/90 border border-white/6">
                <span className="text-xs font-mono-code text-muted w-8">{entry.day}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono-code rounded bg-signal-orange/20 text-signal-orange border border-signal-orange/30">
                  {entry.fmt}
                </span>
                <span className="text-xs text-paper flex-1 truncate">{entry.title}</span>
                <span className="text-[10px] font-mono-code text-signal-emerald shrink-0">{entry.est}</span>
              </div>
            ))}
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 15 · RESULTS  [0.965 – 0.982]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.965} end={0.982} progress={progress} anchor="center" framed={false}>
        <div className="text-center max-w-5xl mx-auto px-6 space-y-6">
          <div className="signal-tag signal-tag-emerald">
            <Activity className="w-3 h-3 animate-pulse" />
            FEEDBACK SIGNALS RETURNING
          </div>
          <h2 className="headline-fluid feedback-headline font-serif italic text-paper">
            Then the market<br />answers back.
          </h2>
          <p className="text-base text-muted font-sans max-w-sm mx-auto leading-relaxed">
            The strongest creative earns more attention. Its trajectory returns to the signal field; weak tests recede.
          </p>
          <div className="flex justify-center gap-4">
            <StatBadge label="Save Rate" value="3.2%" color="#b8ce72" />
            <StatBadge label="Baseline" value="1.8%" />
            <StatBadge label="Lift" value="1.78×" color="#b8ce72" />
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 16 · LEARNING LOOP  [0.983 – 0.993]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.983} end={0.993} progress={progress} anchor="right">
        <div className="max-w-md glass-panel rounded-2xl p-7 sm:p-9 space-y-5">
          <div className="signal-tag">
            <RefreshCcw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            SCENE 16 · CONTINUOUS LEARNING LOOP
          </div>
          <h2 className="headline-sm-fluid font-serif italic text-paper">
            Every result becomes<br />the next signal.
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Performance data feeds back into the intelligence engine.
            Successful patterns get amplified. Weak patterns retire.
            The platform never starts from scratch again.
          </p>
          <div className="font-mono-code text-xs space-y-1 text-muted">
            {['MARKET', 'SIGNAL', 'PATTERN', 'OPPORTUNITY', 'CAMPAIGN', 'RESULT', 'LEARNING'].map((node, i, arr) => (
              <div key={node} className="flex items-center gap-2">
                {i === 0 && <span className="text-signal-orange font-semibold">{node}</span>}
                {i > 0 && <span className={i === arr.length - 1 ? 'text-signal-orange font-semibold' : ''}>{i < arr.length - 1 ? '↓  ' : '↺  '}{node}</span>}
              </div>
            ))}
          </div>
        </div>
      </ScenePanel>

      {/* ════════════════════════════════════════════════════════
          SCENE 17 · FINAL WORLD  [0.994 – 1.00]
         ════════════════════════════════════════════════════════ */}
      <ScenePanel start={0.994} end={1.005} progress={progress} anchor="center" framed={false} fadeOut={0.005}>
        <div className="text-center max-w-2xl mx-auto px-6 space-y-8">
          <div className="signal-tag">
            <Sparkles className="w-3 h-3" />
            SYNTARA INTELLIGENCE ECOSYSTEM
          </div>

          <h1 className="headline-fluid font-serif italic text-paper">
            See what changed.<br />
            <span className="not-italic text-signal-orange">Know what to do next.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted font-sans max-w-lg mx-auto leading-relaxed">
            Connect your brand. Watch your competitors. Turn category white space
            into a continuous momentum engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="agency.html"
              className="w-full sm:w-auto group px-8 py-4 rounded-full bg-signal-orange text-white font-semibold text-sm hover:bg-signal-orange/90 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-signal-orange/25 hover:shadow-signal-orange/40"
            >
              <span>Open client portfolio</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <button
              onClick={onOpenWorkspaces}
              className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel border border-white/12 text-paper font-medium text-sm hover:border-signal-orange/40 transition-colors flex items-center justify-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-signal-orange" />
              <span>Choose your next step</span>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-mono-code text-muted/60">
            <span>PUBLIC CONTENT INTELLIGENCE</span>
            <span>·</span>
            <span>HUMAN-IN-THE-LOOP AUTOPILOT</span>
            <span>·</span>
            <span>CONTINUOUS LEARNING LOOP</span>
          </div>
        </div>
      </ScenePanel>
    </div>
  );
};

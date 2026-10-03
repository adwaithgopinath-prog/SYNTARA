import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneCanvas } from './canvas/SceneCanvas';
import { Header } from './overlay/Header';
import { Preloader } from './overlay/Preloader';
import { SceneOverlays } from './overlay/SceneOverlays';
import { ObjectInspectorModal } from './overlay/ObjectInspectorModal';
import { WorkspaceDrawer } from './overlay/WorkspaceDrawer';
import { ContentObject, CompetitorData, ClusterTheme } from './types';
import { COMPETITORS, CLUSTERS, CONTENT_OBJECTS } from './data/intelligenceData';
import { audioSystem } from './audio';
import { checkWorkspace, readWorkspace, recordWorkspaceActivity } from './api';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [workspaceCompetitors, setWorkspaceCompetitors] = useState(COMPETITORS);
  const [workspaceClusters, setWorkspaceClusters] = useState(CLUSTERS);
  const [workspaceContent, setWorkspaceContent] = useState(CONTENT_OBJECTS);

  // Selected entities for HUD inspector
  const [selectedObject, setSelectedObject] = useState<ContentObject | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterTheme | null>(null);

  // Hover state for 3D interactions
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);

  // Animation and camera progress refs (high frequency, no re-render lag)
  const progressRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let mounted = true;
    readWorkspace().then((state) => {
      if (!mounted) return;
      const competitors = COMPETITORS.map((base) => {
        const saved = state.competitors.find((item) => item.id === base.id);
        const profile = state.competitorProfiles.find((item) => item.competitorId === base.id);
        return saved ? {
          ...base,
          name: saved.name,
          handle: saved.handle,
          observedPosts: saved.observedPosts,
          ...(profile ? {
            velocityChange: profile.velocityChange,
            dominantTopics: profile.topics,
            messaging: profile.message,
            formats: profile.formats,
            campaign: profile.campaign,
            recentChange: profile.recentChange,
          } : {}),
        } : base;
      });
      const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
      const clusters = CLUSTERS.map((base) => {
        const key = Object.keys(state.themes).find((name) => normalize(name) === normalize(base.label) || normalize(base.name) === normalize(name));
        const theme = key ? state.themes[key] : undefined;
        const opportunity = state.opportunities.find((item) => normalize(item.theme) === normalize(base.label) || normalize(item.theme) === normalize(base.name));
        return {
          ...base,
          marketShare: opportunity?.marketShare ?? theme?.market ?? base.marketShare,
          brandShare: opportunity?.brandShare ?? theme?.brand ?? base.brandShare,
          isOpportunity: Boolean(opportunity) || base.isOpportunity,
        };
      });
      const content = CONTENT_OBJECTS.map((base, index) => {
        const saved = state.contentItems[index];
        return saved ? { ...base, hook: saved.hook, engagement: saved.publicEngagement, cluster: saved.theme.toUpperCase() } : base;
      });
      setWorkspaceCompetitors(competitors);
      setWorkspaceClusters(clusters);
      setWorkspaceContent(content);
      setBackendOnline(true);
    }).catch(() => { if (mounted) setBackendOnline(false); });
    return () => { mounted = false; };
  }, []);

  // Active scene calculation
  const getSceneMeta = (p: number) => {
    if (p < 0.06) return { num: '01 / 17', title: 'The Market In Motion' };
    if (p < 0.13) return { num: '02 / 17', title: 'Content Streams' };
    if (p < 0.20) return { num: '03 / 17', title: 'Information Chaos' };
    if (p < 0.28) return { num: '04 / 17', title: 'Pattern Synthesis' };
    if (p < 0.36) return { num: '05 / 17', title: 'Competitor Telemetry' };
    if (p < 0.44) return { num: '06 / 17', title: 'Velocity Acceleration' };
    if (p < 0.52) return { num: '07 / 17', title: 'Signal Filtering' };
    if (p < 0.60) return { num: '08 / 17', title: 'Creative DNA' };
    if (p < 0.67) return { num: '09 / 17', title: 'Category Topography' };
    if (p < 0.74) return { num: '10 / 17', title: 'White Space Detected' };
    if (p < 0.81) return { num: '11 / 17', title: 'Strategic Opportunity' };
    if (p < 0.87) return { num: '12 / 17', title: 'Campaign Generator' };
    if (p < 0.92) return { num: '13 / 17', title: 'Marketing Autopilot' };
    if (p < 0.96) return { num: '14 / 17', title: 'Spatial Calendar' };
    if (p < 0.98) return { num: '15 / 17', title: 'Market Feedback' };
    if (p < 0.99) return { num: '16 / 17', title: 'Continuous Loop' };
    return { num: '17 / 17', title: 'Living Ecosystem' };
  };

  const sceneMeta = getSceneMeta(scrollProgress);

  // Setup Lenis Smooth Scroll and GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Master ScrollTrigger on scrollContainer
    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        setScrollProgress(p);
      }
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  // Track mouse coordinates for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current = { x: nx, y: ny };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Jump smoothly to a specific progress (e.g. from nav or buttons)
  const jumpToProgress = (target: number) => {
    if (!lenisRef.current || !scrollContainerRef.current) return;
    recordWorkspaceActivity('chapter_navigation', { progress: target });
    const maxScroll = scrollContainerRef.current.scrollHeight - window.innerHeight;
    lenisRef.current.scrollTo(target * maxScroll, { duration: 1.5 });
  };

  const openWorkspaces = () => {
    recordWorkspaceActivity('workspace_drawer_opened');
    setIsWorkspacesOpen(true);
  };

  const refreshBackend = async () => {
    const online = await checkWorkspace();
    setBackendOnline(online);
    if (online) recordWorkspaceActivity('workspace_connection_checked');
  };

  const handleSelectCompetitorByName = (name: string) => {
    const match = workspaceCompetitors.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (match) {
      recordWorkspaceActivity('competitor_opened', { competitorId: match.id, name: match.name });
      setSelectedCompetitor(match);
      setSelectedObject(null);
      setSelectedCluster(null);
      audioSystem.playChime(640);
    }
  };

  return (
    <div className="relative w-full bg-ink-950 text-paper min-h-screen">
      {/* Scene 00: Preloader */}
      {!isPreloaded && (
        <Preloader onEnter={() => setIsPreloaded(true)} />
      )}

      {/* Persistent Top Navigation Bar */}
      <Header
        currentSceneTitle={sceneMeta.title}
        currentSceneNumber={sceneMeta.num}
        scrollProgress={scrollProgress}
        onOpenWorkspaces={openWorkspaces}
        onJumpToProgress={jumpToProgress}
        backendOnline={backendOnline}
        onCheckBackend={refreshBackend}
      />

      {/* Fixed Fullscreen WebGL Canvas Layer */}
      <SceneCanvas
        progressRef={progressRef}
        mouseRef={mouseRef}
        contentObjects={workspaceContent}
        competitors={workspaceCompetitors}
        clusters={workspaceClusters}
        onSelectObject={(obj) => {
          recordWorkspaceActivity('content_object_opened', { id: obj.id, competitorId: obj.competitorId, format: obj.format });
          setSelectedObject(obj);
          setSelectedCompetitor(null);
          setSelectedCluster(null);
          audioSystem.playChime(580);
        }}
        onSelectCompetitor={(comp) => {
          recordWorkspaceActivity('competitor_opened', { competitorId: comp.id, name: comp.name });
          setSelectedCompetitor(comp);
          setSelectedObject(null);
          setSelectedCluster(null);
          audioSystem.playChime(620);
        }}
        onSelectCluster={(cluster) => {
          recordWorkspaceActivity('market_theme_opened', { name: cluster.label, marketShare: cluster.marketShare, brandShare: cluster.brandShare });
          setSelectedCluster(cluster);
          setSelectedObject(null);
          setSelectedCompetitor(null);
          audioSystem.playChime(700);
        }}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        hoveredCompId={hoveredCompId}
        setHoveredCompId={setHoveredCompId}
      />

      {/* Ambient Vignette & Noise Texture Overlay */}
      <div className="fixed inset-0 vignette pointer-events-none z-10" />
      <div className="fixed inset-0 noise-overlay pointer-events-none z-10" />

      {/* Pinned 17-Scene HTML Narrative Overlays */}
      <SceneOverlays
        progress={scrollProgress}
        onOpenWorkspaces={openWorkspaces}
        onSelectCompetitorByName={handleSelectCompetitorByName}
      />

      {/* Floating Object Inspector Modal (When user clicks node/tower) */}
      <ObjectInspectorModal
        selectedObject={selectedObject}
        selectedCompetitor={selectedCompetitor}
        selectedCluster={selectedCluster}
        onClose={() => {
          setSelectedObject(null);
          setSelectedCompetitor(null);
          setSelectedCluster(null);
        }}
        onOpenWorkspaces={openWorkspaces}
      />

      {/* Slide-over Product Workspaces Navigator */}
      <WorkspaceDrawer
        isOpen={isWorkspacesOpen}
        onClose={() => setIsWorkspacesOpen(false)}
      />

      {/* Scrollable Track (1400vh) Driving the Master Timeline */}
      <div
        ref={scrollContainerRef}
        className="relative w-full h-[1400vh] pointer-events-none"
        aria-hidden="true"
      >
        {/* Invisible Scroll Track Spacer */}
      </div>
    </div>
  );
};

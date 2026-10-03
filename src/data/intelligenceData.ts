import { CompetitorData, ClusterTheme, CreativeDnaLayer, CampaignPillar, CalendarEntry, ContentObject } from '../types';

export const CLUSTERS: ClusterTheme[] = [
  { name: 'EDUCATION', label: 'Education', position: [-8, 2, -22], color: '#c8a873', marketShare: 68, brandShare: 19, itemCount: 38, isOpportunity: true },
  { name: 'PRODUCT', label: 'Product & Demos', position: [8, 4, -26], color: '#c5bca8', marketShare: 76, brandShare: 31, itemCount: 42 },
  { name: 'PRICE', label: 'Price & ROI', position: [14, -2, -18], color: '#b8ce72', marketShare: 44, brandShare: 18, itemCount: 22 },
  { name: 'SOCIAL PROOF', label: 'Social Proof', position: [-12, -3, -15], color: '#8e8b84', marketShare: 62, brandShare: 40, itemCount: 31 },
  { name: 'COMMUNITY', label: 'Community & Culture', position: [-6, 6, -30], color: '#b8ce72', marketShare: 41, brandShare: 12, itemCount: 19, isOpportunity: true },
  { name: 'LIFESTYLE', label: 'Lifestyle / Behind The Scenes', position: [11, 6, -34], color: '#a99d8b', marketShare: 38, brandShare: 15, itemCount: 24 },
  { name: 'TRUST', label: 'Trust & Security', position: [-14, 5, -28], color: '#777a72', marketShare: 55, brandShare: 35, itemCount: 27 },
  { name: 'COMPARISON', label: 'Comparison & Teardowns', position: [4, -5, -20], color: '#c2a46f', marketShare: 48, brandShare: 22, itemCount: 26 },
];

export const COMPETITORS: CompetitorData[] = [
  {
    id: 'northstar',
    name: 'Northstar Studio',
    handle: '@northstar',
    color: '#c8a873',
    position: [-10, 1.5, -18],
    velocityChange: '+32% posts this month',
    dominantTopics: ['Education', 'Creative Process', 'Briefs'],
    messaging: 'Show the work behind the outcome',
    formats: ['Reels (62%)', 'Carousels (28%)', 'Stories (10%)'],
    campaign: 'The Better Brief Series',
    recentChange: 'Shifted from static posts to daily short-form problem-first education.',
    observedPosts: 38,
    status: 'accelerating'
  },
  {
    id: 'orbit',
    name: 'Orbit Works',
    handle: '@orbitworks',
    color: '#c5bca8',
    position: [12, 3, -24],
    velocityChange: '2.4× short-form cadence',
    dominantTopics: ['A/B Testing', 'Product Lessons', 'Founder POV'],
    messaging: 'Test, learn, then make it simpler',
    formats: ['Short Video (75%)', 'Founder Posts (25%)'],
    campaign: '100 Tests / 100 Lessons',
    recentChange: 'Cut long-form blog publishing entirely in favor of viral test clips.',
    observedPosts: 44,
    status: 'accelerating'
  },
  {
    id: 'monday',
    name: 'Monday Practice',
    handle: '@mondaypractice',
    color: '#b8ce72',
    position: [-13, -2, -14],
    velocityChange: 'Steady · 4 posts / week',
    dominantTopics: ['Founder POV', 'Editorial Craft'],
    messaging: 'Better questions make better creative',
    formats: ['Carousels (70%)', 'Text posts (30%)'],
    campaign: 'Questions Worth Asking',
    recentChange: 'Repeating a single manifesto hook across 5 carousels.',
    observedPosts: 24,
    status: 'steady'
  },
  {
    id: 'signal-house',
    name: 'Signal House',
    handle: '@signalhouse',
    color: '#8e8b84',
    position: [9, -4, -16],
    velocityChange: '+18% posts this month',
    dominantTopics: ['Community', 'Product Walkthroughs'],
    messaging: 'Made with the teams who use it',
    formats: ['Stories (45%)', 'Case Studies (55%)'],
    campaign: 'Made Together',
    recentChange: 'Injecting customer video reactions directly into weekly reels.',
    observedPosts: 29,
    status: 'steady'
  }
];

export const CREATIVE_DNA_LAYERS: CreativeDnaLayer[] = [
  {
    category: 'HOOK',
    title: '“You’re probably briefing creative backwards.”',
    description: 'Direct challenge to common practice within 1.8 seconds. Creates instant cognitive dissonance for marketing leads.',
    offsetZ: 3.4,
    color: '#c8a873'
  },
  {
    category: 'MESSAGE',
    title: 'Problem → Concrete Insight → 1 Practical Move',
    description: 'Zero fluff or generic theory. Gives immediate actionable value before introducing product capabilities.',
    offsetZ: 2.3,
    color: '#b8ce72'
  },
  {
    category: 'ANGLE',
    title: 'Educational Teardown with Real Evidence',
    description: 'Dissects competitor mistakes sympathetically, positioning author as category authority rather than salesperson.',
    offsetZ: 1.2,
    color: '#c5bca8'
  },
  {
    category: 'FORMAT',
    title: 'Short-Form Reel (34s) + High-Contrast Captions',
    description: 'Fast pacing with 1.4-second shot transitions and visual text highlights optimized for sound-off consumption.',
    offsetZ: 0.1,
    color: '#9d9a91'
  },
  {
    category: 'EMOTION',
    title: 'Relief & Professional Validation',
    description: 'Transforms feeling behind the curve into clarity and relief: “It wasn’t my fault, it was the broken process.”',
    offsetZ: -1.0,
    color: '#aaa08c'
  },
  {
    category: 'CTA',
    title: '“Save this checklist for your next brief”',
    description: 'High utility, low friction call to action resulting in a +4.8% algorithmic save rate vs category median.',
    offsetZ: -2.1,
    color: '#8e8b84'
  },
  {
    category: 'AUDIENCE',
    title: 'Brand and content leads building sharper briefs',
    description: 'Tuned for the teams responsible for positioning and campaign direction, with examples they can reuse.',
    offsetZ: -3.2,
    color: '#c5bca8'
  }
];

export const CAMPAIGN_PILLARS: CampaignPillar[] = [
  {
    number: '01',
    title: 'What We Believe',
    format: 'Founder POV · Reel',
    angle: 'Contrarian category stance',
    cadence: '1x weekly',
    ideas: ['Why most competitor audits fail', 'The vanity metric trap', 'Stop copying category leaders']
  },
  {
    number: '02',
    title: 'Show Your Working',
    format: 'Process Breakdown · Carousel',
    angle: 'Behind the scenes telemetry',
    cadence: '2x weekly',
    ideas: ['How we analyze 500 competitor reels in 10 minutes', 'The anatomy of a viral B2B hook', 'White space map dissection']
  },
  {
    number: '03',
    title: 'Teach The Shortcut',
    format: 'Educational · Short Video',
    angle: 'Actionable 30s framework',
    cadence: '2x weekly',
    ideas: ['The 3-second brief test', 'How to spot competitor ad fatigue', 'The headline inversion method']
  },
  {
    number: '04',
    title: 'Community Spotlight',
    format: 'Customer Voice · Story + Quote',
    angle: 'Real practitioner results',
    cadence: '1x weekly',
    ideas: ['How a team of 3 outpublished an agency', 'From guessing to a 34% save rate', 'The autopilot playbook in action']
  }
];

export const CALENDAR_ENTRIES: CalendarEntry[] = [
  { day: 'MON', date: 'OCT 06', format: 'REEL', title: 'Why 90% of Competitor Audits Miss the Pattern', pillar: 'Pillar 01', status: 'Scheduled', perfMetric: 'Est. Save Rate 3.8%' },
  { day: 'TUE', date: 'OCT 07', format: 'CAROUSEL', title: 'The Anatomy of a High-Conversion B2B Hook', pillar: 'Pillar 02', status: 'Scheduled', perfMetric: 'Est. Save Rate 4.4%' },
  { day: 'WED', date: 'OCT 08', format: 'STORY', title: 'Inside Our Morning Signal Engine Feed', pillar: 'Pillar 04', status: 'Ready', perfMetric: 'Est. Replies 32+' },
  { day: 'THU', date: 'OCT 09', format: 'REEL', title: 'The 3-Second Brief Test (Avoid This Mistake)', pillar: 'Pillar 03', status: 'Scheduled', perfMetric: 'Est. Reach +28%' },
  { day: 'FRI', date: 'OCT 10', format: 'CASE STUDY', title: 'How Northstar Pivoted Their Format Mix in 30 Days', pillar: 'Pillar 02', status: 'Testing', perfMetric: 'Benchmark 3.2x' },
];

// Generate 120 deterministic 3D content objects
export const CONTENT_OBJECTS: ContentObject[] = (() => {
  const formats: ContentObject['format'][] = ['Reel', 'Carousel', 'Post', 'Video', 'Article', 'Story'];
  const hooks = [
    '3 ways to rethink your launch brief',
    'What we learned from 100 A/B creative tests',
    'Why your audience skips the first 2 seconds',
    'The silent positioning shift nobody noticed',
    'How category leaders structure educational hooks',
    'Stop making generic feature walkthroughs',
    'The exact formula behind 140+ shared posts',
    'Why save rate is the new holy grail',
    'Behind the scenes: briefing an autopilot engine',
    'What happened when we cut long-form video',
    'A better way to spot white space opportunities',
    'How to outmaneuver agency retainer models'
  ];

  const competitorIds = ['northstar', 'orbit', 'monday', 'signal-house'];
  const clusterNames = ['EDUCATION', 'PRODUCT', 'PRICE', 'SOCIAL PROOF', 'COMMUNITY', 'LIFESTYLE', 'TRUST', 'COMPARISON'];

  const list: ContentObject[] = [];
  for (let i = 0; i < 110; i++) {
    const cluster = clusterNames[i % clusterNames.length];
    const compId = competitorIds[i % competitorIds.length];
    const fmt = formats[i % formats.length];
    const hook = hooks[i % hooks.length];

    // Chaotic initial position distributed along deep space
    const initialPos: [number, number, number] = [
      (i % 2 === 0 ? -1 : 1) * (9 + Math.abs(Math.sin(i * 1.7) * 9) + Math.abs(Math.cos(i * 0.9) * 2)),
      (Math.cos(i * 2.3) * 12) + (Math.sin(i * 0.5) * 3),
      -10 - (i * 0.75) // depth from -10 to -92
    ];

    // Find cluster center
    const clusterInfo = CLUSTERS.find(c => c.name === cluster) || CLUSTERS[0];
    const clusterPos: [number, number, number] = [
      clusterInfo.position[0] + (Math.sin(i * 3.1) * 3.2),
      clusterInfo.position[1] + (Math.cos(i * 2.7) * 3.2),
      clusterInfo.position[2] + (Math.sin(i * 1.5) * 2.5)
    ];

    list.push({
      id: `content-obj-${i}`,
      competitorId: compId,
      format: fmt,
      cluster,
      hook,
      velocity: 1 + (i % 4) * 0.5,
      initialPos,
      clusterPos,
      active: true,
      engagement: 40 + (i * 7) % 180,
      highlighted: cluster === 'EDUCATION' && compId === 'northstar'
    });
  }
  return list;
})();

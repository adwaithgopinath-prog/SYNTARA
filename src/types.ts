export type SceneId =
  | 'preloader'         // 00
  | 'market'            // 01
  | 'content'           // 02
  | 'chaos'             // 03
  | 'intelligence'      // 04
  | 'competitors'       // 05
  | 'competitor_move'   // 06
  | 'signal'            // 07
  | 'creative_dna'      // 08
  | 'landscape'         // 09
  | 'white_space'       // 10
  | 'opportunity'       // 11
  | 'campaign_gen'      // 12
  | 'autopilot'         // 13
  | 'calendar'          // 14
  | 'results'           // 15
  | 'learning'          // 16
  | 'final_world';      // 17

export interface ContentObject {
  id: string;
  competitorId: string;
  format: 'Reel' | 'Carousel' | 'Post' | 'Video' | 'Article' | 'Story';
  cluster: string;
  hook: string;
  velocity: number;
  initialPos: [number, number, number];
  clusterPos: [number, number, number];
  active: boolean;
  engagement: number;
  highlighted?: boolean;
}

export interface CompetitorData {
  id: string;
  name: string;
  handle: string;
  color: string;
  position: [number, number, number];
  velocityChange: string;
  dominantTopics: string[];
  messaging: string;
  formats: string[];
  campaign: string;
  recentChange: string;
  observedPosts: number;
  status: 'steady' | 'accelerating' | 'pivoting';
}

export interface ClusterTheme {
  name: string;
  label: string;
  position: [number, number, number];
  color: string;
  marketShare: number;
  brandShare: number;
  itemCount: number;
  isOpportunity?: boolean;
}

export interface CreativeDnaLayer {
  category: 'HOOK' | 'MESSAGE' | 'FORMAT' | 'ANGLE' | 'EMOTION' | 'CTA';
  title: string;
  description: string;
  offsetZ: number;
  color: string;
}

export interface CampaignPillar {
  number: string;
  title: string;
  format: string;
  angle: string;
  cadence: string;
  ideas: string[];
}

export interface CalendarEntry {
  day: string;
  date: string;
  format: string;
  title: string;
  pillar: string;
  status: 'Ready' | 'Scheduled' | 'Testing';
  perfMetric?: string;
}

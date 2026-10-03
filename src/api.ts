export interface SyntaraWorkspaceState {
  competitors: Array<{ id: string; name: string; handle: string; observedPosts: number }>;
  competitorProfiles: Array<{
    competitorId: string;
    velocityChange: string;
    topics: string[];
    message: string;
    formats: string[];
    campaign: string;
    recentChange: string;
  }>;
  contentItems: Array<{ hook: string; publicEngagement: number; theme: string }>;
  themes: Record<string, { market: number; brand: number; marketCount: number; brandCount: number }>;
  opportunities: Array<{ theme: string; marketShare: number; brandShare: number }>;
}

export async function readWorkspace(): Promise<SyntaraWorkspaceState> {
  const response = await fetch('/api/state', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Workspace API returned ${response.status}`);
  return response.json() as Promise<SyntaraWorkspaceState>;
}

export async function checkWorkspace(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

export function recordWorkspaceActivity(type: string, detail: Record<string, unknown> = {}) {
  void fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, detail }),
    keepalive: true,
  }).catch(() => {});
}

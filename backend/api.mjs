import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE_DIR = process.env.SYNTARA_DATA_DIR || path.join(ROOT, '.fieldnote');
const STORE_FILE = path.join(STORE_DIR, 'workspace.json');
const DATA_FILE = path.join(ROOT, 'data.js');
const MAX_BODY_BYTES = 128 * 1024;
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

let statePromise;
let transaction = Promise.resolve();

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

async function makeSeed() {
  const context = { window: {} };
  vm.runInNewContext(await fs.readFile(DATA_FILE, 'utf8'), context, { filename: DATA_FILE });
  const sample = copy(context.window.SYNTARA_DATA);
  return {
    ...sample,
    preferences: { selectedTheme: 'Education', selectedCompetitor: 'northstar' },
    clients: [],
    campaigns: [{ ...sample.campaign, reviewStatus: 'draft' }],
    archivedCampaigns: [],
    calendar: [
      { id: 'cal-reel-01', day: 'mon', title: 'Teach the shortcut', format: 'Reel', status: 'draft' },
      { id: 'cal-carousel-01', day: 'wed', title: 'Show your working', format: 'Carousel', status: 'draft' },
      { id: 'cal-reel-02', day: 'fri', title: 'What we believe', format: 'Reel', status: 'draft' },
    ],
    recommendations: [{ id: 'opp-education-01', status: 'open', note: '' }],
    performanceResults: [],
    activity: [],
  };
}

async function loadState() {
  if (!statePromise) {
    statePromise = (async () => {
      try {
        const saved = JSON.parse(await fs.readFile(STORE_FILE, 'utf8'));
        saved.archivedCampaigns ||= [];
        saved.clients ||= [];
        return saved;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return makeSeed();
      }
    })();
  }
  return statePromise;
}

async function saveState(state) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tempFile = `${STORE_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(tempFile, STORE_FILE);
}

function mutate(action) {
  const operation = transaction.then(async () => {
    const state = await loadState();
    const result = action(state);
    await saveState(state);
    return copy(result ?? state);
  });
  transaction = operation.catch(() => {});
  return operation;
}

async function readState() {
  await transaction;
  return copy(await loadState());
}

function json(res, status, value) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(value));
}

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  if (!size) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 });
  }
}

function addActivity(state, type, detail = {}) {
  state.activity.unshift({ id: randomUUID(), type, detail, createdAt: new Date().toISOString() });
  state.activity = state.activity.slice(0, 100);
}

async function route(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (method === 'GET' && pathname === '/api/health') {
    const storage = process.env.SYNTARA_DATA_DIR ? 'persistent-json' : process.env.RENDER ? 'ephemeral-json' : 'local-json';
    return json(res, 200, { ok: true, service: 'syntara-workspace', storage });
  }
  if (method === 'GET' && pathname === '/api/state') return json(res, 200, await readState());

  if (method === 'GET' && pathname === '/api/clients') {
    const state = await readState();
    const includeArchived = url.searchParams.get('includeArchived') === 'true';
    return json(res, 200, state.clients.filter((client) => includeArchived || client.status !== 'archived'));
  }
  if (method === 'POST' && pathname === '/api/clients') {
    const input = await body(req);
    const name = String(input.name || '').trim().slice(0, 120);
    if (!name) return json(res, 422, { error: 'Enter a client name to add the account.' });
    const client = await mutate((state) => {
      state.clients ||= [];
      const duplicate = state.clients.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase() && candidate.status !== 'archived');
      if (duplicate) return { duplicate: true, client: duplicate };
      const item = {
        id: randomUUID(),
        name,
        industry: String(input.industry || '').trim().slice(0, 120),
        goal: String(input.goal || '').trim().slice(0, 240),
        audience: String(input.audience || '').trim().slice(0, 180),
        services: String(input.services || '').trim().slice(0, 180),
        owner: String(input.owner || '').trim().slice(0, 120),
        website: String(input.website || '').trim().slice(0, 240),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.clients.unshift(item);
      addActivity(state, 'client_added', { clientId: item.id, name: item.name });
      return { duplicate: false, client: item };
    });
    if (client.duplicate) return json(res, 409, { error: 'A client with that name is already in your portfolio.', client: client.client });
    return json(res, 201, client.client);
  }

  const clientMatch = pathname.match(/^\/api\/clients\/([^/]+)(?:\/(archive|restore))?$/);
  if (clientMatch) {
    const [, id, action] = clientMatch;
    if (method === 'PATCH' && !action) {
      const input = await body(req);
      if (input.name !== undefined && !String(input.name).trim()) return json(res, 422, { error: 'Client name cannot be empty.' });
      const client = await mutate((state) => {
        const item = state.clients.find((candidate) => candidate.id === id);
        if (!item) return null;
        for (const key of ['name', 'industry', 'goal', 'audience', 'services', 'owner', 'website']) {
          if (input[key] !== undefined) item[key] = String(input[key]).trim().slice(0, key === 'name' ? 120 : key === 'goal' ? 240 : 180);
        }
        item.updatedAt = new Date().toISOString();
        addActivity(state, 'client_updated', { clientId: id, fields: Object.keys(input) });
        return item;
      });
      return client ? json(res, 200, client) : json(res, 404, { error: 'Client not found.' });
    }
    if (method === 'POST' && action === 'archive') {
      const client = await mutate((state) => {
        const item = state.clients.find((candidate) => candidate.id === id);
        if (!item) return null;
        item.status = 'archived';
        item.updatedAt = new Date().toISOString();
        addActivity(state, 'client_archived', { clientId: id, name: item.name });
        return item;
      });
      return client ? json(res, 200, client) : json(res, 404, { error: 'Client not found.' });
    }
    if (method === 'POST' && action === 'restore') {
      const client = await mutate((state) => {
        const item = state.clients.find((candidate) => candidate.id === id);
        if (!item) return null;
        item.status = 'active';
        item.updatedAt = new Date().toISOString();
        addActivity(state, 'client_restored', { clientId: id, name: item.name });
        return item;
      });
      return client ? json(res, 200, client) : json(res, 404, { error: 'Client not found.' });
    }
  }

  if (method === 'GET' && pathname === '/api/campaigns') {
    const state = await readState();
    const clientId = url.searchParams.get('clientId');
    const campaigns = clientId ? state.campaigns.filter((campaign) => campaign.clientId === clientId) : state.campaigns;
    return json(res, 200, campaigns);
  }
  if (method === 'POST' && pathname === '/api/campaigns') {
    const input = await body(req);
    if (!String(input.objective || '').trim() || !String(input.audience || '').trim()) {
      return json(res, 422, { error: 'Add an objective and audience before saving the campaign.' });
    }
    const clientId = String(input.clientId || '').trim();
    if (!clientId) return json(res, 422, { error: 'Choose a client before saving the campaign.' });
    if (!(await readState()).clients?.some((client) => client.id === clientId && client.status !== 'archived')) {
      return json(res, 422, { error: 'Choose an active client before saving this campaign.' });
    }
    const campaign = await mutate((state) => {
      if (!state.clients?.some((client) => client.id === clientId && client.status !== 'archived')) return { invalidClient: true };
      const item = {
        id: randomUUID(),
        clientId,
        name: String(input.name || `${input.opportunity || 'Market'} in Practice`).trim().slice(0, 120),
        objective: String(input.objective).trim().slice(0, 240),
        audience: String(input.audience).trim().slice(0, 180),
        durationWeeks: Math.max(1, Math.min(12, Number(input.durationWeeks) || 4)),
        channel: String(input.channel || 'Instagram').slice(0, 80),
        opportunity: String(input.opportunity || 'Education × community').slice(0, 120),
        tone: String(input.tone || 'Clear, curious, direct').slice(0, 120),
        status: 'draft',
        reviewStatus: 'draft',
        hooks: [String(input.hook || 'A practical idea for your audience.').slice(0, 180)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.campaigns.unshift(item);
      state.campaign = item;
      addActivity(state, 'campaign_created', { campaignId: item.id, name: item.name });
      return item;
    });
    if (campaign.invalidClient) return json(res, 422, { error: 'Choose an active client before saving this campaign.' });
    return json(res, 201, campaign);
  }

  const campaignMatch = pathname.match(/^\/api\/campaigns\/([^/]+)(?:\/(review|restore))?$/);
  if (campaignMatch) {
    const [, id, action] = campaignMatch;
    if (method === 'PATCH' && !action) {
      const input = await body(req);
      if (input.objective !== undefined && !String(input.objective).trim()) {
        return json(res, 422, { error: 'Campaign objective cannot be empty.' });
      }
      if (input.audience !== undefined && !String(input.audience).trim()) {
        return json(res, 422, { error: 'Campaign audience cannot be empty.' });
      }
      if (input.clientId !== undefined) {
        const clientId = String(input.clientId).trim();
        if (!clientId || !(await readState()).clients?.some((client) => client.id === clientId && client.status !== 'archived')) {
          return json(res, 422, { error: 'Choose an active client before moving this campaign.' });
        }
      }
      const campaign = await mutate((state) => {
        const item = state.campaigns.find((candidate) => candidate.id === id);
        if (!item) return null;
        for (const key of ['name', 'objective', 'audience', 'channel', 'opportunity', 'tone', 'clientId']) {
          if (input[key] !== undefined) item[key] = String(input[key]).trim().slice(0, key === 'name' ? 120 : 240);
        }
        if (input.durationWeeks !== undefined) item.durationWeeks = Math.max(1, Math.min(12, Number(input.durationWeeks) || 4));
        if (input.hooks !== undefined) item.hooks = (Array.isArray(input.hooks) ? input.hooks : [input.hooks]).map((hook) => String(hook).trim().slice(0, 180)).filter(Boolean).slice(0, 8);
        item.reviewStatus = 'draft';
        delete item.reviewRequestedAt;
        item.updatedAt = new Date().toISOString();
        addActivity(state, 'campaign_updated', { campaignId: id });
        return item;
      });
      return campaign ? json(res, 200, campaign) : json(res, 404, { error: 'Campaign not found.' });
    }
    if (method === 'POST' && action === 'review') {
      const campaign = await mutate((state) => {
        const item = state.campaigns.find((candidate) => candidate.id === id);
        if (!item) return null;
        item.reviewStatus = 'ready_for_review';
        item.reviewRequestedAt = new Date().toISOString();
        item.updatedAt = item.reviewRequestedAt;
        addActivity(state, 'campaign_review_requested', { campaignId: id });
        return item;
      });
      return campaign ? json(res, 200, campaign) : json(res, 404, { error: 'Campaign not found.' });
    }
    if (method === 'POST' && action === 'restore') {
      const campaign = await mutate((state) => {
        state.archivedCampaigns ||= [];
        const index = state.archivedCampaigns.findIndex((candidate) => candidate.id === id);
        if (index < 0) return null;
        const [item] = state.archivedCampaigns.splice(index, 1);
        delete item.archivedAt;
        item.updatedAt = new Date().toISOString();
        state.campaigns.unshift(item);
        addActivity(state, 'campaign_restored', { campaignId: id, name: item.name });
        return item;
      });
      return campaign ? json(res, 200, campaign) : json(res, 404, { error: 'Archived campaign not found.' });
    }
    if (method === 'DELETE' && !action) {
      const archived = await mutate((state) => {
        const index = state.campaigns.findIndex((candidate) => candidate.id === id);
        if (index < 0) return false;
        const [item] = state.campaigns.splice(index, 1);
        item.archivedAt = new Date().toISOString();
        state.archivedCampaigns ||= [];
        state.archivedCampaigns.unshift(item);
        if (state.campaign?.id === id) state.campaign = state.campaigns[0] || null;
        addActivity(state, 'campaign_archived', { campaignId: id, name: item.name });
        return item;
      });
      return archived ? json(res, 200, { ok: true, campaign: archived }) : json(res, 404, { error: 'Campaign not found.' });
    }
  }

  if (method === 'PATCH' && pathname === '/api/preferences') {
    const input = await body(req);
    const allowed = ['Education', 'Founder POV', 'Community', 'Product demos'];
    if (input.selectedTheme && !allowed.includes(input.selectedTheme)) return json(res, 422, { error: 'Unknown content theme.' });
    const preferences = await mutate((state) => {
      state.preferences = { ...state.preferences, ...input };
      addActivity(state, 'preferences_updated', input);
      return state.preferences;
    });
    return json(res, 200, preferences);
  }

  const recommendationMatch = pathname.match(/^\/api\/recommendations\/([^/]+)$/);
  if (method === 'PATCH' && recommendationMatch) {
    const input = await body(req);
    const recommendation = await mutate((state) => {
      let item = state.recommendations.find((candidate) => candidate.id === recommendationMatch[1]);
      if (!item) {
        item = { id: recommendationMatch[1], status: 'open', note: '' };
        state.recommendations.push(item);
      }
      if (['open', 'modified', 'dismissed'].includes(input.status)) item.status = input.status;
      if (input.note !== undefined) item.note = String(input.note).slice(0, 1000);
      item.updatedAt = new Date().toISOString();
      addActivity(state, 'recommendation_updated', { id: item.id, status: item.status });
      return item;
    });
    return json(res, 200, recommendation);
  }

  const calendarMatch = pathname.match(/^\/api\/calendar\/([^/]+)$/);
  if (method === 'PATCH' && calendarMatch) {
    const input = await body(req);
    if (!DAYS.includes(input.day)) return json(res, 422, { error: 'Choose a valid day of the week.' });
    const entry = await mutate((state) => {
      const item = state.calendar.find((candidate) => candidate.id === calendarMatch[1]);
      if (!item) return null;
      item.day = input.day;
      item.updatedAt = new Date().toISOString();
      addActivity(state, 'calendar_item_moved', { id: item.id, day: item.day });
      return item;
    });
    return entry ? json(res, 200, entry) : json(res, 404, { error: 'Calendar item not found.' });
  }

  if (method === 'PUT' && pathname === '/api/brand-profile') {
    const input = await body(req);
    const allowed = ['positioning', 'audience', 'tone', 'preferred', 'avoid', 'pillars'];
    const profile = await mutate((state) => {
      for (const key of allowed) {
        if (input[key] !== undefined) {
          state.brandProfile[key] = Array.isArray(state.brandProfile[key])
            ? String(input[key]).split(',').map((item) => item.trim()).filter(Boolean).slice(0, 12)
            : String(input[key]).trim().slice(0, 300);
        }
      }
      addActivity(state, 'brand_profile_updated', { fields: Object.keys(input).filter((key) => allowed.includes(key)) });
      return state.brandProfile;
    });
    return json(res, 200, profile);
  }

  if (method === 'POST' && pathname === '/api/performance-results') {
    const input = await body(req);
    const observed = Number(input.observed);
    if (!Number.isFinite(observed) || observed < 0 || observed > 100) return json(res, 422, { error: 'Enter a result between 0 and 100.' });
    const clientId = String(input.clientId || '').trim();
    if (!clientId) return json(res, 422, { error: 'Choose a client before saving this result.' });
    if (!(await readState()).clients?.some((client) => client.id === clientId && client.status !== 'archived')) {
      return json(res, 422, { error: 'Choose an active client before saving this result.' });
    }
    const result = await mutate((state) => {
      if (!state.clients?.some((client) => client.id === clientId && client.status !== 'archived')) return { invalidClient: true };
      const item = {
        id: randomUUID(),
        clientId,
        contentId: String(input.contentId || '').slice(0, 100),
        name: String(input.name || 'Campaign result').slice(0, 180),
        metric: String(input.metric || 'Save rate').slice(0, 60),
        observed,
        baseline: input.baseline === '' || input.baseline === undefined || input.baseline === null
          ? null
          : Number.isFinite(Number(input.baseline)) ? Math.max(0, Math.min(100, Number(input.baseline))) : null,
        note: String(input.note || '').slice(0, 600),
        recordedAt: new Date().toISOString(),
      };
      state.performanceResults.unshift(item);
      addActivity(state, 'performance_result_recorded', { resultId: item.id, name: item.name });
      return item;
    });
    if (result.invalidClient) return json(res, 422, { error: 'Choose an active client before saving this result.' });
    return json(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/activity') {
    const input = await body(req);
    const activity = await mutate((state) => {
      addActivity(state, String(input.type || 'interaction').slice(0, 80), input.detail || {});
      return state.activity[0];
    });
    return json(res, 201, activity);
  }

  if (method === 'POST' && pathname === '/api/command') {
    const input = await body(req);
    const query = Math.max(0, Math.min(3, Number(input.query) || 0));
    const state = await mutate((workspace) => {
      addActivity(workspace, 'workspace_question_asked', { query });
      return workspace;
    });
    const answers = [
      ['Three meaningful things changed.', `Educational activity rose ${state.signals[0]?.confidence ? Math.round(state.signals[0].confidence * 100) - 54 : 32}% in the sample market; ${state.marketPatterns[0]?.competitorIds.length || 3} competitors repeated a problem-first hook; community-led education is underrepresented.`, 'Source: local sample timeline, signals, and opportunities.'],
      ['Education × community is the clearest gap.', `${state.opportunities[0]?.marketShare - state.opportunities[0]?.brandShare || 49} percentage points separate category share from the current brand share in the selected sample.`, 'Source: local sample opportunity data.'],
      ['Problem-first hooks led the selected sample.', `${state.performance[0]?.name || 'The selected post'} recorded ${state.performance[0]?.current || 3.2}% sample saves against a ${state.performance[0]?.baseline || 1.8}% baseline.`, 'Source: illustrative performance comparison; correlation does not establish cause.'],
      ['Start with a four-part education series.', 'Pair practical lessons with community stories, then review the pillars and calendar before scheduling.', 'Source: sample education opportunity and saved campaign draft.'],
    ];
    const answer = answers[query];
    return json(res, 200, { title: answer[0], response: answer[1], source: answer[2] });
  }

  return json(res, 404, { error: 'API route not found.' });
}

function middleware(req, res, next) {
  if (!req.url?.startsWith('/api/')) return next();
  route(req, res).catch((error) => {
    if (!res.headersSent) json(res, error.status || 500, { error: error.message || 'Workspace API error.' });
  });
}

function accessGate(req, res, next) {
  if (process.env.SYNTARA_REQUIRE_AUTH !== 'true') return next();

  const pathname = (req.url || '/').split('?')[0];
  if (pathname === '/api/health') return next();

  const password = process.env.SYNTARA_ACCESS_PASSWORD;
  if (!password) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Workspace access is not configured.');
  }

  const expected = Buffer.from(`Basic ${Buffer.from(`syntara:${password}`).toString('base64')}`);
  const supplied = Buffer.from(req.headers.authorization || '');
  const authorized = supplied.length === expected.length && timingSafeEqual(supplied, expected);
  if (!authorized) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="SYNTARA preview", charset="UTF-8"');
    return res.end('Sign in to access the SYNTARA workspace.');
  }

  next();
}

export function syntaraApi() {
  return {
    name: 'syntara-local-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(accessGate);
      server.middlewares.use(middleware);
    },
  };
}

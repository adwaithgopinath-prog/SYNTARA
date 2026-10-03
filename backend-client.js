(() => {
  const root = '/api';
  const activeClientId = new URLSearchParams(location.search).get('clientId');
  const request = async (path, options = {}) => {
    const response = await fetch(`${root}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      keepalive: options.keepalive ?? false,
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || `Workspace request failed (${response.status}).`);
    return payload;
  };
  const api = {
    get: (path) => request(path),
    post: (path, value = {}, options = {}) => request(path, { method: 'POST', body: JSON.stringify(value), ...options }),
    patch: (path, value = {}, options = {}) => request(path, { method: 'PATCH', body: JSON.stringify(value), ...options }),
    put: (path, value = {}, options = {}) => request(path, { method: 'PUT', body: JSON.stringify(value), ...options }),
    remove: (path) => request(path, { method: 'DELETE' }),
  };
  window.SYNTARA_API = api;

  const toast = (message) => {
    if (typeof window.notify === 'function') window.notify(message);
    else {
      const region = document.querySelector('.toast');
      if (!region) return;
      region.textContent = message;
      region.classList.add('show');
      window.setTimeout(() => region.classList.remove('show'), 2800);
    }
  };
  const report = (error) => {
    console.error('[Syntara workspace]', error);
    toast(error.message || 'Could not save to the workspace. Please retry.');
  };
  const field = (label, name, value, multiline = false) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'brand-field';
    wrapper.textContent = label;
    const input = document.createElement(multiline ? 'textarea' : 'input');
    input.name = name;
    input.value = Array.isArray(value) ? value.join(', ') : value || '';
    if (multiline) input.rows = 2;
    wrapper.append(input);
    return wrapper;
  };

  const createStatusPanel = () => {
    const host = document.querySelector('.topbar .nav-actions');
    if (!host) return;
    const button = document.createElement('button');
    button.className = 'backend-status is-loading';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Local workspace connection status');
    button.innerHTML = '<i></i><span>CONNECTING</span>';
    const panel = document.createElement('aside');
    panel.className = 'backend-status-panel';
    panel.hidden = true;
    panel.innerHTML = '<div class="backend-panel-head"><div><small>SYNTARA WORKSPACE</small><b>Workspace data</b></div><button type="button" aria-label="Close workspace status">×</button></div><p class="backend-panel-status">Connecting to the workspace API…</p><div class="backend-panel-summary"></div><small class="backend-panel-foot">External publishing stays disabled.</small>';
    host.append(button, panel);
    panel.querySelector('.backend-panel-head button').addEventListener('click', () => {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    });
    const renderStatusPanel = async () => {
      try {
        const state = await api.get('/state');
        panel.querySelector('.backend-panel-status').textContent = 'Connected · changes persist between pages and reloads.';
        panel.querySelector('.backend-panel-summary').innerHTML = `<span><b>${state.campaigns?.length || 0}</b> saved drafts</span><span><b>${state.performanceResults?.length || 0}</b> recorded results</span><span><b>${state.activity?.length || 0}</b> recent actions</span>`;
      } catch (error) {
        panel.querySelector('.backend-panel-status').textContent = error.message;
      }
    };
    return (online) => {
      button.classList.toggle('is-online', online);
      button.classList.toggle('is-loading', !online);
      button.querySelector('span').textContent = online ? 'WORKSPACE SYNCED' : 'OFFLINE';
      button.setAttribute('aria-label', online ? 'Workspace synced. Open saved data status.' : 'Workspace offline. Retry connection.');
      button.onclick = async () => {
        if (!online) {
          try { await api.get('/health'); location.reload(); } catch (error) { report(error); }
          return;
        }
        panel.hidden = !panel.hidden;
        button.setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) await renderStatusPanel();
      };
    };
  };

  const setTheme = (name) => {
    const theme = window.SYNTARA_DATA?.themes?.[name];
    if (!theme) return;
    document.querySelectorAll('.theme-tab').forEach((button) => button.classList.toggle('active', button.dataset.theme === name));
    const text = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
    text('#viz-theme', name.toUpperCase());
    text('#market-num', `${theme.market}%`);
    text('#brand-num', `${theme.brand}%`);
    text('.compare-group:first-child>small', `${theme.marketCount} brands publishing on this theme`);
    text('.compare-group:last-child>small', `${theme.brandCount} of 16 recent posts on this theme`);
    text('#opp-copy', theme.opportunity);
    const marketBar = document.querySelector('#market-bar');
    const brandBar = document.querySelector('#brand-bar');
    if (marketBar) marketBar.style.width = `${theme.market}%`;
    if (brandBar) brandBar.style.width = `${theme.brand}%`;
    const title = document.querySelector('#campaign-title');
    const desc = document.querySelector('#campaign-desc');
    if (title) title.innerHTML = theme.campaign;
    if (desc) desc.textContent = theme.description;
  };

  const renderCampaignList = (campaigns) => {
    const planner = document.querySelector('#campaign-planner .planner');
    if (!planner) return;
    let rootNode = document.querySelector('.saved-campaigns');
    if (!rootNode) {
      rootNode = document.createElement('section');
      rootNode.className = 'saved-campaigns';
      rootNode.innerHTML = '<div class="saved-campaigns-head"><div><small>LOCAL WORKSPACE</small><h3>Saved campaign drafts</h3></div><span class="saved-campaign-count"></span></div><div class="saved-campaign-list"></div><details class="saved-campaign-archive"><summary></summary><div class="saved-archive-list"></div></details>';
      planner.after(rootNode);
    }
    rootNode.querySelector('.saved-campaign-count').textContent = `${campaigns.length} SAVED`;
    const list = rootNode.querySelector('.saved-campaign-list');
    list.replaceChildren();
    if (!campaigns.length) {
      const empty = document.createElement('p');
      empty.className = 'saved-campaign-empty';
      empty.textContent = 'Your next campaign draft will appear here after you shape it.';
      list.append(empty);
    } else campaigns.forEach((campaign) => {
      const row = document.createElement('article');
      row.className = 'saved-campaign-row';
      const summary = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = campaign.name;
      const meta = document.createElement('small');
      meta.textContent = `${campaign.opportunity || 'Campaign'} · ${campaign.durationWeeks || campaign.windowWeeks || 4} weeks · ${campaign.reviewStatus === 'ready_for_review' ? 'READY FOR REVIEW' : 'DRAFT'}`;
      summary.append(name, meta);
      const actions = document.createElement('div');
      actions.className = 'saved-campaign-actions';
      for (const [label, action] of [['Load', 'load'], ['Review', 'review'], ['Archive', 'archive']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.dataset.campaignAction = action;
        button.dataset.campaignId = campaign.id;
        if (action === 'review' && campaign.reviewStatus === 'ready_for_review') {
          button.textContent = 'Review requested';
          button.disabled = true;
        }
        actions.append(button);
      }
      row.append(summary, actions);
      list.append(row);
    });
    const archive = rootNode.querySelector('.saved-campaign-archive');
    const archived = window.SYNTARA_STATE?.archivedCampaigns || [];
    archive.hidden = archived.length === 0;
    archive.querySelector('summary').textContent = `ARCHIVED DRAFTS · ${archived.length}`;
    const archiveList = archive.querySelector('.saved-archive-list');
    archiveList.replaceChildren();
    archived.forEach((campaign) => {
      const row = document.createElement('article');
      row.className = 'saved-campaign-row';
      const summary = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = campaign.name;
      const meta = document.createElement('small');
      meta.textContent = `Archived ${new Date(campaign.archivedAt).toLocaleDateString()}`;
      summary.append(name, meta);
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.textContent = 'Restore';
      restore.dataset.campaignAction = 'restore';
      restore.dataset.campaignId = campaign.id;
      row.append(summary, restore);
      archiveList.append(row);
    });
  };

  const fillCampaign = (campaign) => {
    const set = (selector, value) => { const element = document.querySelector(selector); if (element && value !== undefined) element.value = value; };
    set('#plan-objective', campaign.objective);
    set('#plan-audience', campaign.audience);
    set('#plan-client', campaign.clientId);
    set('#plan-duration', `${campaign.durationWeeks || campaign.windowWeeks || 4} weeks`);
    set('#plan-channel', campaign.channel);
    set('#plan-opportunity', campaign.opportunity);
    set('#plan-tone', campaign.tone);
    const title = document.querySelector('#plan-name');
    const body = document.querySelector('#plan-core');
    const hook = document.querySelector('#plan-hook');
    if (title) title.textContent = campaign.name;
    if (body) body.textContent = campaign.objective;
    if (hook) hook.textContent = campaign.hooks?.[0] || 'A practical idea for your audience.';
    window.SYNTARA_STATE.editingCampaignId = campaign.id;
    const saveButton = document.querySelector('.generate-plan');
    if (saveButton) saveButton.textContent = 'Save campaign changes ↗';
    document.querySelector('#plan-ready')?.replaceChildren(document.createTextNode('SAVED DRAFT · LOADED'));
    document.querySelector('#campaign-planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateRecommendationUI = (state) => {
    const recommendation = state.recommendations?.find((item) => item.id === 'opp-education-01');
    const card = document.querySelector('.recommendation-card');
    if (!recommendation || !card) return;
    card.classList.toggle('rec-dismissed', recommendation.status === 'dismissed');
    const saveButton = card.querySelector('.save-modification');
    if (recommendation.note && card.querySelector('#rec-note')) card.querySelector('#rec-note').value = recommendation.note;
    if (saveButton && recommendation.status === 'modified') saveButton.textContent = 'Direction saved';
  };

  const addClientContext = (client) => {
    if (!client || document.querySelector('.active-client-context')) return;
    const actions = document.querySelector('.topbar .nav-actions');
    if (!actions) return;
    const link = document.createElement('a');
    link.className = 'active-client-context';
    link.href = 'agency.html';
    const label = document.createElement('small');
    label.textContent = 'CLIENT';
    const name = document.createElement('b');
    name.textContent = client.name;
    const change = document.createElement('span');
    change.textContent = 'Change';
    link.append(label, name, change);
    actions.prepend(link);
  };

  const showClientSetupPrompt = () => {
    if (document.body.dataset.page !== 'campaigns' || activeClientId) return;
    const planner = document.querySelector('#campaign-planner .extra-heading');
    if (!planner || planner.querySelector('.client-required-note')) return;
    const note = document.createElement('aside');
    note.className = 'client-required-note';
    note.innerHTML = '<b>Select the client account for this campaign</b><span>The campaign and its review status are saved under one client.</span><a href="agency.html">Manage clients ↗</a>';
    planner.append(note);
  };

  const populateClientSelectors = (clients = []) => {
    document.querySelectorAll('#plan-client, .result-entry [name="clientId"]').forEach((select) => {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose a client';
      const options = [placeholder, ...clients.filter((client) => client.status !== 'archived').map((client) => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        return option;
      })];
      if (activeClientId && !clients.some((client) => client.id === activeClientId && client.status !== 'archived')) {
        const missing = document.createElement('option');
        missing.value = activeClientId;
        missing.textContent = 'Client unavailable · choose another';
        options.push(missing);
      }
      select.replaceChildren(...options);
      if (activeClientId) {
        select.value = activeClientId;
        select.disabled = true;
      }
    });
  };

  const mountClientReview = (client, state) => {
    if (document.body.dataset.page !== 'performance' || !client) return;
    const heading = document.querySelector('#performance-learning .extra-heading');
    if (!heading || document.querySelector('#client-review-report')) return;

    const report = document.createElement('section');
    report.className = 'client-review-report';
    report.id = 'client-review-report';
    const top = document.createElement('div');
    top.className = 'client-review-head';
    const titleGroup = document.createElement('div');
    const eyebrow = document.createElement('small');
    eyebrow.textContent = 'CLIENT REVIEW · LOCAL WORKSPACE';
    const title = document.createElement('h3');
    title.textContent = client.name;
    titleGroup.append(eyebrow, title);
    const print = document.createElement('button');
    print.type = 'button';
    print.className = 'button button-small client-review-print';
    print.textContent = 'Print / Save PDF ↗';
    print.addEventListener('click', () => window.print());
    top.append(titleGroup, print);

    const goal = document.createElement('p');
    goal.className = 'client-review-goal';
    goal.textContent = client.goal ? `Business goal · ${client.goal}` : 'Add a business goal to this client profile to keep the review focused on its outcome.';

    const results = (state.performanceResults || []).filter((item) => item.clientId === client.id);
    const campaigns = (state.campaigns || []).filter((item) => item.clientId === client.id);
    const summary = document.createElement('div');
    summary.className = 'client-review-summary';
    const resultSummary = document.createElement('article');
    const resultCount = document.createElement('b');
    resultCount.textContent = String(results.length);
    const resultLabel = document.createElement('span');
    resultLabel.textContent = 'measured outcomes logged';
    resultSummary.append(resultCount, resultLabel);
    const campaignSummary = document.createElement('article');
    const campaignCount = document.createElement('b');
    campaignCount.textContent = String(campaigns.length);
    const campaignLabel = document.createElement('span');
    campaignLabel.textContent = 'campaign drafts for this client';
    campaignSummary.append(campaignCount, campaignLabel);
    summary.append(resultSummary, campaignSummary);

    const outcomeHeading = document.createElement('h4');
    outcomeHeading.textContent = 'Recorded outcomes';
    const outcomeList = document.createElement('div');
    outcomeList.className = 'client-review-outcomes';
    if (!results.length) {
      const empty = document.createElement('p');
      empty.className = 'client-review-empty';
      empty.textContent = 'No client outcomes have been recorded yet. Add a measured result below to prepare a review.';
      outcomeList.append(empty);
    }
    results.slice(0, 8).forEach((item) => {
      const row = document.createElement('article');
      row.className = 'client-review-outcome';
      const content = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = item.name;
      const note = document.createElement('p');
      note.textContent = item.note || `${item.metric} · recorded ${new Date(item.recordedAt).toLocaleDateString()}`;
      content.append(name, note);
      const value = document.createElement('strong');
      value.textContent = `${item.observed}% ${item.metric.toLowerCase()}`;
      const comparison = document.createElement('small');
      if (item.baseline !== null && item.baseline !== undefined) {
        const delta = Number(item.observed) - Number(item.baseline);
        comparison.textContent = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} percentage points vs ${item.baseline}% baseline`;
      } else comparison.textContent = `Recorded ${new Date(item.recordedAt).toLocaleDateString()}`;
      row.append(content, value, comparison);
      outcomeList.append(row);
    });

    const campaignHeading = document.createElement('h4');
    campaignHeading.textContent = 'Campaign work';
    const campaignList = document.createElement('div');
    campaignList.className = 'client-review-campaigns';
    if (!campaigns.length) {
      const empty = document.createElement('p');
      empty.className = 'client-review-empty';
      empty.textContent = 'No campaign draft has been created for this client yet.';
      campaignList.append(empty);
    }
    campaigns.slice(0, 6).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'client-review-campaign';
      const name = document.createElement('b');
      name.textContent = item.name;
      const status = document.createElement('span');
      status.textContent = item.reviewStatus === 'ready_for_review' ? 'Ready for review' : 'Draft';
      row.append(name, status);
      campaignList.append(row);
    });

    const foot = document.createElement('small');
    foot.className = 'client-review-foot';
    foot.textContent = 'This review uses only outcomes entered for this client. Sample market figures are not client performance data.';
    report.append(top, goal, summary, outcomeHeading, outcomeList, campaignHeading, campaignList, foot);
    heading.after(report);
  };

  const hydrate = (state) => {
    const client = state.clients?.find((item) => item.id === activeClientId && item.status !== 'archived');
    populateClientSelectors(state.clients || []);
    window.SYNTARA_STATE = {
      ...state,
      clients: state.clients || [],
      campaigns: activeClientId ? (state.campaigns || []).filter((item) => item.clientId === activeClientId) : state.campaigns || [],
      archivedCampaigns: activeClientId ? (state.archivedCampaigns || []).filter((item) => item.clientId === activeClientId) : state.archivedCampaigns || [],
      performanceResults: activeClientId ? (state.performanceResults || []).filter((item) => item.clientId === activeClientId) : state.performanceResults || [],
    };
    if (client) {
      addClientContext(client);
      const objective = document.querySelector('#plan-objective');
      const audience = document.querySelector('#plan-audience');
      if (objective && client.goal && !window.SYNTARA_STATE.campaigns.length) objective.value = client.goal;
      if (audience && client.audience && !window.SYNTARA_STATE.campaigns.length) audience.value = client.audience;
    }
    showClientSetupPrompt();
    if (state.preferences?.selectedTheme) setTheme(state.preferences.selectedTheme);
    if (state.preferences?.selectedCompetitor) {
      const selected = state.competitors?.find((item) => item.id === state.preferences.selectedCompetitor);
      const profile = state.competitorProfiles?.find((item) => item.competitorId === state.preferences.selectedCompetitor);
      if (selected && profile) {
        document.querySelectorAll('.competitor-tab').forEach((button) => button.classList.toggle('active', button.dataset.competitor === selected.id));
        for (const [selector, value] of [
          ['#competitor-name', selected.name], ['#competitor-handle', selected.handle],
          ['#competitor-velocity', profile.velocityChange], ['#competitor-topics', profile.topics.join(' · ')],
          ['#competitor-message', profile.message], ['#competitor-formats', profile.formats.join(' · ')],
          ['#competitor-campaign', profile.campaign], ['#competitor-change', profile.recentChange],
        ]) {
          const node = document.querySelector(selector);
          if (node) node.textContent = value;
        }
      }
    }
    const restoreSelection = (selector, key, dataKey) => {
      const value = state.preferences?.[key];
      const control = [...document.querySelectorAll(selector)].find((item) => item.dataset[dataKey] === value);
      control?.click();
    };
    restoreSelection('.land-node', 'selectedLandscape', 'land');
    restoreSelection('.format-button', 'selectedFormat', 'format');
    restoreSelection('.studio-pillar', 'selectedPillar', 'pillar');
    restoreSelection('.performance-item', 'selectedPerformance', 'performance');
    updateRecommendationUI(state);
    renderCampaignList(window.SYNTARA_STATE.campaigns || []);
    const calendar = document.querySelector('.calendar-items');
    state.calendar?.forEach((item) => {
      const card = calendar?.querySelector(`[data-calendar-id="${item.id}"]`);
      if (card) {
        card.dataset.day = item.day;
        card.style.gridColumn = String(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(item.day) + 1);
      }
    });
    mountBrandEditor(state.brandProfile);
    renderPerformanceResults(window.SYNTARA_STATE.performanceResults || []);
    mountClientReview(client, window.SYNTARA_STATE);
  };

  const mountBrandEditor = (profile) => {
    const card = document.querySelector('.brand-brain');
    if (!card || !profile || card.querySelector('.brand-editor')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'quiet-button brand-edit-toggle';
    toggle.textContent = 'Edit brand context';
    const form = document.createElement('form');
    form.className = 'brand-editor';
    form.hidden = true;
    form.append(
      field('Positioning', 'positioning', profile.positioning, true),
      field('Target audience', 'audience', profile.audience),
      field('Tone of voice · comma separated', 'tone', profile.tone),
      field('Preferred words · comma separated', 'preferred', profile.preferred),
      field('Avoid · comma separated', 'avoid', profile.avoid),
      field('Content pillars · comma separated', 'pillars', profile.pillars),
    );
    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'button button-small';
    save.textContent = 'Save brand context';
    form.append(save);
    toggle.addEventListener('click', () => { form.hidden = !form.hidden; });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(form));
      save.disabled = true;
      try {
        const updated = await api.put('/brand-profile', payload);
        window.SYNTARA_STATE.brandProfile = updated;
        const title = card.querySelector('h3');
        if (title) title.textContent = updated.positioning;
        const values = [updated.audience, updated.tone.join(' · '), updated.preferred.join(' · '), updated.avoid.join(' · '), updated.pillars.join(' · ')];
        card.querySelectorAll(':scope > div span').forEach((span, index) => {
          if (index < values.length) {
            const small = span.querySelector('small');
            span.textContent = '';
            if (small) span.append(small);
            span.append(document.createTextNode(values[index]));
          }
        });
        toast('Brand context saved to your local workspace.');
        form.hidden = true;
      } catch (error) { report(error); }
      finally { save.disabled = false; }
    });
    card.append(toggle, form);
  };

  const renderPerformanceResults = (results) => {
    const list = document.querySelector('.performance-list');
    if (!list) return;
    let region = list.querySelector('.recorded-results');
    if (!region) {
      region = document.createElement('div');
      region.className = 'recorded-results';
      list.append(region);
    }
    region.replaceChildren();
    results.slice(0, 5).forEach((result) => {
      const row = document.createElement('div');
      row.className = 'recorded-result';
      const label = document.createElement('span');
      label.textContent = result.name;
      const value = document.createElement('b');
      value.textContent = `${result.observed}% ${result.metric.toLowerCase()}`;
      row.append(label, value);
      region.append(row);
    });
  };

  const mountPerformanceForm = () => {
    const board = document.querySelector('.performance-board');
    if (!board || board.querySelector('.result-entry')) return;
    const form = document.createElement('form');
    form.className = 'result-entry';
    form.innerHTML = '<div><small>RETURN A REAL RESULT</small><b>Log a campaign outcome</b></div><label>Client account<select name="clientId" required><option value="">Choose a client</option></select></label><label>Content name<input name="name" required maxlength="180" placeholder="Post or campaign name"></label><label>Observed %<input name="observed" required type="number" min="0" max="100" step="0.1" placeholder="3.2"></label><label>Baseline %<input name="baseline" type="number" min="0" max="100" step="0.1" placeholder="1.8"></label><label>Metric<select name="metric"><option>Save rate</option><option>Engagement rate</option><option>Click-through rate</option><option>Completion rate</option></select></label><label class="result-note">Notes<input name="note" maxlength="600" placeholder="Optional context"></label><button class="button button-small" type="submit">Save result</button>';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const clientId = activeClientId || form.elements.namedItem('clientId')?.value;
      if (!clientId) {
        toast('Choose a client before saving the outcome.');
        form.elements.namedItem('clientId')?.focus();
        return;
      }
      const submit = form.querySelector('[type=submit]');
      submit.disabled = true;
      try {
        await api.ready;
        const result = await api.post('/performance-results', { ...Object.fromEntries(new FormData(form)), clientId });
        window.SYNTARA_STATE.performanceResults.unshift(result);
        renderPerformanceResults(window.SYNTARA_STATE.performanceResults);
        form.reset();
        toast('Performance result saved. It will be available in the learning loop.');
      } catch (error) { report(error); }
      finally { submit.disabled = false; }
    });
    board.after(form);
  };

  const status = createStatusPanel();
  mountPerformanceForm();

  api.get('/health').then(() => status?.(true)).catch(() => status?.(false));
  api.ready = api.get('/state').then((state) => { hydrate(state); return state; }).catch((error) => { status?.(false); report(error); throw error; });
  api.ready.catch(() => {});

  document.querySelectorAll('.theme-tab').forEach((button) => button.addEventListener('click', () => {
    api.patch('/preferences', { selectedTheme: button.dataset.theme }).then((preferences) => {
      if (window.SYNTARA_STATE) window.SYNTARA_STATE.preferences = preferences;
    }).catch(report);
  }));
  document.querySelectorAll('.competitor-tab').forEach((button) => button.addEventListener('click', () => {
    api.patch('/preferences', { selectedCompetitor: button.dataset.competitor }).then((preferences) => {
      if (window.SYNTARA_STATE) window.SYNTARA_STATE.preferences = preferences;
    }).catch(report);
  }));
  const persistPreference = (key, value) => {
    if (!value || window.SYNTARA_STATE?.preferences?.[key] === value) return;
    api.patch('/preferences', { [key]: value }).then((preferences) => {
      if (window.SYNTARA_STATE) window.SYNTARA_STATE.preferences = preferences;
    }).catch(report);
  };
  document.querySelectorAll('.land-node').forEach((button) => button.addEventListener('click', () => persistPreference('selectedLandscape', button.dataset.land)));
  document.querySelectorAll('.format-button').forEach((button) => button.addEventListener('click', () => persistPreference('selectedFormat', button.dataset.format)));
  document.querySelectorAll('.studio-pillar').forEach((button) => button.addEventListener('click', () => persistPreference('selectedPillar', button.dataset.pillar)));
  document.querySelectorAll('.performance-item').forEach((button) => button.addEventListener('click', () => persistPreference('selectedPerformance', button.dataset.performance)));
  document.querySelectorAll('.generate-plan').forEach((button) => button.addEventListener('click', async () => {
    const clientId = activeClientId || document.querySelector('#plan-client')?.value;
    if (!clientId) {
      toast('Choose a client before saving the campaign.');
      document.querySelector('#plan-client')?.focus();
      return;
    }
    const payload = {
      clientId,
      objective: document.querySelector('#plan-objective')?.value.trim(),
      audience: document.querySelector('#plan-audience')?.value.trim(),
      durationWeeks: Number.parseInt(document.querySelector('#plan-duration')?.value, 10),
      channel: document.querySelector('#plan-channel')?.value,
      opportunity: document.querySelector('#plan-opportunity')?.value,
      tone: document.querySelector('#plan-tone')?.value,
      hook: document.querySelector('#plan-hook')?.textContent?.replace(/[“”]/g, ''),
    };
    button.disabled = true;
    try {
      await api.ready;
      const editingId = window.SYNTARA_STATE.editingCampaignId;
      const campaign = editingId
        ? await api.patch(`/campaigns/${encodeURIComponent(editingId)}`, { ...payload, hooks: [payload.hook].filter(Boolean) })
        : await api.post('/campaigns', payload);
      if (editingId) {
        window.SYNTARA_STATE.campaigns = window.SYNTARA_STATE.campaigns.map((item) => item.id === editingId ? campaign : item);
        delete window.SYNTARA_STATE.editingCampaignId;
      } else window.SYNTARA_STATE.campaigns.unshift(campaign);
      window.SYNTARA_STATE.campaign = campaign;
      renderCampaignList(window.SYNTARA_STATE.campaigns);
      document.querySelector('#plan-ready')?.replaceChildren(document.createTextNode(editingId ? 'CHANGES SAVED TO LOCAL WORKSPACE' : 'SAVED TO LOCAL WORKSPACE'));
      button.textContent = 'Shape campaign draft ↗';
      toast(editingId ? 'Campaign changes saved to the workspace.' : 'Campaign draft saved. Review it before scheduling anything.');
    } catch (error) { report(error); }
    finally { button.disabled = false; }
  }));

  document.querySelector('#plan-client')?.addEventListener('change', (event) => {
    const client = window.SYNTARA_STATE?.clients?.find((item) => item.id === event.target.value);
    if (!client) return;
    const objective = document.querySelector('#plan-objective');
    const audience = document.querySelector('#plan-audience');
    if (objective && client.goal) objective.value = client.goal;
    if (audience && client.audience) audience.value = client.audience;
  });

  document.querySelectorAll('.command-prompt').forEach((button) => button.addEventListener('click', async () => {
    const title = document.querySelector('#command-title');
    const response = document.querySelector('#command-response');
    const source = document.querySelector('#command-source');
    button.setAttribute('aria-busy', 'true');
    try {
      const answer = await api.post('/command', { query: Number(button.dataset.query) });
      if (title) title.textContent = answer.title;
      if (response) response.textContent = answer.response;
      if (source) source.textContent = answer.source;
      toast('Answer refreshed from workspace data.');
    } catch (error) { report(error); }
    finally { button.removeAttribute('aria-busy'); }
  }));

  document.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('[data-campaign-action]');
    if (!actionButton) return;
    const { campaignAction: action, campaignId: id } = actionButton.dataset;
    const campaign = window.SYNTARA_STATE?.campaigns?.find((item) => item.id === id);
    if (action === 'load' && campaign) return fillCampaign(campaign);
    actionButton.disabled = true;
    try {
      if (action === 'review') {
        const updated = await api.post(`/campaigns/${encodeURIComponent(id)}/review`);
        window.SYNTARA_STATE.campaigns = window.SYNTARA_STATE.campaigns.map((item) => item.id === id ? updated : item);
        renderCampaignList(window.SYNTARA_STATE.campaigns);
        toast('Marked ready for your team to review. Nothing was published.');
      } else if (action === 'archive') {
        const result = await api.remove(`/campaigns/${encodeURIComponent(id)}`);
        window.SYNTARA_STATE.campaigns = window.SYNTARA_STATE.campaigns.filter((item) => item.id !== id);
        window.SYNTARA_STATE.archivedCampaigns.unshift(result.campaign);
        renderCampaignList(window.SYNTARA_STATE.campaigns);
        toast('Campaign archived. You can restore it below.');
      } else if (action === 'restore') {
        const restored = await api.post(`/campaigns/${encodeURIComponent(id)}/restore`);
        window.SYNTARA_STATE.archivedCampaigns = window.SYNTARA_STATE.archivedCampaigns.filter((item) => item.id !== id);
        window.SYNTARA_STATE.campaigns.unshift(restored);
        renderCampaignList(window.SYNTARA_STATE.campaigns);
        toast('Campaign restored to your saved drafts.');
      }
    } catch (error) { report(error); }
    finally { actionButton.disabled = false; }
  });

  document.querySelector('.approve-button')?.addEventListener('click', async () => {
    try {
      await api.ready;
      const id = window.SYNTARA_STATE?.campaigns?.[0]?.id;
      if (!id) throw new Error('Save a campaign draft before requesting review.');
      const updated = await api.post(`/campaigns/${encodeURIComponent(id)}/review`);
      window.SYNTARA_STATE.campaigns[0] = updated;
      renderCampaignList(window.SYNTARA_STATE.campaigns);
      toast('Review requested in your workspace. No content was published.');
    } catch (error) { report(error); }
  });

  document.querySelector('.recommendation-card [data-rec="dismiss"]')?.addEventListener('click', () => {
    api.patch('/recommendations/opp-education-01', { status: 'dismissed' }).then((item) => {
      Object.assign(window.SYNTARA_STATE.recommendations[0], item);
    }).catch(report);
  });
  document.querySelector('.save-modification')?.addEventListener('click', () => {
    const note = document.querySelector('#rec-note')?.value.trim();
    if (!note) return;
    api.patch('/recommendations/opp-education-01', { status: 'modified', note }).then((item) => {
      Object.assign(window.SYNTARA_STATE.recommendations[0], item);
      toast('Recommendation direction saved to the workspace.');
    }).catch(report);
  });

  document.addEventListener('drop', async (event) => {
    const slot = event.target.closest('.cal-days > span');
    const card = document.querySelector('.calendar-item.dragging');
    if (!slot || !card?.dataset.calendarId) return;
    try {
      await api.ready;
      const item = await api.patch(`/calendar/${encodeURIComponent(card.dataset.calendarId)}`, { day: slot.dataset.day });
      const saved = window.SYNTARA_STATE.calendar.find((entry) => entry.id === item.id);
      Object.assign(saved, item);
      toast(`Calendar move saved for ${slot.querySelector('small')?.textContent || item.day}.`);
    } catch (error) { report(error); }
  }, true);

  document.querySelector('.studio-copy-button')?.addEventListener('click', async () => {
    const concept = [document.querySelector('#studio-hook')?.textContent, document.querySelector('#studio-structure')?.textContent, document.querySelector('#studio-visual')?.textContent].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(concept);
      toast('Creative direction copied to the clipboard.');
    } catch { toast('Clipboard access is unavailable in this browser. Select and copy the concept text.'); }
  });

  document.querySelectorAll('.workspace-top > button').forEach((button) => button.addEventListener('click', () => {
    let menu = document.querySelector('.campaign-more-menu');
    if (menu) { menu.remove(); return; }
    menu = document.createElement('div');
    menu.className = 'campaign-more-menu';
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = 'Copy campaign brief';
    copyButton.addEventListener('click', async () => {
      const brief = `${document.querySelector('#campaign-title')?.innerText || ''}\n${document.querySelector('#campaign-desc')?.textContent || ''}`;
      try { await navigator.clipboard.writeText(brief); toast('Campaign brief copied.'); }
      catch { toast('Clipboard access is unavailable in this browser.'); }
      menu.remove();
    });
    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.textContent = 'Export workspace data';
    exportButton.addEventListener('click', async () => {
      try {
        const state = await api.get('/state');
        const file = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'syntara-workspace.json';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Workspace data exported.');
      } catch (error) { report(error); }
      menu.remove();
    });
    menu.append(copyButton, exportButton);
    button.parentElement.append(menu);
  }));

  document.addEventListener('click', (event) => {
    const interactive = event.target.closest('.node,.theme-tab,.competitor-tab,.land-node,.format-button,.studio-pillar,.performance-item,.command-prompt,.alert-action,.build-trigger,.opportunity-build,.rec-build');
    if (!interactive) return;
    api.post('/activity', { type: 'workspace_interaction', detail: { control: interactive.className?.toString?.() || interactive.tagName, label: interactive.textContent?.trim().slice(0, 100) } }, { keepalive: true }).catch(() => {});
  }, true);

  const formHelp = document.createElement('div');
  formHelp.className = 'backend-live-region';
  formHelp.setAttribute('role', 'status');
  formHelp.setAttribute('aria-live', 'polite');
  document.body.append(formHelp);
})();

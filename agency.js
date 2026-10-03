(() => {
  const api = window.SYNTARA_API;
  const $ = (selector, root = document) => root.querySelector(selector);
  const toast = $('.toast');
  const form = $('.client-form');
  const grid = $('#client-grid');
  const openButtons = document.querySelectorAll('[data-open-client-form]');
  const dataNote = $('#agency-data-note');
  if (dataNote && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    dataNote.textContent = 'Render Free storage is temporary · use sample data only';
  }
  let clients = [];
  let campaigns = [];
  let results = [];

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2800);
  };

  const setBusy = (busy) => {
    form?.querySelector('[type="submit"]')?.toggleAttribute('disabled', busy);
  };

  const openForm = (client = null) => {
    if (!form) return;
    form.hidden = false;
    $('#client-form-title').textContent = client ? 'Edit client details' : 'Add a client';
    for (const key of ['id', 'name', 'industry', 'goal', 'audience', 'services', 'owner', 'website']) {
      form.elements.namedItem(key).value = client?.[key] || '';
    }
    const submit = form.querySelector('[type="submit"]');
    submit.textContent = client ? 'Save changes ↗' : 'Save client ↗';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.elements.namedItem('name').focus({ preventScroll: true });
  };

  const closeForm = () => {
    form.hidden = true;
    form.reset();
    form.elements.namedItem('id').value = '';
    $('#client-form-title').textContent = 'Add a client';
  };

  const clientLink = (page, clientId, anchor) => `${page}?clientId=${encodeURIComponent(clientId)}#${anchor}`;

  const createClientCard = (client) => {
    const card = document.createElement('article');
    card.className = 'client-card';

    const top = document.createElement('div');
    top.className = 'client-card-top';
    const identity = document.createElement('div');
    identity.className = 'client-card-name';
    const kicker = document.createElement('span');
    kicker.className = 'client-card-kicker';
    kicker.textContent = client.owner ? `ACCOUNT LEAD · ${client.owner}` : 'CLIENT ACCOUNT';
    const name = document.createElement('h3');
    name.textContent = client.name;
    const industry = document.createElement('span');
    industry.className = 'client-industry';
    industry.textContent = client.industry || 'Industry not set';
    identity.append(kicker, name, industry);
    const status = document.createElement('span');
    status.className = 'client-status';
    status.textContent = 'ACTIVE';
    top.append(identity, status);

    const goal = document.createElement('p');
    goal.className = 'client-goal';
    const goalLabel = document.createElement('strong');
    goalLabel.textContent = 'CLIENT GOAL';
    goal.append(goalLabel, document.createTextNode(client.goal || 'Add the business outcome this account is working toward.'));

    const audience = document.createElement('p');
    audience.className = 'client-audience';
    audience.textContent = client.audience ? `Audience · ${client.audience}` : 'Target audience not set';

    const clientCampaigns = campaigns.filter((item) => item.clientId === client.id);
    const reviewCount = clientCampaigns.filter((item) => item.reviewStatus === 'ready_for_review').length;
    const clientResults = results.filter((item) => item.clientId === client.id);
    const facts = document.createElement('div');
    facts.className = 'client-facts';
    for (const [label, value] of [
      ['CAMPAIGN DRAFTS', clientCampaigns.length],
      ['NEEDS REVIEW', reviewCount],
      ['RESULTS LOGGED', clientResults.length],
    ]) {
      const item = document.createElement('div');
      const small = document.createElement('small');
      small.textContent = label;
      const number = document.createElement('b');
      number.textContent = value;
      item.append(small, number);
      facts.append(item);
    }

    const actions = document.createElement('div');
    actions.className = 'client-card-actions';
    const campaignLink = document.createElement('a');
    campaignLink.href = clientLink('campaigns.html', client.id, 'campaign-planner');
    campaignLink.textContent = 'Plan campaign ↗';
    const resultsLink = document.createElement('a');
    resultsLink.href = clientLink('performance.html', client.id, 'performance-learning');
    resultsLink.textContent = 'Review results ↗';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.dataset.clientAction = 'edit';
    edit.dataset.clientId = client.id;
    edit.textContent = 'Edit';
    const archive = document.createElement('button');
    archive.type = 'button';
    archive.dataset.clientAction = 'archive';
    archive.dataset.clientId = client.id;
    archive.textContent = 'Archive';
    actions.append(campaignLink, resultsLink, edit, archive);

    card.append(top, goal, audience, facts, actions);
    return card;
  };

  const render = () => {
    const active = clients.filter((client) => client.status !== 'archived');
    const archived = clients.filter((client) => client.status === 'archived');
    $('#stat-clients').textContent = active.length;
    $('#stat-reviews').textContent = campaigns.filter((item) => item.clientId && item.reviewStatus === 'ready_for_review' && active.some((client) => client.id === item.clientId)).length;
    $('#stat-results').textContent = results.filter((item) => item.clientId && active.some((client) => client.id === item.clientId)).length;
    $('#portfolio-updated').textContent = `${active.length} active account${active.length === 1 ? '' : 's'} · campaign and result counts are saved locally`;

    grid.replaceChildren(...active.map(createClientCard));
    $('#client-empty').hidden = active.length > 0;

    const archivePanel = $('#archived-clients');
    archivePanel.hidden = archived.length === 0;
    $('#archived-count').textContent = archived.length ? `· ${archived.length}` : '';
    const archiveList = $('#archived-client-list');
    archiveList.replaceChildren(...archived.map((client) => {
      const row = document.createElement('div');
      row.className = 'archived-client-row';
      const label = document.createElement('span');
      label.textContent = client.name;
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.dataset.clientAction = 'restore';
      restore.dataset.clientId = client.id;
      restore.textContent = 'Restore';
      row.append(label, restore);
      return row;
    }));
  };

  const load = async () => {
    const [allClients, state] = await Promise.all([
      api.get('/clients?includeArchived=true'),
      api.get('/state'),
    ]);
    clients = allClients;
    campaigns = state.campaigns || [];
    results = state.performanceResults || [];
    render();
  };

  openButtons.forEach((button) => button.addEventListener('click', () => openForm()));
  $('.client-form-close')?.addEventListener('click', closeForm);
  $('[data-cancel-client]')?.addEventListener('click', closeForm);
  window.addEventListener('hashchange', () => {
    if (location.hash === '#add-client') openForm();
  });
  if (location.hash === '#add-client') openForm();

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const id = values.id;
    delete values.id;
    setBusy(true);
    try {
      if (id) await api.patch(`/clients/${encodeURIComponent(id)}`, values);
      else await api.post('/clients', values);
      await load();
      closeForm();
      showToast(id ? 'Client details saved.' : 'Client added to your portfolio.');
    } catch (error) {
      showToast(error.message || 'Could not save this client. Please retry.');
    } finally {
      setBusy(false);
    }
  });

  grid?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-client-action]');
    if (!button) return;
    const client = clients.find((item) => item.id === button.dataset.clientId);
    if (!client) return;
    if (button.dataset.clientAction === 'edit') return openForm(client);
    button.disabled = true;
    try {
      await api.post(`/clients/${encodeURIComponent(client.id)}/archive`);
      await load();
      showToast(`${client.name} archived. You can restore it below.`);
    } catch (error) {
      showToast(error.message || 'Could not archive this client. Please retry.');
      button.disabled = false;
    }
  });

  $('#archived-client-list')?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-client-action="restore"]');
    if (!button) return;
    button.disabled = true;
    try {
      await api.post(`/clients/${encodeURIComponent(button.dataset.clientId)}/restore`);
      await load();
      showToast('Client restored to your portfolio.');
    } catch (error) {
      showToast(error.message || 'Could not restore this client. Please retry.');
      button.disabled = false;
    }
  });

  const header = $('.topbar');
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 25), { passive: true });
  const menu = $('.menu-button');
  menu?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '×' : '☰';
  });
  document.querySelectorAll('.topbar nav a').forEach((link) => link.addEventListener('click', () => {
    header?.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = '☰';
  }));

  load().catch((error) => {
    $('#portfolio-updated').textContent = 'Workspace offline · start or reconnect the local server';
    $('#client-empty').hidden = false;
    showToast(error.message || 'Could not load the client portfolio.');
  });
})();

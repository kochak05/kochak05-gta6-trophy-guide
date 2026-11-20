// Leonida Trophy Guide — tracker for the 55 GTA VI trophies on PS5.
// Loads app/data/trophies.json, saves earned ticks in localStorage, exports
// and imports them as a file, filters by kind and grade, and hides story
// trophies while the spoiler setting is on until they are earned.
const SAVE_KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';
const DEMO_EARNED_IDS = [2, 3, 4, 8, 15, 20, 28, 31, 35, 42, 52, 53];

const listEl = document.getElementById('trophyList');
const stagesEl = document.getElementById('stages');
const kindFiltersEl = document.getElementById('kindFilters');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const statusEl = document.getElementById('status');
const emptyEl = document.getElementById('emptyState');
const headingEl = document.getElementById('listHeading');

let trophies = [];
let roadmap = [];
let earned = new Set();
let spoilerOn = false;
let kindFilter = 'all';
let gradeFilter = 'all';
let query = '';

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (saved && Array.isArray(saved.earned)) earned = new Set(saved.earned);
    if (saved && typeof saved.spoiler === 'boolean') spoilerOn = saved.spoiler;
  } catch {
    earned = new Set();
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ earned: [...earned], spoiler: spoilerOn }));
}

function applyDemoSeed() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') !== '1') return;
  if (localStorage.getItem(SAVE_KEY)) return;
  const byId = new Map(trophies.map((t) => [t.id, t]));
  earned = new Set(DEMO_EARNED_IDS.map((id) => byId.get(id).name).filter(Boolean));
  saveProgress();
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  const doc = await response.json();
  trophies = doc.trophies;
  roadmap = doc.roadmap ?? [];
}

function kindCounts() {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    if (t.kind === 'story') counts.story += 1;
    if (t.kind === 'collectibles') counts.collectibles += 1;
    if (t.kind === 'activities') counts.activities += 1;
    if (t.missable) counts.missable += 1;
  }
  return counts;
}

function renderKindFilters() {
  const counts = kindCounts();
  const kinds = [
    ['all', 'All'],
    ['story', 'Story'],
    ['missable', 'Missable'],
    ['collectibles', 'Collectibles'],
    ['activities', 'Activities'],
    ['online', 'Online'],
  ];
  kindFiltersEl.replaceChildren();
  for (const [kind, label] of kinds) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${label} (${counts[kind]})`;
    button.setAttribute('aria-pressed', String(kindFilter === kind));
    button.addEventListener('click', () => {
      kindFilter = kind;
      renderKindFilters();
      renderTrophyList();
    });
    kindFiltersEl.append(button);
  }
}

function trophyMatches(t) {
  if (kindFilter === 'story' && t.kind !== 'story') return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (kindFilter === 'activities' && t.kind !== 'activities') return false;
  if (kindFilter === 'online') return false;
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (query) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function gradeBadge(t) {
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  return badge;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card';
  card.id = `trophy-${t.id}`;
  const isEarned = earned.has(t.name);
  if (isEarned) card.classList.add('earned');
  if (t.missable) card.classList.add('flagged');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveProgress();
    renderTrophyList();
    updateProgress();
  });
  card.append(box);

  const body = document.createElement('div');
  const hiddenBySpoiler = spoilerOn && t.kind === 'story' && !isEarned;
  const head = document.createElement('div');
  head.className = 'card-head';
  if (hiddenBySpoiler) {
    const name = document.createElement('h3');
    name.textContent = 'Hidden story trophy';
    head.append(name, gradeBadge(t));
  } else {
    const name = document.createElement('h3');
    name.textContent = t.name;
    head.append(name, gradeBadge(t));
  }
  body.append(head);

  if (hiddenBySpoiler) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Its name and description stay hidden until you earn it. Turn “Hide story spoilers” off to reveal it.';
    body.append(note);
  } else {
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = t.description;
    body.append(desc);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = t.kind === 'other' ? 'open world' : t.kind;
    meta.append(kindTag);
    if (t.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-tag';
      hiddenTag.textContent = 'hidden on PS5';
      meta.append(hiddenTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Possibly missable';
      meta.append(missTag);
    }
    if (t.count != null) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = `Count: ${t.count.toLocaleString('en-US')}`;
      meta.append(countTag);
    }
    body.append(meta);

    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    body.append(guide);

    const sources = document.createElement('p');
    sources.className = 'sources';
    const label = document.createElement('strong');
    label.textContent = 'Sources: ';
    sources.append(label, document.createTextNode(t.sources.join(' · ')));
    body.append(sources);

    const stage = roadmap.find((s) => s.stage === t.stage);
    if (stage) {
      const stageNote = document.createElement('p');
      stageNote.className = 'stage-note';
      stageNote.textContent = `Roadmap: ${stage.title}`;
      body.append(stageNote);
    }
  }
  card.append(body);
  return card;
}

function renderTrophyList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyCard(t));
  headingEl.textContent = kindFilter === 'all' && gradeFilter === 'all' && !query
    ? 'All 55 trophies'
    : `Showing ${shown.length} of 55 trophies`;
  if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = kindFilter === 'online'
      ? 'No online trophies — all 55 are single-player, so there is nothing to track here.'
      : 'No trophies match these filters. Clear the search or pick another kind.';
  } else {
    emptyEl.hidden = true;
  }
}

function updateProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progressCount').textContent = `${done} / ${total} earned`;
  document.getElementById('progressPct').textContent = `${Math.round((done / total) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(done / total) * 100}%`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  const counts = document.getElementById('gradeCounts');
  counts.replaceChildren();
  for (const g of grades) {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${g[0].toUpperCase()}${g.slice(1)} `;
    const value = document.createElement('b');
    value.textContent = `${have}/${all}`;
    li.append(label, value);
    counts.append(li);
  }
}

function renderRoadmap() {
  stagesEl.replaceChildren();
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const stage of roadmap) {
    const article = document.createElement('article');
    article.className = 'stage';
    const title = document.createElement('h3');
    title.textContent = `Step ${stage.stage}: ${stage.title}`;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = earned.has(t.name) ? `✓ ${t.name}` : t.name;
      chips.append(chip);
    }
    article.append(title, text, chips);
    stagesEl.append(article);
  }
}

function exportProgress() {
  const payload = { app: 'leonida-trophy-guide', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  statusEl.textContent = `Exported ${earned.size} earned trophies.`;
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const good = names.filter((n) => known.has(n));
    earned = new Set(good);
    saveProgress();
    renderTrophyList();
    updateProgress();
    renderRoadmap();
    statusEl.textContent = `Imported ${good.length} earned trophies (${names.length - good.length} names not recognised).`;
  } catch {
    statusEl.textContent = 'That file could not be imported — it is not a progress export from this guide.';
  }
}

function resetProgress() {
  earned = new Set();
  saveProgress();
  renderTrophyList();
  updateProgress();
  renderRoadmap();
  statusEl.textContent = 'Progress cleared.';
}

function applySpoilerMode() {
  spoilerEl.checked = spoilerOn;
  renderTrophyList();
}

function applyHashState() {
  // A ?q= search pre-fills the search box, so a filtered view (for example one
  // trophy's guide) opens at the top of the page with no scrolling needed.
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) {
    query = q.trim().toLowerCase();
    searchEl.value = q;
    renderTrophyList();
  }
  const hash = location.hash;
  if (hash === '#spoiler') {
    spoilerOn = true;
    saveProgress();
    applySpoilerMode();
    window.scrollTo(0, 0);
    return;
  }
  // #roadmap is a plain fragment: the browser scrolls to the section itself.
  const match = hash.match(/^#trophy-(\d+)$/);
  if (match) {
    const card = document.getElementById(`trophy-${match[1]}`);
    if (card) {
      card.classList.add('highlight');
      card.scrollIntoView({ block: 'center' });
    }
  }
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', resetProgress);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveProgress();
  applySpoilerMode();
});
gradeEl.addEventListener('change', () => {
  gradeFilter = gradeEl.value;
  renderTrophyList();
});
searchEl.addEventListener('input', () => {
  query = searchEl.value.trim().toLowerCase();
  renderTrophyList();
});

loadSavedState();
await loadTrophies();
applyDemoSeed();
spoilerEl.checked = spoilerOn;
renderKindFilters();
renderRoadmap();
renderTrophyList();
updateProgress();
applyHashState();

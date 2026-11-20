const STORE_KEY = "leonida-trophy-guide-progress-v1";
const SPOILER_KEY = "leonida-trophy-guide-spoilers-v1";
const DEMO_EARNED = [
  "just-like-paradise", "paradise-lost", "master-of-none", "top-fun",
  "baited-my-tackle", "stick-fiddler", "whip-it-good", "treat-yo-self",
  "on-the-spot", "one-last-thing", "cunning-stunts", "earn-cash-not-kudos"
];

let trophies = [];
let earned = new Set();
let activeFilter = "all";
let query = "";
let spoilersOn = false;

const listEl = document.getElementById("trophyList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const filterNote = document.getElementById("filterNote");
const searchEl = document.getElementById("search");
const spoilerToggle = document.getElementById("spoilerToggle");
const detailEl = document.getElementById("detail");

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) earned = new Set(JSON.parse(raw).filter((id) => typeof id === "string"));
  } catch (e) { earned = new Set(); }
  try { spoilersOn = localStorage.getItem(SPOILER_KEY) === "1"; } catch (e) { spoilersOn = false; }
}

function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort())); } catch (e) {}
  try { localStorage.setItem(SPOILER_KEY, spoilersOn ? "1" : "0"); } catch (e) {}
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(t) {
  return t.kind.charAt(0).toUpperCase() + t.kind.slice(1);
}

function trophyHidden(t) {
  return spoilersOn && t.kind === "story" && !earned.has(t.id);
}

function visibleTrophies() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (activeFilter === "story" && t.kind !== "story") return false;
    if (activeFilter === "missable" && !t.missable) return false;
    if (activeFilter === "collectibles" && t.kind !== "collectibles") return false;
    if (activeFilter === "activities" && t.kind !== "activities") return false;
    if (activeFilter === "online") return false;
    if (activeFilter === "earned" && !earned.has(t.id)) return false;
    if (activeFilter === "todo" && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide + " " + t.sources.join(" ")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  const pct = Math.round((n / total) * 100);
  progressFill.style.width = pct + "%";
  progressText.textContent = n + " of " + total + " earned · " + pct + "%";
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = "";
  if (activeFilter === "online") {
    filterNote.textContent = "No online trophies in this list — all 55 are single-player.";
  } else if (shown.length === 0) {
    filterNote.textContent = "No trophies match this filter.";
  } else {
    filterNote.textContent = "Showing " + shown.length + " of " + trophies.length + " trophies.";
  }
  for (const t of shown) {
    const li = document.createElement("li");
    if (earned.has(t.id)) li.classList.add("earned");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", "Mark " + t.name + " earned");
    box.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleEarned(t.id);
    });
    const body = document.createElement("div");
    body.className = "trophy-body";
    const name = document.createElement("p");
    name.className = "trophy-name";
    name.textContent = trophyHidden(t) ? "Hidden story trophy" : t.name;
    const desc = document.createElement("p");
    desc.className = "trophy-desc";
    desc.textContent = trophyHidden(t) ? "Earn it to reveal the name and description." : t.description;
    const tags = document.createElement("p");
    tags.className = "trophy-tags";
    // A hidden story trophy's grade would give it away (the only gold
    // story trophy is the final mission), so it stays hidden with the name.
    if (!trophyHidden(t)) {
      const grade = document.createElement("span");
      grade.className = "tag grade-" + t.grade;
      grade.textContent = gradeLabel(t);
      tags.appendChild(grade);
    }
    const kind = document.createElement("span");
    kind.className = "tag";
    kind.textContent = kindLabel(t);
    tags.appendChild(kind);
    if (t.hidden) {
      const h = document.createElement("span");
      h.className = "tag hidden-tag";
      h.textContent = "Hidden on PS";
      tags.appendChild(h);
    }
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "tag missable";
      m.textContent = "Missable";
      tags.appendChild(m);
    }
    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(tags);
    li.appendChild(box);
    li.appendChild(body);
    li.addEventListener("click", () => openDetail(t.id));
    listEl.appendChild(li);
  }
  renderProgress();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveProgress();
  renderList();
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  const hidden = trophyHidden(t);
  document.getElementById("detailName").textContent = hidden ? "Hidden story trophy" : t.name;
  document.getElementById("detailMeta").textContent = gradeLabel(t) + " · " + kindLabel(t) + (t.hidden ? " · Hidden on PlayStation" : "") + (earned.has(t.id) ? " · Earned" : " · Not earned yet");
  document.getElementById("detailDesc").textContent = hidden ? "Earn this trophy to reveal its official name and description." : t.description;
  document.getElementById("detailMissable").hidden = !t.missable || hidden;
  // Spoiler mode hides the guide too: a story trophy's guide names its
  // mission, so showing it would spoil the same thing the list hides.
  document.getElementById("detailGuide").textContent = hidden ? "Earn this trophy to reveal its guide." : t.guide;
  document.getElementById("detailSources").textContent = hidden ? "" : "Sources: " + t.sources.join("; ") + ".";
  detailEl.hidden = false;
  detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeDetail() {
  detailEl.hidden = true;
}

function exportProgress() {
  const data = JSON.stringify({ app: "leonida-trophy-guide", earned: [...earned].sort() }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set((ids || []).filter((id) => valid.has(id)));
      saveProgress();
      renderList();
    } catch (e) {
      filterNote.textContent = "That file could not be read as progress. Export first to get the right format.";
    }
  };
  reader.readAsText(file);
}

function applyParams() {
  const params = new URLSearchParams(location.search);
  if (params.get("demo") === "1" && earned.size === 0) {
    earned = new Set(DEMO_EARNED);
    saveProgress();
  }
  if (params.get("spoilers") === "1") spoilersOn = true;
  const kind = params.get("kind");
  if (kind) {
    const btn = document.querySelector('#filters button[data-filter="' + kind + '"]');
    if (btn) {
      document.querySelectorAll("#filters button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = kind;
    }
  }
  spoilerToggle.checked = spoilersOn;
}

async function init() {
  loadProgress();
  applyParams();
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  trophies = data.trophies || data;
  searchEl.addEventListener("input", () => { query = searchEl.value; renderList(); });
  document.getElementById("filters").addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-filter]");
    if (!btn) return;
    document.querySelectorAll("#filters button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderList();
  });
  spoilerToggle.addEventListener("change", () => {
    spoilersOn = spoilerToggle.checked;
    saveProgress();
    renderList();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", (ev) => {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    earned = new Set();
    saveProgress();
    renderList();
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  renderList();
  const params = new URLSearchParams(location.search);
  const openId = params.get("open");
  if (openId) openDetail(openId);
  if (params.get("view") === "roadmap") {
    document.getElementById("roadmap").scrollIntoView();
  }
}

init();

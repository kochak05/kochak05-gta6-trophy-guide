/* Leonida Trophy Guide — tracker logic. No network at run time: the only
   request the page makes is a relative fetch of its own data file. */
(function () {
  'use strict';

  var LS_KEY = 'leonida-trophy-guide-v1';
  var DATA_URL = 'data/trophies.json';

  var DEMO_EARNED = [
    'just-like-paradise', 'paradise-lost', 'trust', 'master-of-none',
    'stick-fiddler', 'whip-it-good', 'treat-yo-self', 'on-the-spot',
    'the-shootist', 'top-fun', 'earn-cash-not-kudos', 'baited-my-tackle'
  ];

  /* The road to the platinum, in the order that wastes the least time. */
  var ROADMAP = [
    {
      title: 'Play the story — and protect one meditation',
      text: 'Play all five chapters in order. Story trophies pop as you go, and free roam stays open afterwards, so nothing here can be missed — except one thing.',
      points: [
        'After the mission Down to Earth, follow Lucia to the balcony and meditate before Chapter 1 ends.',
        'Keep a manual save at the start of each chapter; there is no mission replay.',
        'Scan vehicles and study animals as you travel — the 100% checklist counts them later.'
      ]
    },
    {
      title: 'Side strands and character finales',
      text: 'Clear the stranger strands and the five character questlines while the map is open to you.',
      points: [
        'Finish 8 Strangers & Freaks strands.',
        'Final missions: Andy (Lucia only, from Chapter 3), Kenton, Billy, Randy, Tyrone.',
        'Hunt Bret’s unique animal; finish his 15 Target Deck objectives.'
      ]
    },
    {
      title: 'The 100% checklist',
      text: 'Open Progress, then Stats, then 100% Completion, and work down its numbers. Stop each activity the moment its number is met.',
      points: [
        'Robberies: 39 gang operations, 22 bank jobs, 7 payday loan jobs, 8 of 8 vaults, $250,000 marked bills fenced.',
        'Collecting: 15 of 18 card sets, 100 WAiNK scans, 33 underwater finds, 100 of 125 flamingos, 200 of 277 vehicles, 100 of 255 animals.',
        'Activities: 30 of 40 races won, all 42 shooting-range golds, 42 of 42 drone trials, 300 of 397 stunts, 70 of 80 challenges.'
      ]
    },
    {
      title: 'Cleanup and the platinum',
      text: 'Sweep up whatever is left, then watch the platinum land.',
      points: [
        'Finish all 18 meditations for Positive Mental Attitude.',
        'Spend, rob and collect the remainders: garages, shops, vaults, gangs.',
        'Vice Got a Price! pops on the last trophy you earn.'
      ]
    }
  ];

  var trophies = [];
  var earned = new Set();
  var kindFilter = 'all';
  var query = '';
  var hideSpoilers = false;
  var openSlug = null;

  var listEl, countEl, progressText, progressPct, progressFill, progressSub;

  function slugOf(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function loadEarned() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach(function (s) { earned.add(s); });
    } catch (e) { /* a corrupt save is ignored; the checklist just starts empty */ }
  }

  function saveEarned() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(earned))); } catch (e) { /* storage full or blocked: progress stays for this visit */ }
  }

  function gradeLabel(t) {
    return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
  }

  function isStoryHidden(t) {
    return hideSpoilers && t.kind === 'story' && !earned.has(slugOf(t.name));
  }

  function matches(t) {
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter === 'earned' && !earned.has(slugOf(t.name))) return false;
    if (kindFilter === 'todo' && earned.has(slugOf(t.name))) return false;
    if (kindFilter !== 'all' && kindFilter !== 'missable' && kindFilter !== 'earned' && kindFilter !== 'todo' && t.kind !== kindFilter) return false;
    if (query) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.sources || []).join(' ')).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function renderProgress() {
    var done = trophies.filter(function (t) { return earned.has(slugOf(t.name)); }).length;
    var total = trophies.length || 55;
    var pct = total ? Math.round((done / total) * 100) : 0;
    progressText.textContent = done + ' of ' + total + ' earned';
    progressPct.textContent = pct + '%';
    progressFill.style.width = pct + '%';
    progressSub.textContent = done === total
      ? 'Platinum earned: Vice Got a Price! — you are a Leonida Legend.'
      : 'Platinum: Vice Got a Price! — earn every other trophy.';
  }

  function renderRoadmap() {
    var stagesEl = document.getElementById('stages');
    stagesEl.innerHTML = '';
    ROADMAP.forEach(function (stage, i) {
      var div = document.createElement('div');
      div.className = 'stage';
      var h = document.createElement('h3');
      var num = document.createElement('span');
      num.className = 'stage-num';
      num.textContent = String(i + 1);
      h.appendChild(num);
      h.appendChild(document.createTextNode(stage.title));
      div.appendChild(h);
      var p = document.createElement('p');
      p.textContent = stage.text;
      div.appendChild(p);
      var ul = document.createElement('ul');
      stage.points.forEach(function (point) {
        var li = document.createElement('li');
        li.textContent = point;
        ul.appendChild(li);
      });
      div.appendChild(ul);
      stagesEl.appendChild(div);
    });
    var missable = trophies.find(function (t) { return t.missable; });
    document.getElementById('missable-text').textContent = missable
      ? 'Only one trophy can be missed: ' + missable.name + ' — do the first meditation (balcony with Lucia, Chapter 1) before Chapter 1 ends; the rest is safe.'
      : 'No trophy in this list is missable.';
  }

  function trophyCard(t) {
    var slug = slugOf(t.name);
    var li = document.createElement('li');
    li.className = 'trophy' + (earned.has(slug) ? ' earned' : '');
    li.id = 'trophy-' + slug;

    var head = document.createElement('div');
    head.className = 'trophy-head';

    var check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'trophy-check';
    check.checked = earned.has(slug);
    check.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    check.addEventListener('change', function () {
      if (check.checked) earned.add(slug); else earned.delete(slug);
      saveEarned();
      renderProgress();
      renderList();
    });
    head.appendChild(check);

    var main = document.createElement('div');
    main.className = 'trophy-main';

    var nameEl = document.createElement('div');
    nameEl.className = 'trophy-name';
    var descEl = document.createElement('div');
    descEl.className = 'trophy-desc';
    if (isStoryHidden(t)) {
      nameEl.textContent = 'Hidden story trophy';
      descEl.textContent = 'Hidden until earned — turn off “Hide story spoilers” to see it, or earn it in the game.';
      nameEl.classList.add('spoiler-hidden');
      descEl.classList.add('spoiler-hidden');
    } else {
      nameEl.textContent = t.name;
      descEl.textContent = t.description;
    }
    main.appendChild(nameEl);
    main.appendChild(descEl);

    var meta = document.createElement('div');
    meta.className = 'trophy-meta';
    var grade = document.createElement('span');
    grade.className = 'tag grade-' + t.grade;
    grade.textContent = gradeLabel(t);
    meta.appendChild(grade);
    var kind = document.createElement('span');
    kind.className = 'tag';
    kind.textContent = t.kind;
    meta.appendChild(kind);
    if (t.hidden) {
      var hid = document.createElement('span');
      hid.className = 'tag hidden';
      hid.textContent = 'Hidden on PSN';
      meta.appendChild(hid);
    }
    if (t.missable) {
      var mis = document.createElement('span');
      mis.className = 'tag missable';
      mis.textContent = 'Missable';
      meta.appendChild(mis);
    }
    if (t.target) {
      var tgt = document.createElement('span');
      tgt.className = 'tag';
      tgt.textContent = 'Target: ' + t.target.toLocaleString('en-US');
      meta.appendChild(tgt);
    }
    main.appendChild(meta);

    if (!isStoryHidden(t)) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'guide-toggle';
      toggle.textContent = openSlug === slug ? 'Hide guide' : 'Show guide';
      var guide = document.createElement('div');
      guide.className = 'guide';
      guide.hidden = openSlug !== slug;
      var gp = document.createElement('p');
      gp.textContent = t.guide;
      guide.appendChild(gp);
      if (t.missable && t.missable_note) {
        var mn = document.createElement('p');
        mn.className = 'missable-note';
        mn.textContent = 'Missable: ' + t.missable_note;
        guide.appendChild(mn);
      }
      var src = document.createElement('p');
      src.className = 'sources';
      src.innerHTML = '';
      var b = document.createElement('b');
      b.textContent = 'Sources: ';
      src.appendChild(b);
      src.appendChild(document.createTextNode((t.sources || []).join(' · ')));
      guide.appendChild(src);
      toggle.addEventListener('click', function () {
        var show = guide.hidden;
        guide.hidden = !show;
        toggle.textContent = show ? 'Hide guide' : 'Show guide';
      });
      main.appendChild(toggle);
      main.appendChild(guide);
    }

    head.appendChild(main);
    li.appendChild(head);
    return li;
  }

  function renderList() {
    var shown = trophies.filter(matches);
    listEl.innerHTML = '';
    shown.forEach(function (t) { listEl.appendChild(trophyCard(t)); });
    document.getElementById('empty').hidden = shown.length > 0;
    countEl.textContent = shown.length + ' of ' + trophies.length + ' shown';
  }

  function exportProgress() {
    var blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', earned: Array.from(earned).sort() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var arr = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(arr)) throw new Error('bad file');
        earned = new Set(arr.filter(function (s) { return typeof s === 'string'; }));
        saveEarned();
        renderProgress();
        renderList();
      } catch (e) {
        alert('That file is not a Leonida progress export.');
      }
    };
    reader.readAsText(file);
  }

  function applyParams() {
    var params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') {
      DEMO_EARNED.forEach(function (s) { earned.add(s); });
      saveEarned();
    }
    if (params.get('spoilers') === '1') {
      hideSpoilers = true;
      document.getElementById('spoilers').checked = true;
    }
    var kind = params.get('kind');
    if (kind) {
      kindFilter = kind;
      document.querySelectorAll('#filters button').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-kind') === kind);
      });
    }
    if (params.get('open')) openSlug = params.get('open');
    var view = params.get('view');
    if (view === 'roadmap') {
      setTimeout(function () { document.getElementById('roadmap').scrollIntoView(); }, 50);
    }
  }

  function init() {
    listEl = document.getElementById('trophy-list');
    countEl = document.getElementById('count');
    progressText = document.getElementById('progress-text');
    progressPct = document.getElementById('progress-pct');
    progressFill = document.getElementById('progress-fill');
    progressSub = document.getElementById('progress-sub');

    loadEarned();
    applyParams();

    document.getElementById('search').addEventListener('input', function (e) {
      query = e.target.value.trim().toLowerCase();
      renderList();
    });
    document.getElementById('filters').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-kind]');
      if (!btn) return;
      kindFilter = btn.getAttribute('data-kind');
      document.querySelectorAll('#filters button').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderList();
    });
    document.getElementById('spoilers').addEventListener('change', function (e) {
      hideSpoilers = e.target.checked;
      renderList();
    });
    document.getElementById('export-btn').addEventListener('click', exportProgress);
    document.getElementById('import-btn').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('reset-btn').addEventListener('click', function () {
      if (!confirm('Clear all earned trophies?')) return;
      earned.clear();
      saveEarned();
      renderProgress();
      renderList();
    });

    fetch(DATA_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        trophies = Array.isArray(data) ? data : data.trophies;
        renderRoadmap();
        renderProgress();
        renderList();
      })
      .catch(function () {
        listEl.innerHTML = '<li class="trophy">Could not load the trophy data. Open this guide from its own files (data/trophies.json sits beside it).</li>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

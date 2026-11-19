// Boot: loads the trophies, reads the URL for the initial state, wires the
// toolbar and the views, and keeps the checklist in sync with localStorage.
//
// URL parameters (so any state can be shown directly):
//   ?view=checklist|roadmap|missables   ?spoiler=1
//   ?filter=all|story|missable|collectibles|activities|online
//   ?grade=platinum|gold|silver|bronze  ?search=<text>
//   ?trophy=<id or name>                ?seed=<n> (mark the first n earned)

import { loadTrophies } from './data.js';
import { loadProgress, saveProgress, exportProgress, importProgressFile } from './store.js';
import { renderChecklist, renderMissables, renderRoadmap, openDetail, closeDetail } from './views.js';

const params = new URLSearchParams(location.search);
const VIEWS = ['checklist', 'roadmap', 'missables'];
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

const state = {
  trophies: [],
  earned: loadProgress(),
  spoiler: params.get('spoiler') === '1',
  view: VIEWS.includes(params.get('view')) ? params.get('view') : 'checklist',
  kind: KINDS.includes(params.get('filter')) ? params.get('filter') : 'all',
  grade: ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade')) ? params.get('grade') : 'all',
  query: params.get('search') ?? '',
};

function filters() {
  return { kind: state.kind, grade: state.grade, query: state.query };
}

function updateProgressHeader() {
  const total = state.trophies.length;
  const done = state.trophies.filter((t) => state.earned.has(t.id)).length;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = total ? `${Math.round((done / total) * 100)}%` : '0%';
  document.getElementById('progressFill').style.width = total ? `${(done / total) * 100}%` : '0%';
}

function renderAll() {
  renderChecklist(state.trophies, state.earned, state.spoiler, filters(), toggleEarned, openTrophy);
  renderMissables(state.trophies, state.earned, state.spoiler, toggleEarned, openTrophy);
  renderRoadmap(state.trophies, state.earned, openTrophy);
  updateProgressHeader();
}

function toggleEarned(id, on) {
  if (on) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state.earned);
  renderAll();
}

function openTrophy(trophy) {
  openDetail(trophy, state.earned, toggleEarned);
}

function showView(view) {
  state.view = view;
  for (const v of VIEWS) {
    document.getElementById('view' + v[0].toUpperCase() + v.slice(1)).hidden = v !== view;
    document.getElementById('tab' + v[0].toUpperCase() + v.slice(1)).classList.toggle('active', v === view);
  }
  document.querySelector('.toolbar').style.display = view === 'checklist' ? '' : 'none';
}

function syncToolbar() {
  document.getElementById('spoilerToggle').checked = state.spoiler;
  document.getElementById('search').value = state.query;
  document.getElementById('gradeFilter').value = state.grade;
  for (const btn of document.querySelectorAll('.kind-btn')) {
    btn.classList.toggle('active', btn.dataset.kind === state.kind);
  }
}

function findTrophy(spec) {
  const byId = Number(spec);
  if (Number.isInteger(byId)) return state.trophies.find((t) => t.id === byId);
  const folded = spec.toLowerCase().trim();
  return state.trophies.find((t) => t.name.toLowerCase() === folded)
    ?? state.trophies.find((t) => t.name.toLowerCase().includes(folded));
}

async function boot() {
  state.trophies = await loadTrophies();

  // ?seed=n marks the first n trophies earned (a demo for screenshots),
  // skipping the platinum and 100% completion, which no early save would have.
  const seed = Number(params.get('seed'));
  if (Number.isInteger(seed) && seed > 0) {
    const seedable = state.trophies.filter((t) => t.id !== 1 && t.id !== 14);
    for (const t of seedable.slice(0, Math.min(seed, seedable.length))) state.earned.add(t.id);
    saveProgress(state.earned);
  }

  // Toolbar wiring.
  document.getElementById('search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderChecklist(state.trophies, state.earned, state.spoiler, filters(), toggleEarned, openTrophy);
  });
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    state.grade = e.target.value;
    renderChecklist(state.trophies, state.earned, state.spoiler, filters(), toggleEarned, openTrophy);
  });
  for (const btn of document.querySelectorAll('.kind-btn')) {
    btn.addEventListener('click', () => {
      state.kind = btn.dataset.kind;
      syncToolbar();
      renderChecklist(state.trophies, state.earned, state.spoiler, filters(), toggleEarned, openTrophy);
    });
  }
  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    renderAll();
  });
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importProgressFile(file);
      state.earned = new Set([...imported].filter((id) => state.trophies.some((t) => t.id === id)));
      saveProgress(state.earned);
      renderAll();
    } catch {
      alert('That file is not a progress export from this guide.');
    }
    e.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies?')) return;
    state.earned = new Set();
    saveProgress(state.earned);
    renderAll();
  });
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
  });

  syncToolbar();
  showView(state.view);
  renderAll();

  // ?scroll=<pixels> jumps to that scroll position on load. Deferred a tick
  // so the browser has painted the rendered list before the jump.
  const scroll = Number(params.get('scroll'));
  if (Number.isFinite(scroll) && scroll > 0) {
    setTimeout(() => window.scrollTo(0, scroll), 50);
  }

  // ?trophy=<id or name> opens that trophy's guide on load.
  const spec = params.get('trophy');
  if (spec) {
    const trophy = findTrophy(spec);
    if (trophy) openTrophy(trophy);
  }
}

boot().catch((error) => {
  document.getElementById('trophyList').replaceChildren();
  const note = document.createElement('li');
  note.textContent = 'The trophy list could not be loaded: ' + error.message;
  document.getElementById('trophyList').append(note);
});

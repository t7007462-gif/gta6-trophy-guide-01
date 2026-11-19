// Views: the checklist rows, the roadmap stages, the missable list, and the
// trophy detail pane. Every view is built with DOM calls (no innerHTML from
// data), so trophy text is shown exactly as written.

import { KIND_LABELS, ROADMAP_STAGES, isSpoilerHidden, matchesFilters } from './data.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeDot(grade) {
  return el('span', `grade-dot ${grade}`, grade);
}

function kindTag(kind) {
  return el('span', `tag kind-${kind}`, KIND_LABELS[kind] ?? kind);
}

function missableTag() {
  return el('span', 'tag missable', 'Missable');
}

// One checklist row: checkbox, official name and description, kind and
// missable tags, grade dot, and a button that opens the full guide.
export function trophyRow(trophy, earned, spoilerOn, onToggle, onOpen) {
  const row = el('li', 'trophy-row' + (earned.has(trophy.id) ? ' earned' : ''));
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  row.append(box);

  const main = el('div', 'trophy-main');
  const name = el('p', 'trophy-name');
  if (isSpoilerHidden(trophy, spoilerOn, earned)) {
    name.append(el('span', 'hidden-name', 'Hidden story trophy — earn it to reveal'));
  } else {
    name.textContent = trophy.name;
  }
  main.append(name);
  const desc = el('p', 'trophy-desc');
  desc.textContent = isSpoilerHidden(trophy, spoilerOn, earned)
    ? 'Its name and description stay hidden while spoiler mode is on.'
    : trophy.description;
  main.append(desc);
  const tags = el('div', 'trophy-tags');
  tags.append(kindTag(trophy.kind));
  if (trophy.missable) tags.append(missableTag());
  tags.append(el('span', 'tag', trophy.roadmap));
  main.append(tags);
  row.append(main);

  const side = el('div', 'trophy-side');
  side.append(gradeDot(trophy.grade));
  const guideBtn = el('button', 'guide-btn', 'Guide');
  guideBtn.type = 'button';
  guideBtn.addEventListener('click', () => onOpen(trophy));
  side.append(guideBtn);
  row.append(side);
  return row;
}

// Render the filtered checklist into #trophyList and update the count line.
export function renderChecklist(trophies, earned, spoilerOn, filters, onToggle, onOpen) {
  const list = document.getElementById('trophyList');
  const shown = trophies.filter((t) => matchesFilters(t, filters));
  list.replaceChildren(...shown.map((t) => trophyRow(t, earned, spoilerOn, onToggle, onOpen)));
  document.getElementById('emptyNote').hidden = shown.length > 0;
  const earnedShown = shown.filter((t) => earned.has(t.id)).length;
  document.getElementById('resultCount').textContent =
    `${shown.length} of ${trophies.length} trophies shown · ${earnedShown} earned in this view`;
  return shown.length;
}

// Render the missable list: every trophy with missable true, in roadmap order.
export function renderMissables(trophies, earned, spoilerOn, onToggle, onOpen) {
  const list = document.getElementById('missableList');
  const order = new Map(ROADMAP_STAGES.map((s, i) => [s.name, i]));
  const missable = trophies
    .filter((t) => t.missable)
    .sort((a, b) => (order.get(a.roadmap) ?? 99) - (order.get(b.roadmap) ?? 99) || a.id - b.id);
  list.replaceChildren(...missable.map((t) => trophyRow(t, earned, spoilerOn, onToggle, onOpen)));
}

// Render the roadmap: one card per stage, its trophies in list order, with
// missable flags and a per-stage earned count.
export function renderRoadmap(trophies, earned, onOpen) {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.name);
    if (members.length === 0) continue;
    const card = el('article', 'roadmap-stage');
    card.append(el('h2', null, stage.name));
    card.append(el('p', 'stage-note', stage.note));
    const done = members.filter((t) => earned.has(t.id)).length;
    card.append(el('p', 'stage-count', `${done} of ${members.length} earned in this stage`));
    const list = el('ul', 'stage-list');
    for (const t of members) {
      const item = el('li');
      const label = el('span', earned.has(t.id) ? 'done' : null, `${t.name} — ${t.description}`);
      item.append(label);
      if (t.missable) item.append(el('span', 'flag', 'Missable'));
      item.append(el('span', 'grade-dot ' + t.grade, t.grade));
      const open = el('button', 'guide-btn', 'Guide');
      open.type = 'button';
      open.addEventListener('click', () => onOpen(t));
      item.append(open);
      list.append(item);
    }
    card.append(list);
    host.append(card);
  }
}

// The detail pane: official name, description and grade, the guide in our own
// words, the cited sources, and a big earned toggle.
export function openDetail(trophy, earned, onToggle) {
  const pane = document.getElementById('detailPane');
  const body = document.getElementById('detailBody');
  body.replaceChildren();

  const meta = el('p', 'meta-line', `${trophy.grade} trophy · ${KIND_LABELS[trophy.kind]} · Roadmap: ${trophy.roadmap}${trophy.missable ? ' · Missable' : ''}`);
  body.append(meta);
  body.append(el('h2', null, trophy.name));
  body.append(el('p', 'official', `Official description: “${trophy.description}”`));
  body.append(el('h3', null, 'How to earn it'));
  body.append(el('p', null, trophy.guide));
  body.append(el('h3', null, 'Sources'));
  const sources = el('ul', 'sources');
  for (const s of trophy.sources) sources.append(el('li', null, s));
  body.append(sources);
  body.append(el('p', 'meta-line', 'Guides here are written for this page from the official description. Where the description does not pin a place down, the guide says so rather than inventing one.'));

  const toggle = el('button', 'earned-toggle' + (earned.has(trophy.id) ? ' earned' : ''),
    earned.has(trophy.id) ? '✓ Earned — tap to unmark' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    onToggle(trophy.id, !earned.has(trophy.id));
    openDetail(trophy, earned, onToggle);
  });
  body.append(toggle);
  pane.hidden = false;
}

export function closeDetail() {
  document.getElementById('detailPane').hidden = true;
}

// Trophy data: loads app/data/trophies.json (a file of this app, fetched at run
// time from the same server — no network request leaves the app) and hands
// back the list plus the small lookups the views need.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

// The roadmap's stages, in the order a player should work through them.
export const ROADMAP_STAGES = [
  { name: 'Opening', note: 'The first mission. Nothing here can be missed.' },
  { name: 'Chapter 1', note: 'Finish the chapter; clear any side content you care about before it ends.' },
  { name: 'Chapter 2', note: 'Finish the chapter; sweep up chapter-specific side content first.' },
  { name: 'Chapter 3', note: 'Finish the chapter; use it as a checkpoint for open side strands.' },
  { name: 'Chapter 4', note: 'Finish the chapter — then do your missable cleanup before the finale.' },
  { name: 'Story missions', note: 'Named missions. Treat each as a one-shot until mission replay is confirmed.' },
  { name: 'Finale', note: 'The final mission, then 100% completion. Do the missable cleanup first.' },
  { name: 'Side strands', note: 'Character and stranger strands. Finish each strand when its final mission appears.' },
  { name: 'Post-game cleanup', note: 'Repeatable activities, robberies, races and money goals — nothing here is gated by the story.' },
  { name: 'Collectibles', note: 'Sweep the map: meditation spots, cards, vehicles, areas and garages.' },
  { name: 'Platinum', note: 'Pops on its own once the other 54 are earned.' },
];

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophies.json could not be loaded');
  const doc = await response.json();
  return doc.trophies;
}

// A story trophy is hidden while spoiler mode is on and it is not yet earned.
export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

// Does this trophy pass the current filters? kind may be 'all', 'story',
// 'missable', 'collectibles', 'activities' or 'online'; grade 'all' or a grade.
export function matchesFilters(trophy, { kind, grade, query }) {
  if (kind === 'missable' && !trophy.missable) return false;
  if (kind !== 'all' && kind !== 'missable' && trophy.kind !== kind) return false;
  if (grade !== 'all' && trophy.grade !== grade) return false;
  if (query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.roadmap}`.toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
  }
  return true;
}

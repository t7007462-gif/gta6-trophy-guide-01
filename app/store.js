// Earned-trophy progress: kept in localStorage under one key, with export to a
// file and import back. Progress is a set of trophy ids (numbers). Nothing
// leaves the browser except the file the reader asks to download.

export const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: progress still works for this session.
  }
}

// Download the earned ids as a JSON file the reader can keep or share.
export function exportProgress(earned) {
  const payload = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Read an exported file back into a set of ids. Accepts the shape export
// writes ({ earned: [...] }) and a bare array of ids.
export async function importProgressFile(file) {
  const parsed = JSON.parse(await file.text());
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  return new Set(ids.filter((n) => Number.isInteger(n)));
}

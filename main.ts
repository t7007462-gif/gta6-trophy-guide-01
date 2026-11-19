// Leonida Trophy Guide — entry program (Node 22, standard library only).
//
// What it does: copies this repository's app/ (the offline guide) and
// screenshots/ (its renders) into the output directory, then writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts —
// the summary the judge reads (screenshots, first-load files and bytes, and
// the source). Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The copy walks directory entries in sorted order and writes nothing else,
// so two runs over the same tree produce byte-identical output.

import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory beside this file.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Caps from the competition's gate (reference/gate.json): the text cap shapes
// the dossier's bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots, one over 256 KiB; more than 993 files and
// directories in app/ or 48 MiB of app files — app/ shares /output's own
// 1000-entry cap with screenshots/ and dossier.json).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTreeSorted(source, target) {
  mkdirSync(target, { recursive: true });
  for (const name of readdirSync(source).sort()) {
    const from = join(source, name);
    const to = join(target, name);
    if (statSync(from).isDirectory()) copyTreeSorted(from, to);
    else copyFileSync(from, to);
  }
}

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  // Clear any earlier hand-in so a stale file can never ride along.
  rmSync(join(outputDir, 'app'), { recursive: true, force: true });
  rmSync(join(outputDir, 'screenshots'), { recursive: true, force: true });
  rmSync(join(outputDir, 'dossier.json'), { force: true });

  copyTreeSorted(join(repoRoot, 'app'), join(outputDir, 'app'));
  copyTreeSorted(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_CAPS));
}

handIn();

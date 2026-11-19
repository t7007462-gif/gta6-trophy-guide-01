# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/t7007462-gif/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/t7007462-gif/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze). Every trophy keeps its official name, description and grade as PlayStation publishes them, and carries a guide written for this page, in its own words, from the official description, with its sources cited beside it. The guide is also a tracker: a checklist saved in the browser with export and import, filters by kind (story, missable, collectibles, activities, online) and grade, text search, a spoiler setting that hides story trophies until they are earned, and a roadmap to the platinum with all 18 missable trophies flagged. GTA VI is unreleased (May 2026), so where an official description does not pin a place down, the guide says so instead of inventing one. The whole app is static files under `app/` that work with the network off — no Rockstar logo or artwork, no external requests.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve the guide locally with `node serve.ts`, then open http://localhost:8080. `main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=7pcj4z9y&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

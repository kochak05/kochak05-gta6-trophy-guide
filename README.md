# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze. Every trophy has its official name and description, a guide written in our own words that names its sources, a kind, and a missable flag. The app adds a four-stage road to the platinum, a checklist that saves progress in the browser with export and import, filters by kind, and a spoiler setting that hides story trophies until they are earned. It runs entirely from its own files: no network, no Rockstar artwork, no account.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Any static server works too — serve `app/` at its root.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies with official names, descriptions, grades, kinds, missable flags, guides and sources.
- `screenshots/` — four renders of the running app (cover first).
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's dossier library.
- `serve.ts` — a tiny static server for local use.

## Sources

The official list as Exophase and PSNProfiles publish it; requirements and the 100% checklist as KeenGamer, Insider Gaming, GameMapa and EGamers.io report them. Five hidden trophies are still unconfirmed by the community — their guides say so instead of guessing.

---

<sub>Entered on [make.fun](https://make.fun/?ref=249w03hp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Open `app/index.html` in a desktop browser — no build step, no network, everything the app loads is a file under `app/`.

## What it covers

- **All 55 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation) with their official names, descriptions and grades as PlayStation publishes them.
- **A guide for every trophy, in our own words**, with the facts it rests on cited beside it — the source guide is named for each trophy, so a reader can see where each location, count or step comes from. Nothing is copied from another guide.
- **A roadmap to the platinum** in four steps: play the story (60–80 hours), the 100% Completion Checklist (about 100 hours), Strangers & Freaks and cleanup (about 10 hours), then the platinum — roughly 200 hours in total.
- **Missable flags.** Only one trophy is possibly missable — Positive Mental Attitude, whose first meditation in Chapter 1 disappears when that chapter ends — and the guide says so loudly, with the safety nets.
- **A tracker.** Tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a file and imported back. Filters cover story, missable, collectibles, activities and online (there are no online trophies — all 55 are single-player), plus grade and a text search. A spoiler setting hides the names and descriptions of story trophies until you earn them.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. `serve.ts` serves `app/` only.

## Files

- `app/index.html` — the page: header with progress, controls, roadmap, trophy list.
- `app/app.js` — loads the data, renders the list and roadmap, saves and restores progress, export/import, filters, spoiler mode.
- `app/style.css` — the look: a Vice City sunset of the guide's own, system fonts only.
- `app/data/trophies.json` — the 55 trophies (official names, descriptions, grades, hidden flags, counts), the roadmap stages, and each trophy's guide with its sources.
- `screenshots/` — four screenshots of the real app running in a desktop browser. The first by name is the cover.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `LICENSE` — MIT.

## Sources

Official names, descriptions and grades come from the lists at Exophase and PSNProfiles. The guides draw on PowerPyx's GTA 6 Trophy Guide & Roadmap, Push Square's GTA 6 Trophy Guide & Roadmap, Sixshore's trophy list and Vice City Hustle's trophy list — each trophy names its sources. The wording is ours throughout.

An original fan guide, not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork or game screenshots are used anywhere.

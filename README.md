# Leonida Trophy Guide

[![Bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/kochak05/kochak05-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in the author's own words that names its sources, a four-stage roadmap to the platinum, and a checklist that saves progress in the browser with export and import, filters by kind, and a spoiler setting that hides story trophies until they are earned.

## Run it

Serve `app/` with any static file server and open `index.html`, for example:

```sh
node serve.ts
```

To build the hand-in dossier instead:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into the output directory and writes `dossier.json` there.

## What is inside

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker, plain files with no build step and no network at run time.
- `app/data/trophies.json` — the 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden) with a guide and named sources for each.
- `screenshots/` — four real renders of the app: the cover, a trophy guide open, the roadmap, and the spoiler setting at work.
- `main.ts` — the hand-in program that builds `dossier.json` with the kit's dossier library.

The guide is unofficial. It shows no Rockstar Games logo or artwork, and its guides are written in the author's own words. Trophy names and descriptions are as PlayStation publishes them.

Optional: earn referral rewards, a second way to make money — https://make.fun/r/249w03hp

# Portfolio

A static portfolio built with HTML, CSS, and a little JavaScript. No framework, Ruby, package installation, or build step is needed to preview it.

## Local preview

From this directory, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Press Ctrl+C to stop the server. Refresh the browser after editing files.

## Editing the site

- `index.html`: bento dashboard cards, homepage content, and links.
- `assets/styles.css`: responsive layout, typography, and both color themes.
- `assets/jordan-pixel-portrait-v2.png`: transparent pixel portrait displayed in the homepage introduction card. The original is preserved as `assets/jordan-pixel-portrait.png`.
- `assets/theme.js`: applies the saved or system theme before the page paints.
- `assets/main.js`: theme switch and footer year. Content and navigation work without JavaScript.
- `assets/data/collections.js`: collection catalogues and ownership records.
- `assets/collections.js`: collection percentages, game lists, search, and ownership filters.
- `collections/pal-n64/index.html`: PAL N64 checklist page.
- `collections/pal-dreamcast/index.html`: PAL Dreamcast checklist page.
- `collections/pal-gamecube/index.html`: PAL GameCube checklist page.
- `projects/game-boy-colour-input-test/index.html`: featured Game Boy Colour button-input test ROM page.
- `projects/gba-input-test/index.html`: Game Boy Advance button-input test ROM page.
- `404.html`: GitHub Pages error page.
- `sitemap.xml`: add published page URLs when creating new pages.

Use a directory with an `index.html` for each new page to keep clean URLs on GitHub Pages. Update relative asset paths when adding nested pages.

The homepage has a full-width introduction, lavender project cards for the Game Boy Colour and Game Boy Advance input test ROMs, and a collection progress card, in that order. The project cards sit side by side on wider screens and stack on screens 800px wide or smaller. The collection card displays two consoles per row on wider screens and one per row on smaller screens. Ownership details are shown on each checklist page. Edit the card content in `index.html`; sizing, colors, and spacing live in `assets/styles.css`.

## Updating collection progress

Edit `assets/data/collections.js`. Each collection contains its title catalogue plus `owned` and `missing` arrays. Copy exact game titles from the catalogue into the appropriate array, for example:

```js
"owned": ["Super Mario 64", "GoldenEye 007"],
"missing": ["Paper Mario"],
```

A title must appear in only one ownership array. Games in neither array are **Not logged**, so unrecorded inventory is distinct from games you know are missing. The percentage is owned games logged divided by the full catalogue, rounded to one decimal place. The same data drives the homepage and checklist. Visitors can search and filter the published list; ownership changes are made in the repository and deployed through GitHub Pages.

Select the collection by its `key`: `pal-n64`, `pal-dreamcast`, or `pal-gamecube`. For example, record `"Sonic Adventure"` in Dreamcast's `owned` array or `"Super Mario Sunshine"` in GameCube's `owned` array. New collections start with ownership unrecorded; Super Mario 64 is already recorded as owned in the N64 set.

The catalogues count games rather than language, label, or packaging variants:

- **PAL N64 — 243 entries:** European and Australian releases, counting HSV Adventure Racing separately from Beetle Adventure Racing. Based on the [N64 End Labels PAL checklist](https://n64.hackerman.ca/pal/), with expanded title spellings and HSV added; regional releases can be checked against the [Nintendo 64 release list](https://en.wikipedia.org/wiki/List_of_Nintendo_64_games).
- **PAL Dreamcast — 216 entries:** licensed PAL releases from the [Dreamcast release list](https://en.wikipedia.org/wiki/List_of_Dreamcast_games), including Taxi 2: Le Jeu. Excludes Sega Swirl, demos, browser discs, unlicensed releases, and repackaged compilations. The [Blue Spine Games retail catalogue](https://www.bluespinegames.com/pal-retail) explains the distinction between the 216 retail games and Sega Swirl.
- **PAL GameCube — 450 entries:** licensed PAL games from the [GameCube release list](https://en.wikipedia.org/wiki/List_of_GameCube_games), using PAL names where listed. Includes the playable Zelda compilations Collector's Edition and Ocarina of Time / Master Quest; excludes multi-game repackaging, demos, hardware utility discs, and unlicensed releases. The [GameCube Museum PAL catalogue](https://gamecube-museum.neocities.org/pal-list) also documents regional and disc variants.

Each checklist's expandable scope section explains its inclusions and links its references. Counts are calculated from `titles`, so progress updates automatically when the catalogue changes.

Validate edits before pushing:

```sh
node scripts/check-collections.cjs
```

Collection data and filtering require JavaScript. The pages display an explanatory fallback when it is disabled.

`_site/` is generated deployment output. Edit the source files above rather than the copies inside `_site/`.

## Deployment

GitHub Actions checks JavaScript, validates collection data, and packages the static files on pushes to `modern-portfolio` and `main`, and on pull requests targeting `main`. Only pushes to `main` deploy to GitHub Pages. The development branch does not replace the live site.

The published artifact contains only the site files, including `CNAME` for `jordandarlington.com`. Repository documentation and tooling are excluded. Keep the repository's Pages source set to **GitHub Actions** and retain its existing custom-domain/DNS configuration.

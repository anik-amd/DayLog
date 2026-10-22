# DayLog — Feature Roadmap

Each phase is one focused change. Tests first, `./gradlew test assembleDebug` green in the
Codespace before the phase is called done. One feature per commit.

---

## P0 — Groundwork

*No feature. The project stands up.*

- [x] Old React Native code frozen on `legacy/react-native`, deleted from the working tree
- [x] `main` / `dev` / `pre-release` branch structure, `main` as the default branch
- [x] Six Gradle modules, version catalog, wrapper
- [x] `.devcontainer` with the Android SDK pinned to API 36, installed with the Android CLI
- [x] CI: `verify`, `prerelease`, `release`, plus Dependabot
- [x] Hand-drawn launcher icon (adaptive, monochrome, no bitmap assets)
- [x] `docs/` and `AGENTS.md` rewritten for the native stack
- [x] `scripts/install-android-sdk.sh`, shared by the Codespace and CI
- [x] `verify-versions.py`, which proves every pinned version still exists

**Gate:** `./gradlew test assembleDebug` green in the Codespace; `verify` green on the PR.

---

## P1 — Design system

*The visual language, before any screen uses it.*

- [x] Material 3: tonal surfaces, the platform's own widgets, no shadows
- [x] Paper, Night and a true-black Night; the wallpaper's colours as an option
- [x] Type scale, one family — Roboto, the platform's own typeface since P9a (Inter until then)
- [x] Spacing and shape tokens
- [x] Core components: `DLText`, `DLLabel`, `DLButton`, `DLChip`, `DLIcon`, `DLIconButton`,
      `DLTextField`, `DLTopBar`, `DLRule`, `DLDivider`, `DLEmptyState`, `DLPendingDot`
- [x] Icon set: back, search, settings, calendar, tag, pin, weather, image, plus, trash, chevron,
      check, bold, italic, underline — 1.5dp stroke, hand-drawn vectors
- [x] The switch and the segmented control are Material's own: the app does not reimplement a Material component
- [x] `docs/DESIGN_SYSTEM.md` stays in step with the code

**Gate:** contrast tests green for every pair that carries text; the components are reviewed in
rendered previews, not only in code.

---

## P2 — Data layer

*The storage everything else stands on.*

- [x] Room: entities, DAOs, FTS4 index, migrations, committed schemas
- [x] Repository layer, `Flow`-based reads
- [x] DataStore settings: theme mode, the wallpaper option, pure black
- [x] JSON backup codec, schema `version: 2.0`, with validation
- [x] The Open-Meteo client: geocoding and forecast, no key
- [x] The database is upgraded in place, not replaced: version 1 → 2 builds the index from the
      entries that are already there
- [x] DAO tests against the real database and the real index, and a migration test that starts
      from the version 1 shape

**Gate:** DAO tests, migration test, JSON round-trip, weather mapping — all green. 108 tests.

---

## P3 — Timeline and quick entry

*The core loop. The part the whole app exists for.*

- [x] Day-grouped timeline, margin rule with dates in the gutter
- [x] The margin grows with the text, so a day name is never cut off
- [x] Quick entry composer: auto-grow to ten lines, saved on the button (autosave until P9a)
- [x] Nothing is written while the writer is still typing; the save button is the only thing that
      writes the thought down and the only thing that empties the field (P9a)
- [x] The bar rides above the keyboard
- [x] Full editor via the unfold arrow, carrying the text with it
- [x] Tag extraction on save
- [x] Saving indicator
- [x] Entry read view
- [x] Tapping an entry opens it
- [x] Tag filter strip with AND logic
- [x] ViewModel state and manual-save tests

**Gate:** ViewModel state, manual save, photo-started entries, handover, timeline grouping — all
green.

---

## P4 — Editor and markdown

- [x] Full-screen editor with a formatting toolbar
- [x] Custom markdown parser → `AnnotatedString`: bold, italic, underline, H1, H2, bullets,
      numbered, code
- [x] The timeline renders markdown rather than showing the source
- [x] Live preview toggle
- [x] The toolbar works on the selection rather than on the whole entry, as a pure, tested rule
- [x] Parser ↔ toolbar round-trip

**Gate:** parser table tests green — sixteen of them, covering the markers, the escapes and the
markers that are not closed.

---

## P5 — Calendar, tags, search

- [x] Month grid with entry dots
- [x] Tap a day → the entries of that day are shown
- [x] Tag strip with AND logic
- [x] Full-text search screen over content and tags

**Gate:** calendar maths, day grouping, tag AND filter, FTS behaviour green.

---

## P6 — Photos

- [x] Android Photo Picker — no permission prompt
- [x] Copy into app storage, generate a thumbnail
- [x] Thumbnail strip on the timeline entry
- [x] Entry gallery view

**Gate:** path policy, thumbnail sizing, media CRUD green.

---

## P7 — Settings, backup, migration

- [x] Theme mode, the wallpaper option, pure black
- [x] JSON export and import, with the photos in the same file
- [x] Statistics
- [x] Legacy import from the previous version
- [x] The old database is read from `files/SQLite/daylog.db`, where the old app kept it

**Gate:** settings store, import validation, legacy mapping, stats green.

---

## P8 — Release readiness

- [x] Version bump and `CHANGELOG.md`, one patch version per stage
- [x] R8 rules, baseline profile: the app's own startup path goes into the profile
- [x] `pre-release` cut, signed APK built
- [x] Merge to `main`, tag, publish the release

---

## P9 — The rewrite, reworked after real use

*What the writer asked for after living with 0.3.x. Four stages, shipped one at a time.*

### P9a — The writing flow

- [x] The quick bar saves on its button, and nothing is written while the writer is still typing
- [x] The actions sit at the bottom of the quick editor: a photo, the unfold arrow, save
- [x] The field grows to ten lines, then scrolls
- [x] The unfold arrow hands the text to the full editor — the text is never lost on the way —
      and continues an entry a photo has already begun
- [x] The full editor saves on every way out: the back arrow, the system's back gesture, the save
      button
- [x] The editor's menu holds the discard, behind a question; an entry written this session is
      deleted, an older one is written back as it was read
- [x] The entry's moment sits under the top bar, tappable, with the platform's calendar and clock
      behind it
- [x] A live word count beside the moment
- [x] Photos in the full editor, from the toolbar
- [x] The typeface is Roboto, the platform's own; nothing is bundled

**Gate:** manual save, handover, photo-started entries, discard, word count — tested; the
reference images regenerated and reviewed.

### P9b — Bottom tabs and the calendar

- [ ] Bottom tabs: Timeline, Calendar — Material's own `NavigationBar`
- [ ] The calendar icon leaves the timeline's top bar
- [ ] Tapping a day shows that day's entries under the grid
- [ ] "On this day": the same date in past years, reached from the calendar
- [ ] Search stays where it is, at the top

### P9c — The timeline and the viewer, in Material's own voice

- [ ] Dates horizontal, entries under them, closer together
- [ ] No empty lines in the timeline's preview of an entry
- [ ] The preview is the first few lines, plain text — no markdown on the timeline
- [ ] A full-screen viewer for an entry: word count, tags, place, weather, photos
- [ ] Full CRUD on an entry from the viewer, including delete

### P9d — Places

- [ ] Filter by several tags at once, and by place
- [ ] A place stored as coordinates and a trimmed name, resolved from the device's own location
      or a typed name, kept for reuse
- [ ] The location action joins the photo at the bottom of the quick editor

**Gate per stage:** tests green, `assembleDebug` green, the reference images regenerated and
looked at.

---

## Later — not started

- [ ] Google Drive / Dropbox backup
- [ ] Home-screen widget
- [ ] Map view over the stored coordinates

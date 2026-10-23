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

- [x] Bottom tabs: Timeline, Calendar — Material's own `NavigationBar`
- [x] The calendar icon leaves the timeline's top bar
- [x] Tapping a day shows that day's entries under the grid
- [x] The quick bar's save button is an icon, and it saves only when there is something to save
- [x] A filter popup handles many tags instead of an overflowing strip
- [x] The quick bar is a floating bubble above the tabs; scrolling down folds it into a plus,
      scrolling up unfolds it again
- [x] The shapes go rounder: a bubble shape and a hairline border for the quick bar, rounder
      cards and chips
- [x] "On this day": the same date in past years, an icon with a count badge on the timeline's
      top bar
- [x] Search stays where it is, at the top
- [x] The timeline, the calendar's day list and "On this day" read plain text — no markdown
      clothing, no tags aglow; the reader keeps both
- [x] Tags and a place can be given to a thought in both editors: chips to pick, a word to type,
      and a filled chip to take a tag off again; the place can be named, changed or removed
- [x] The reader's moment sits above the entry, small and muted, with the place beside it; edit
      and delete are icons in the reader's top bar
- [x] The pin is a teardrop, as a map pin is

**Gate:** tabs, day entries, on-this-day, save icon, filter popup, editors' tag and place
pickers, parser and extractor rules — tested; the reference images regenerated and reviewed.

### P9c — The timeline and the viewer, in Material's own voice

*The feedback rounds of P9b reshaped the quick bar, the reader and the previews; what is left
here is the timeline's own layout and the viewer's fullness.*

- [x] The preview is the first few lines, plain text — no markdown on the timeline (P9b)
- [x] No empty lines in the timeline's preview of an entry (P9b)
- [x] Edit and delete are icons in the reader's top bar (P9b)
- [x] The timeline reads as a notebook: the date is a heading across the page, the entries sit
      under it, and the spacing is the design system's scale, not an eyeballed dp — the same
      shape carries the search results and the day lists
- [x] The viewer's facts line carries the word count beside the date, the time and the place —
      and the editor's does too

### P9d — Places

- [x] Filter by several tags at once — the filter popup keeps tags working together (P9b)
- [ ] Filter by place
- [ ] A place stored as coordinates and a trimmed name, resolved from the device's own location
      or a typed name, kept for reuse
- [x] The location action sits at the bottom of the quick editor (P9b)

**Gate per stage:** tests green, `assembleDebug` green, the reference images regenerated and
looked at.

---

## Later — not started

- [ ] Google Drive / Dropbox backup
- [ ] Home-screen widget
- [ ] Map view over the stored coordinates

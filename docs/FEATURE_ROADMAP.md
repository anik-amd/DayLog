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
- [x] Type scale on Inter, a variable font, one family
- [x] Spacing and shape tokens
- [x] Core components: `DLText`, `DLLabel`, `DLButton`, `DLChip`, `DLIcon`, `DLIconButton`,
      `DLTextField`, `DLTopBar`, `DLRule`, `DLDivider`, `DLEmptyState`, `DLPendingDot`
- [x] Icon set: back, search, settings, calendar, tag, pin, weather, image, plus, trash, chevron,
      check, bold, italic, underline — 1.5dp stroke, hand-drawn vectors
- [ ] A switch and a segmented control of our own, once they are needed
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
- [x] Quick entry composer: auto-grow to six lines, autosave 700ms after the last keystroke
- [x] The composer never takes the writing away: every save updates the same entry, and the text
      is never cleared while the writer is in it
- [x] The bar rides above the keyboard
- [x] Full editor via chevron
- [x] Tag extraction on save
- [x] Unsaved/pending indicator
- [x] Entry read view
- [x] Tapping an entry opens it
- [x] Tag filter strip with AND logic
- [x] ViewModel state and autosave debounce tests

**Gate:** ViewModel state, autosave debounce, timeline grouping, and a Compose test that types and
saves.

---

## P4 — Editor and markdown

- [x] Full-screen editor with a formatting toolbar
- [x] Custom markdown parser → `AnnotatedString`: bold, italic, underline, H1, H2, bullets,
      numbered, code
- [x] The timeline renders markdown rather than showing the source
- [ ] Live preview toggle
- [x] The toolbar works on the selection rather than on the whole entry, as a pure, tested rule
- [ ] Parser ↔ toolbar round-trip

**Gate:** parser table tests green — sixteen of them, covering the markers, the escapes and the
markers that are not closed.

---

## P5 — Calendar, tags, search

- [ ] Month grid with entry dots
- [ ] Tap a day → timeline filters to it
- [ ] Tag strip with AND logic
- [x] Full-text search screen over content and tags

**Gate:** calendar maths, day grouping, tag AND filter, FTS behaviour green.

---

## P6 — Photos

- [ ] Android Photo Picker — no permission prompt
- [ ] Copy into app storage, generate a thumbnail
- [ ] Thumbnail strip on the timeline entry
- [ ] Entry gallery view

**Gate:** path policy, thumbnail sizing, media CRUD green.

---

## P7 — Settings, backup, migration

- [x] Theme mode, the wallpaper option, pure black
- [ ] JSON export and import
- [ ] Statistics
- [ ] Legacy import from the React Native app's export
- [ ] Direct probe of the legacy database at `databases/daylog.db` and `databases/SQLite/daylog.db`

**Gate:** settings store, import validation, legacy mapping, stats green.

---

## P8 — Release readiness

- [ ] Version bump to `0.2.0`, `CHANGELOG.md`
- [ ] R8 rules, baseline profile
- [ ] `pre-release` cut, signed APK built and tested on a real device
- [ ] Merge to `main`, tag `v0.2.0`, publish the release

---

## Later — not started

- [ ] Google Drive / Dropbox backup
- [ ] Home-screen widget
- [ ] Map view over the stored coordinates

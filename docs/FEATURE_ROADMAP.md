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

- [x] Colour ramps: Paper and Night, one hue
- [x] Type scale: Spectral for content, Instrument Sans for chrome
- [x] Spacing and shape tokens
- [x] Theme, modes, adaptive accent
- [x] Core components: `DLText`, `DLLabel`, `DLButton`, `DLChip`, `DLIcon`, `DLIconButton`,
      `DLTextField`, `DLTopBar`, `DLRule`, `DLEmptyState`
- [x] Icon set: back, search, settings, calendar, tag, pin, weather, image, plus, trash, chevron,
      check, bold, italic, underline — 1.5dp stroke, hand-drawn vectors
- [ ] A switch, a segmented control, a sheet
- [ ] `docs/DESIGN_SYSTEM.md` stays in step with the code

**Gate:** contrast tests green for every pair that carries text; the components are reviewed in
rendered previews, not only in code.

---

## P2 — Data layer

*The storage everything else stands on.*

- [x] Room: entities, DAOs, committed schemas, tombstones
- [x] Repository layer, `Flow`-based reads
- [x] DataStore settings: theme mode, accent source
- [x] JSON backup codec, schema `version: 2.0`, with validation
- [x] `WeatherService` behind an interface
- [ ] The Open-Meteo client itself: geocoding and forecast
- [ ] FTS4 index for search
- [ ] Room DAO tests and a migration test

**Gate:** DAO tests, migration test, JSON round-trip, weather mapping — all green.

---

## P3 — Timeline and quick entry

*The core loop. The part the whole app exists for.*

- [x] Day-grouped timeline, margin rule with dates in the gutter
- [x] The margin grows with the text, so a day name is never cut off
- [x] Quick entry composer: auto-grow to six lines, autosave 700ms after the last keystroke
- [x] Full editor via chevron
- [x] Tag extraction on save
- [x] Unsaved/pending indicator
- [ ] Entry read view
- [ ] Tapping an entry opens it
- [ ] Tag filter strip with AND logic
- [ ] ViewModel state and autosave debounce tests

**Gate:** ViewModel state, autosave debounce, timeline grouping, and a Compose test that types and
saves.

---

## P4 — Editor and markdown

- [x] Full-screen editor with a formatting toolbar *(the screen exists; the toolbar is a first cut)*
- [x] Custom markdown parser → `AnnotatedString`: bold, italic, underline, H1, H2, bullets,
      numbered, code
- [x] The timeline renders markdown rather than showing the source
- [ ] Live preview toggle
- [ ] The toolbar works on the selection rather than on the whole entry
- [ ] Parser ↔ toolbar round-trip

**Gate:** parser table tests green — sixteen of them, covering the markers, the escapes and the
markers that are not closed.

---

## P5 — Calendar, tags, search

- [ ] Month grid with entry dots
- [ ] Tap a day → timeline filters to it
- [ ] Tag strip with AND logic
- [ ] Full-text search screen over content and tags

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

- [ ] Theme mode, adaptive accent, text scale
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

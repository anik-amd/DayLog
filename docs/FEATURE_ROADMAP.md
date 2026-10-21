# DayLog — Feature Roadmap

Each phase is one focused change. Tests first, `./gradlew test assembleDebug` green in the
Codespace before the phase is called done. One feature per commit.

---

## P0 — Groundwork

*No feature. The project stands up.*

- [x] Old React Native code frozen on `legacy/react-native`, deleted from the working tree
- [x] `main` / `dev` / `pre-release` branch structure, `main` as the default branch
- [x] Six Gradle modules, version catalog, wrapper
- [x] `.devcontainer` with the Android SDK pinned to API 36
- [x] CI: `verify`, `prerelease`, `release`, plus Dependabot
- [x] Hand-drawn launcher icon (adaptive, monochrome, no bitmap assets)
- [x] `docs/` and `AGENTS.md` rewritten for the native stack

**Gate:** `./gradlew test assembleDebug` green in the Codespace; `verify` green on the PR.

---

## P1 — Design system

*The visual language, before any screen uses it.*

- [ ] Core components: `DLText`, `Label`, `Button`, `Chip`, `IconButton`, `Hairline`, `Sheet`,
      `TextField`, `Switch`, `TopBar`
- [ ] Icon set: back, search, settings, calendar, tag, pin, weather, image, plus, trash, chevron,
      check — 1.5dp stroke, hand-drawn vectors
- [ ] Empty states, error states, loading states
- [ ] `docs/DESIGN_SYSTEM.md` stays in step with the code

**Gate:** contrast tests green for every pair that carries text; components reviewable in previews.

---

## P2 — Data layer

*The storage everything else stands on.*

- [ ] Room: entities, DAOs, FTS4 index, migrations, committed schemas
- [ ] Repository layer, `Flow`-based reads
- [ ] DataStore settings: theme mode, accent source, text scale
- [ ] JSON backup codec, schema `version: 2.0`, with import validation
- [ ] Open-Meteo client for places and weather, behind an interface
- [ ] Soft-delete tombstones wired end to end

**Gate:** DAO tests, migration test, JSON round-trip, weather mapping — all green.

---

## P3 — Timeline and quick entry

*The core loop. The part the whole app exists for.*

- [ ] Day-grouped timeline, margin rule with dates in the gutter
- [ ] Quick entry composer: auto-grow to six lines, autosave 700ms after the last keystroke
- [ ] Full editor via chevron
- [ ] Tag extraction on save, tag filter strip with AND logic
- [ ] Unsaved/pending indicator
- [ ] Entry read view

**Gate:** ViewModel state, autosave debounce, timeline grouping, and a Compose test that types and
saves.

---

## P4 — Editor and markdown

- [ ] Full-screen editor with a formatting toolbar
- [ ] Custom markdown parser → `AnnotatedString`: bold, italic, underline, H1, H2, bullets,
      numbered, code
- [ ] Live preview toggle
- [ ] Parser ↔ toolbar round-trip

**Gate:** parser table tests and a round-trip test green.

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

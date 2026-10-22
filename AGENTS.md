# DayLog — Instructions for AI Agents

All project instructions live in `/docs`. **Read them before writing any code.**

- `/docs/SPEC.md` — what the app is and what it does
- `/docs/TECHNICAL_ARCHITECTURE.md` — how it is built
- `/docs/FEATURE_ROADMAP.md` — the order work happens in
- `/docs/DESIGN_SYSTEM.md` — tokens, type, rules
- `/docs/TESTING.md` — what is tested and what is deliberately not

These are not optional. A change that contradicts them is a bug.

---

# 1. What DayLog is

A minimal, offline-first Android diary. The point is to capture a thought in a few seconds, so
the quick entry bar matters more than any other screen in the app.

The app must feel fast, calm, quiet and reliable. Adding a feature is a cost; removing friction is
a benefit. When in doubt, leave it out.

---

# 2. Stack

Do not introduce anything that is not already in `gradle/libs.versions.toml`.

| Piece | Choice |
|---|---|
| Language | Kotlin 2.3.20 |
| UI | Jetpack Compose (BOM 2026.06.01), Material 3 |
| Build | AGP 8.13.2, Gradle 8.14.6, JDK 21 |
| Storage | Room 2.8.5 + DataStore 1.3.0 |
| Async | Coroutines 1.11.0 |
| Type | Inter, bundled as a variable font |
| Tests | JUnit4, Robolectric 4.17, Turbine, `kotlinx-coroutines-test` |

**Material 3 is the design language.** The app is a native Android app: the Material widgets, the
tonal surfaces and the platform's own behaviour. Do not reimplement a Material component to look
like something else, and do not add a second UI library.

Do not add a DI framework, an image library, a markdown library, a date library, a JSON library or
a logging framework. The app's dependency list is short on purpose.

Every version is pinned exactly in `gradle/libs.versions.toml`. Never write `"latest"`, `+` or a
version range.

---

# 3. Module layout

```
app/          DI wiring, MainActivity, navigation, permissions
core/common/  Result, dispatchers, date and text helpers      (pure JVM)
core/model/   Entry, Tag, Media, domain rules                 (pure JVM)
core/data/    Room, DataStore, repositories, backup, weather
core/designsystem/  Ink & Margin: tokens, theme, components
core/testing/ fakes, fixtures, test helpers
```

Dependency direction is one-way: `app → core:data → core:model ← core:designsystem`, and
`core:model → core:common`. Nothing in `core:model` or `core:common` may depend on Android — that
is what keeps their tests running in milliseconds on the JVM.

`core:data` must not depend on `core:designsystem`. Data knows nothing about colour.

---

# 4. Coding rules

- Functional and composable style only. No classes where a function does.
- TypeScript-style explicit types are the Kotlin habit here: name the type where it is not obvious.
- Keep files short. Under 250 lines. If a file grows past that, it is doing two jobs.
- One function, one job. Split before you abstract.
- **UI holds no business logic.** Rules live in `core:model` or `core:data`; composables render
  state and raise events.
- Do not rename things or reshape data that already exists unless the change is the task.
- Assume this code will be changed later. Obvious beats clever.
- Stability beats speed.

### Naming

- Composables are PascalCase nouns: `EntryCard`, `TimelineScreen`.
- State holders are `...ViewModel` or a plain `...State` + reducer.
- Data classes for immutable state. `data class` everywhere a value is passed around.
- Extension functions for small additions to a type, not for hiding logic.

---

# 5. Testing

Write the test first for anything with a rule in it. A phase is not finished until its tests pass
and `./gradlew assembleDebug` is green in the Codespace.

**Test these** (pure JVM, fast):
- Domain rules: tag extraction, markdown parsing, date and calendar maths, weather mapping, JSON
  codecs.
- ViewModel state, repository behaviour: JUnit4, `kotlinx-coroutines-test`, Turbine, fake DAOs.
- Room DAOs, FTS and migrations: Robolectric, pinned to one SDK level.

**Do not test these**:
- Layout, spacing, colour values you already asserted for in a design-system test.
- Small composables that only forward callbacks.
- Anything that needs an emulator.

Keep suites small and purposeful — five to ten focused tests beat broad shallow coverage. The goal
is to prevent data loss and recurring bugs, not to reach a coverage number.

Tests live next to the code they test: `src/test/java/...`. Test names read as sentences:
``fun `tags are extracted from the start of the content`() ``.

### The design is tested too

Compose Preview Screenshot Testing renders the screens on the JVM and compares them against
reference images committed to the repository. A change that breaks the margin rule or truncates a
day name fails the build.

- Changed how something looks: `./gradlew updateDebugScreenshotTest`, then **look at the images**
  before committing them.
- Checking nothing changed by accident: `./gradlew validateDebugScreenshotTest`.

Never update the reference images without looking at them. They are the only way the design is
ever seen, so a blind update makes them worthless.

### Checking the versions

```bash
python3 .devcontainer/verify-versions.py
```

The version matrix is pinned because it is known to work together. A newer version is not a reason
to bump.

---

# 6. Where to work

Development happens in the **GitHub Codespace**, not on a laptop. The Codespace has the Android
SDK, the Gradle cache and enough disk for the build; a desktop checkout does not.

- Write the code, push it, and pull it in the Codespace. Never expect a local machine to have the
  Android SDK.
- Run `./gradlew` in the Codespace.
- The **Android CLI** drives the app from the terminal: `android run` deploys an APK, `android
  screen capture` takes a screenshot, `android layout` dumps the view tree, `android input` taps
  and types.
- Commit and push from whichever side holds the change.

---

# 7. Git

Branches:

| Branch | Purpose |
|---|---|
| `main` | Production. Releases are cut from here. |
| `dev` | Integration. Every change lands here first. |
| `pre-release` | Release candidate. Built and tested by hand before it ships. |
| `legacy/react-native` | The old React Native app, frozen. Read it for behaviour, never build it. |

```
dev ──(cut)──▶ pre-release ──(approve)──▶ main
  ▲                │
  └──── fix ───────┘
```

- `main` is protected: `verify` must pass and direct pushes are rejected.
- One feature per commit. A commit message says what changed and why.
- Never commit signing material, `local.properties`, or build output.
- **Never commit or push unless the user explicitly asks.** If the work is done and no commit was
  requested, stop and report.

---

# 8. Releasing

The rewrite is released in **stages, one patch version at a time**: `0.3.0`, `0.3.1`, `0.3.2` and
so on, until the roadmap is done. Each stage is a release.

1. Finish the stage, and make sure the build and the tests are green.
2. Bump the version:

   ```bash
   bash .devcontainer/bump-version.sh
   ```

   It raises `versionName` by a patch and `versionCode` by one, and says what to do next. The
   version code has to keep rising or the APK cannot install over the last one.
3. Write the `CHANGELOG.md` entry for the new version, in the words of the thing the reader can
   see. Not a list of commits.
4. Commit, push, and tag:

   ```bash
   git push origin main
   git tag -a v0.3.1 -m "DayLog 0.3.1"
   git push origin v0.3.1
   ```

   The tag starts the release workflow, which builds the signed APK and publishes it with the
   changelog.
5. A candidate can also be cut for testing before it ships: push the `pre-release` branch and the
   workflow opens a draft release with the APK on it.

If a stage is wrong, fix it and bump again. The version line only ever goes up.

---

# 9. Performance

The app must open fast and scroll smoothly. There is no bridge and no JavaScript thread, so the
usual React Native costs are gone — but the budget is still real.

- `LazyColumn` for the timeline, with stable keys.
- Avoid heavy animation. Motion is 120–200ms and only where it explains a change.
- No work on the main thread. Suspend functions and `Dispatchers.IO` for disk and network.
- Keep the dependency list short. Every library is startup cost and APK size.

---

# 10. Storage

Everything is local. The app works with no network at all.

- Entries, tags, media and settings live on the device.
- The only network use is fetching weather and resolving a place name.
- Cloud backup is a later phase. The data shape is already sync-ready: `uid`, `updatedAt` and a
  `deletedAt` tombstone, so adding sync never needs a migration.
- `INTERNET` is the only permission the app asks for.

---

# 11. Markdown

Entries are stored as Markdown text and stay editable as Markdown. Never store rendered HTML.

The dialect is small and custom: `**bold**`, `*italic*`, `__underline__`, `#`/`##` headings, `-`
bullets, `1.` numbered, `` `code` ``. The parser is written by hand — no markdown library.

---

# 12. Design

Read `/docs/DESIGN_SYSTEM.md` before touching a screen. The short version:

- Material 3: tonal surfaces, the platform's own widgets, no shadows.
- Paper, Night, and a true-black Night. The wallpaper's colours are an option, not the default.
- One family: Inter.
- **Accent marks data, never chrome.** It is not a button colour and not a navigation colour.
- The margin rule is the app's signature: dates sit in a gutter beside a vertical hairline, and
  the gutter grows with the text so a day name is never cut off.
- The composer never takes the writing away: every save updates the same entry, and the text is
  never cleared out of the field while the writer is still in it.

---

# 13. Never

- No accounts, no cloud sync, no analytics, no notifications.
- No iOS, no web, no widget (yet).
- No Material component defaults, no gradient chrome, no drop shadows on cards.
- No feature that is not in the roadmap.
- No rewriting working code to add a feature.

---

# 14. When you are done

Run the type-safe build and the tests in the Codespace:

```bash
./gradlew test assembleDebug
```

If the work changed how something looks, update the reference images and look at them:

```bash
./gradlew updateDebugScreenshotTest
```

If it does not pass, it is not done. Report what changed and what you verified.

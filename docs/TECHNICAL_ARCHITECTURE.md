# DayLog — Technical Architecture

Kotlin + Jetpack Compose. No bridge, no JavaScript thread, no runtime layout pass.

---

## Modules

Six Gradle modules. The split exists so the fast things stay fast: the pure-Kotlin modules have
no Android dependency, so their tests run on the JVM in milliseconds.

```
daylog/
├─ app/                    application, DI, navigation, permissions
├─ core/
│  ├─ common/              AppResult, AppError, dispatchers, date/text helpers   (pure JVM)
│  ├─ model/               Entry, Tag, Media, domain rules                       (pure JVM)
│  ├─ data/                Room, DataStore, repositories, backup, weather
│  ├─ designsystem/        Ink & Margin: tokens, theme, components
│  └─ testing/             fakes, fixtures, test helpers
├─ gradle/libs.versions.toml   every version, one file
└─ .devcontainer/              the Codespace definition
```

### Dependency direction

```
app ──▶ core:data ──▶ core:model ──▶ core:common
 │
 ├──▶ core:designsystem
 └──▶ core:model
```

One way only. `core:model` and `core:common` are plain Kotlin modules — they cannot even see
Android classes, which is what guarantees their tests are fast and hermetic.

`core:data` does not depend on `core:designsystem`. Data does not know what colour is.

`core:testing` is a test-only module. It is consumed with `testImplementation` only, so it never
ends up in a shipped APK.

---

## Why these versions

| Piece | Version | Reason |
|---|---|---|
| Gradle | 8.14.6 | Latest 8.14 patch. AGP 8.13 needs 8.13+. |
| AGP | 8.13.2 | Last 8.x stable. Caps compileSdk at 36, avoiding AGP 9's plugin-model break. |
| Kotlin | 2.3.20 | Matches KSP 2.3.12's stdlib dependency exactly. |
| KSP | 2.3.12 | Decoupled from the Kotlin version since 2.3.0. |
| Compose compiler | 2.3.20 | Must equal the Kotlin version. |
| Compose BOM | 2026.06.01 | ui/material3 1.11.4. Needs compileSdk 35 only. |
| compileSdk / targetSdk | 36 | Newest stable platform. |
| minSdk | 26 | Android 8.0, ~97% of devices, and `java.time` without desugaring. |
| Room | 2.8.5 | Needs compileSdk 34 only. |
| DataStore | 1.3.0 | compileSdk 34. |
| core-ktx | 1.17.0 | 1.19.x needs compileSdk 37, which AGP 8.x cannot compile. |
| activity-compose | 1.13.0 | compileSdk 36, needs AGP 8.9.1+. |
| lifecycle | 2.10.0 | 2.11.x needs compileSdk 37. |
| navigation-compose | 2.9.8 | 2.10.x needs compileSdk 37. |
| coil3 | 3.2.0 | 3.6.3 needs compileSdk 37. |
| Robolectric | 4.17 | Supports API 36. |

The constraint that drives this table is **compileSdk 36**. Several newer AndroidX releases
require compileSdk 37, which in turn requires AGP 9, whose Kotlin plugin model is a breaking
change. Staying on AGP 8.13.2 costs a few library versions and buys a build that is known to
work.

Every version is pinned exactly. No ranges, no `latest`. One file to bump.

---

## Build configuration

`gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx3072m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
```

JDK 21 everywhere, CI and Codespace alike. Bytecode targets Java 17.

`gradle/libs.versions.toml` is the single source of truth for versions. Nothing else names a
version.

---

## Data layer

### Room

```
entries   uid, content, createdAt, updatedAt, deletedAt,
          placeName, placeLat, placeLon,
          weatherSummary, weatherCode, syncedAt
tags      name, count
entry_tags  entryUid, tagName          (join table)
media     uid, entryUid, type, path, thumbnailPath, createdAt
```

**Sync-ready shape.** `uid` is a UUID that exists on every device. `updatedAt` orders changes.
`deletedAt` is a tombstone rather than a row removal, so a delete can be replicated. `syncedAt` is
nullable and reserved for a future cloud layer. Adding sync later needs no migration.

`exportSchema = true`, schemas committed under `core/data/schemas/`, so every schema change is
reviewable and migration tests have a baseline.

Deleting an entry soft-deletes it. The DAO filters tombstones out of every read, so no screen can
accidentally show one.

### Search

Room FTS4 with `contentEntity`, indexing entry content and tag names. If FTS proves troublesome
the fallback is a `LIKE` query behind the same repository interface.

### Settings

DataStore Preferences. `themeMode` and `accentSource` today.

### Backup

JSON, schema `version: 2.0`. Export writes the file, import reads it back after validation.
This is also the interchange format a future Drive or Dropbox backup will use, so the format does
not need to change when that arrives.

### Weather and places

Open-Meteo — geocoding and forecast, no API key. The client sits behind an interface so tests
use a fake. `INTERNET` is the only permission.

---

## Dependency injection

Manual. `DayLogApplication` builds an `AppContainer` and hands it down explicitly.

A DI framework would add an annotation processor, a runtime, and a learning curve, in exchange for
solving a problem this app does not have — the graph is a handful of objects. Every dependency is
visible at the point of use, and a test can substitute its own without a container.

---

## Navigation

`androidx.navigation.compose`. A `NavHost` in `MainActivity` with the timeline as the start
destination and the full editor, calendar, search and settings as routes.

---

## Performance

Compose draws directly; there is no bridge and no view inflation.

- `LazyColumn` for the timeline, keyed by entry uid.
- Room queries return `Flow`, so the list updates without manual refresh.
- No image decoding on the main thread. Thumbnails are pre-sized on write.
- Release builds run R8 with `proguard-rules.pro` keeping `kotlinx.serialization` models.
- `androidx.profileinstaller` ships a baseline profile.

---

## Where the code runs

The Codespace is the development environment. It has the Android SDK, the Gradle cache and
enough disk to build; a laptop checkout does not.

```bash
gh codespace create -R anik-amd/DayLog \
  --devcontainer-path .devcontainer/devcontainer.json \
  -m standardLinux
```

`.devcontainer/setup-android.sh` installs the command-line tools and pins `platforms;android-36`
and `build-tools;36.0.0`, so every rebuild gets the same toolchain.

The loop: write code, sync it with `gh codespace cp`, run `./gradlew` there, commit, push.

---

## CI

| Workflow | Trigger | What it does |
|---|---|---|
| `verify.yml` | PR to `dev`/`main`, push to `dev` | `./gradlew test assembleDebug` |
| `prerelease.yml` | push to `pre-release` | Signed release APK → artifact + draft release |
| `release.yml` | tag `v*` | Signed release APK → GitHub release |

No emulator and no lint gate. Emulator tests are where the minutes and the flakes come from, and
the logic worth protecting is already covered by JVM tests.

`gradle/actions/setup-gradle@v4` provides the dependency and build cache. Dependabot proposes
Gradle bumps as one grouped pull request so the version matrix never moves piecemeal.

---

## Signing

The keystore lives in the repository secrets (`SIGNING_KEY`, `SIGNING_KEY_STORE_PASSWORD`,
`SIGNING_KEY_KEY_PASSWORD`) with alias `upload`. CI decodes the base64 key into a file and points
`DAYLOG_KEYSTORE_PATH` and friends at it. No signing material is ever in the repository.

The application id stays `com.anik_amd.daylog` and the key is unchanged, so a new APK installs
over the existing app in place.

---

## Old code

The React Native app is frozen on `legacy/react-native`. It is there to be read for behaviour, not
built. `master` and the old `dev` were deleted once that branch existed; the history is continuous
because `main` was branched from `dev` rather than started fresh.

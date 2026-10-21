# DayLog — Testing

Test-driven where a rule exists. Cheap where it does not. The goal is to prevent data loss and
recurring bugs, not to reach a coverage number.

---

## Layers

| Layer | Tool | Runs in CI | Speed |
|---|---|---|---|
| Domain rules | JUnit4, pure JVM | yes | milliseconds |
| Repositories, ViewModels | JUnit4, `kotlinx-coroutines-test`, Turbine | yes | ~1s |
| Room DAOs, FTS, migrations | Robolectric 4.17 | yes | ~10s |
| Compose UI | `ui-test-junit4` under Robolectric | yes | ~30s |
| **The design itself** | **Compose Preview Screenshot Testing** | **yes** | **~1 min** |
| Real device | manual, in the pre-release phase | no | — |

No emulator in CI. Emulator tests are where the minutes and the flakes live, and the logic worth
protecting is already covered on the JVM.

---

## The design is tested too

`core/designsystem` and the screens are rendered on the JVM by Compose Preview Screenshot Testing
and compared against reference images that are committed to the repository.

This is the only way the design is ever looked at in CI, and it is worth as much as the unit
tests: a change that breaks the margin rule, truncates a day name or makes the text unreadable
fails the build rather than being noticed weeks later.

```
app/src/screenshotTest/          the previews that are rendered
app/src/screenshotTestDebug/reference/   the approved images
```

The previews are written against real content — a long entry, a short one, a tagged one, a place
and the weather — because a design that only works with tidy text is a design that only works in
a demo. Every screen has a preview for Paper, for Night and for a large text scale.

```bash
./gradlew updateDebugScreenshotTest    # approve the current appearance
./gradlew validateDebugScreenshotTest  # fail if the appearance changed
```

> The standalone screenshot plugin is the older of the two ways to do this. AGP 9.5 has a newer one
> built into the plugin itself; the project stays on AGP 8.13, so it uses this one. Moving to the
> newer setup is a separate decision, not a side effect.

---

## What to test

**Always:**

- Anything with a rule in it: tag extraction, markdown parsing, date and calendar maths, weather
  mapping, JSON codecs, autosave timing, conflict ordering.
- Anything that can lose data: saving, editing, deleting an entry, importing a backup.
- Anything that can corrupt state: migrations, sync-shaped fields, tombstone handling.

**Never:**

- Layout, spacing, alignment.
- Colour values — the design system already asserts contrast for every pair that carries text.
- Small composables that only forward a callback.
- Anything experimental.

Five to ten focused tests beat broad shallow coverage. If a test would not fail when the feature
breaks, it is not worth its runtime.

---

## Conventions

Tests sit beside the code: `src/test/java/...`.

Names read as sentences:

```kotlin
@Test
fun `tags are extracted from the start of the content`() { ... }
```

Assertions say what should be true, not how:

```kotlin
assertEquals(listOf("work", "idea"), TagExtractor.extract("#work an #idea"))
```

A test that fails should explain the bug without opening the source.

### Coroutines

Inject dispatchers and use `kotlinx-coroutines-test`, so no test depends on a real clock or a
real thread:

```kotlin
@Test
fun `autosave waits for the writer to go quiet`() = runTest { ... }
```

`core:testing` holds `TestDispatchers`, the fakes and the test data, so a test reads as the one
thing it is about rather than a wall of constructor arguments.

### Flows

Turbine, not sleeps:

```kotlin
repository.entries.test {
    assertEquals(expected, awaitItem())
}
```

---

## Robolectric

Pinned to one SDK level so behaviour does not shift between runs:

```kotlin
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
```

`isIncludeAndroidResources = true` is set in every module that uses it.

---

## Running

In the Codespace:

```bash
./gradlew test                    # everything
./gradlew :core:model:test        # one module
./gradlew test --tests "*TagExtractor*"
```

CI runs `./gradlew test assembleDebug`. A phase is not finished until both are green.

---

## Checking the versions

The version matrix in `gradle/libs.versions.toml` is pinned on purpose: it is the set of versions
known to work together. This script proves the pins are still real and reports what has moved on,
so a bump is a decision rather than an accident.

```bash
python3 .devcontainer/verify-versions.py
```

A newer version is not a reason to bump.

---

## Manual checks

These need a device and are done in the pre-release phase, not in CI:

- The app opens fast and the timeline scrolls smoothly.
- The quick entry bar grows, autosaves, and survives backgrounding.
- Photos are copied into app storage and survive a restart.
- Importing a JSON backup restores everything.
- The theme follows the system setting and the adaptive accent re-tints correctly.

---

## Definition of done

A change is done when:

1. Its tests exist and pass.
2. `./gradlew test assembleDebug` is green in the Codespace.
3. If it changed how something looks, the reference images have been updated and looked at.
4. The rules in `AGENTS.md` and `docs/DESIGN_SYSTEM.md` are respected.
5. The changelog is updated if a user can see the difference.

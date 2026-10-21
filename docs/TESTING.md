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
| Real device | manual, in the pre-release phase | no | — |

No emulator in CI. Emulator tests are where the minutes and the flakes live, and the logic worth
protecting is already covered on the JVM.

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
fun `autosave waits for the writer to go quiet`() = runTest {
    // ...
}
```

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
3. The rules in `AGENTS.md` and `docs/DESIGN_SYSTEM.md` are respected.
4. The changelog is updated if a user can see the difference.

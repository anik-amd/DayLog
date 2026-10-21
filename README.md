# DayLog

**A fast, minimal diary for Android. Write the thought, keep moving.**

DayLog is an offline-first diary built around one idea: capturing a thought should take seconds,
not setup. The app opens straight into your timeline with the cursor already waiting. You type, and
it saves itself.

> **Pre-release notice**
> This is the native rewrite of DayLog (v0.2.0). It is in active development and being tested on
> real devices before release. Back up your data regularly and report issues on GitHub.

---

## What it does

- **Timeline** — entries grouped by day, dates set in the margin like a ledger
- **Quick entry** — one line at the bottom that grows as you type and saves itself
- **Full editor** — a proper writing screen with a formatting toolbar and live preview
- **Markdown** — `**bold**`, `*italic*`, `__underline__`, headings, lists. Stored as Markdown, stays editable as Markdown
- **Tags** — type `#hashtag` and it is picked up. Filter by several tags at once
- **Place & weather** — attach a place by name; the weather there is fetched and kept with the entry
- **Calendar** — a month grid with a mark on every day you wrote
- **Search** — full-text across entries and tags
- **Photos** — attach from the system picker, no permission prompt
- **Themes** — Paper (light), Night (dark), or follow the system. The accent can follow your wallpaper
- **Your data stays yours** — everything is on the device. Export to JSON any time

---

## Built with

Kotlin · Jetpack Compose · Room · DataStore · Coroutines

No analytics. No accounts. No ads. No tracking. The only network request the app ever makes is to
look up a place name and its weather.

---

## Building from source

The app is built in a [GitHub Codespace](https://github.com/anik-amd/DayLog) — the Android SDK and
the Gradle cache live there, so no local Android setup is needed.

```bash
gh codespace create -R anik-amd/DayLog \
  --devcontainer-path .devcontainer/devcontainer.json \
  -m standardLinux

gh codespace ssh --codename <name> -- "./gradlew test assembleDebug"
```

Requirements: JDK 21, Android SDK with platform 36 and build-tools 36.0.0.

---

## Releases

`dev` → `pre-release` → `main`.

A push to `pre-release` builds a signed APK and opens a draft release for testing on a real
device. Once it is confirmed, it is merged into `main`, tagged, and published.

The application id and signing key are unchanged from the previous React Native release, so the
native app installs over the existing one.

---

## Documentation

- [`docs/SPEC.md`](docs/SPEC.md) — what the app is
- [`docs/TECHNICAL_ARCHITECTURE.md`](docs/TECHNICAL_ARCHITECTURE.md) — how it is built
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens, type, rules
- [`docs/FEATURE_ROADMAP.md`](docs/FEATURE_ROADMAP.md) — what is being built
- [`docs/TESTING.md`](docs/TESTING.md) — what is tested
- [`AGENTS.md`](AGENTS.md) — the rules for AI agents working on this repo

The previous React Native app is preserved on the `legacy/react-native` branch.

---

## License

MIT + Non-Commercial. See [`LICENSE`](LICENSE).

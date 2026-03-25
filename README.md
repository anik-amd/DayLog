# DayLog

> ⚠️ **Pre-Release Notice**  
> This app is in active development (v0.1.x). Bugs, unfinished features, and UI changes are expected.  
> **Use at your own risk.** Backup your data regularly and report issues on GitHub.

[![License](https://img.shields.io/badge/license-MIT%20%2B%20Non--Commercial-red)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.1-blue)](package.json)
[![Platform](https://img.shields.io/badge/platform-Android-green)](https://play.google.com/store)
[![React Native](https://img.shields.io/badge/React%20Native-0.83.2-61DAFB)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-55-blue)](https://expo.dev)

**DayLog** is a fast, minimal, and offline-first personal diary application designed to capture thoughts instantly without distractions. It emphasizes speed and a smooth quick-entry experience, allowing users to write as naturally as texting in a messaging app.

## Core Philosophy

- **Speed Over Complexity:** The app is built with rapid thought capture in mind. Open the app and start typing immediately.
- **Minimal & Distraction-Free:** Unnecessary features have been omitted to maintain a calm and clean user interface. 
- **Offline-First Storage:** All diary entries and media reside strictly on the local device by default. Backups happen over Google Drive, ensuring complete control over user data.
- **Robustness:** No over-engineering and minimal reliance on heavy libraries. It prioritizes a reliable user experience out of the box.

## Features

- **Quick Entry** - Start typing instantly with auto-save
- **Timeline View** - Browse entries in a clean chronological list
- **Markdown Support** - Write with formatting, keep full editability
- **Media Attachments** - Add photos to entries
- **Tag System** - Organize entries with custom tags
- **Calendar View** - Navigate entries by date
- **Search** - Find entries quickly
- **Google Drive Backup** - Optional cloud backup
- **Multiple Themes** - Choose your preferred color scheme

## Tech Stack

- **Framework:** React Native + Expo (Managed Workflow)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Routing:** React Navigation (Native Stack)
- **Storage:** Expo SQLite for rapid database access and local file storage for media.
- **Format:** Fully editable Markdown text system.

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/anik-amd/DayLog.git
   cd DayLog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web

### Building APK

To build a standalone Android APK:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/`

---

## Documentation

For detailed documentation, see the `/docs` folder:

| File | Description |
|------|-------------|
| [SPEC.md](docs/SPEC.md) | Philosophy, features, and app goals |
| [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | Technical architecture and design |
| [FEATURE_ROADMAP.md](docs/FEATURE_ROADMAP.md) | Development roadmap and priorities |
| [THEME_CREATION.md](docs/THEME_CREATION.md) | Guide to creating new color themes |

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

For AI agents contributing to this project, please read [AGENTS.md](AGENTS.md) for development workflow and guidelines.

---

## License

This project is licensed under the **MIT License with Non-Commercial Use Restriction**.

See [LICENSE](LICENSE) for full details.

---

## Acknowledgments

- [Expo](https://expo.dev) - For the amazing development platform
- [React Native](https://reactnative.dev) - For the cross-platform framework
- [NativeWind](https://nativewind.dev) - For Tailwind CSS on React Native
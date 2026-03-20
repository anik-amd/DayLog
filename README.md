# DayLog

**DayLog** is a fast, minimal, and offline-first personal diary application designed to capture thoughts instantly without distractions. It emphasizes speed and a smooth quick-entry experience, allowing users to write as naturally as texting in a messaging app.

## Core Philosophy

- **Speed Over Complexity:** The app is built with rapid thought capture in mind. Open the app and start typing immediately.
- **Minimal & Distraction-Free:** Unnecessary features have been omitted to maintain a calm and clean user interface. 
- **Offline-First Storage:** All diary entries and media reside strictly on the local device by default. Backups happen over Google Drive, ensuring complete control over user data.
- **Robustness:** No over-engineering and minimal reliance on heavy libraries. It prioritizes a reliable user experience out of the box.

## Tech Stack

- **Framework:** React Native + Expo (Managed Workflow)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Routing:** React Navigation (Native Stack)
- **Storage:** Expo SQLite for rapid database access and local file storage for media.
- **Format:** Fully editable Markdown text system.

---

### Setup & Development

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Metro bundler:
   ```bash
   npx expo start
   ```

3. Type `a`, `i`, or `w` to open it on an Android simulator, iOS simulator, or Web browser, respectively. To clear the bundler cache, pass the `-c` flag.

# DayLog – Feature Development Roadmap

This document defines the exact order in which the DayLog application must be built.

AI agents must strictly follow the phases below and must not skip phases or implement advanced features before the basic system is stable.

The goal is to build a fast, stable, offline-first diary application step by step.

---

# Phase 1 – Project Foundation

## Objective

Create a clean, working React Native (Expo) project with a stable structure.

## Tasks

1. Initialize a new Expo project using TypeScript
2. Install required base dependencies:
   - React Navigation
   - NativeWind (Tailwind for React Native)
   - SQLite

3. Create the folder structure defined in the architecture document
4. Create empty screens:
   - EntriesScreen
   - SettingsScreen

5. Implement navigation between screens
6. Implement dark mode as the default theme

## Result of Phase 1

The app should run on Android and show two empty screens with working navigation.

---

# Phase 2 – Local Database System

## Objective

Create a stable offline storage system before building features.

## Tasks

1. Set up SQLite
2. Create the entries table
3. Create the media table
4. Create database helper functions:
   - createEntry()
   - updateEntry()
   - deleteEntry()
   - getAllEntries()

5. Create a test entry on app launch
6. Display database entries on the screen (simple text list is enough)

## Result of Phase 2

The app must be able to store and load entries locally even after closing and reopening.

---

# Phase 3 – Timeline Screen (Basic Version)

## Objective

Create a simple but stable timeline screen.

## Tasks

1. Replace the test list with a FlatList
2. Create the EntryCard component
3. Display:
   - date
   - entry preview text

4. Sort entries by newest first
5. Make sure scrolling is smooth
6. Ensure large entries do not break layout

## Result of Phase 3

The app should now feel like a working diary (text only).

---

# Phase 4 – Quick Entry System

## Objective

Build the most important feature: quick entry input.

## Tasks

1. Create the QuickEntryBar component
2. Place it at the bottom of the screen
3. Allow the user to type text quickly
4. Automatically create an entry when the user starts typing
5. Implement auto-save
6. Add basic expand behavior (input grows when text becomes longer)

## Result of Phase 4

The user should be able to open the app and instantly write something without opening another screen.

---

# Phase 5 – Full Screen Editor

## Objective

Allow long-form writing when the user wants it.

## Tasks

1. Create FullScreenEditor component
2. Add expand button to QuickEntryBar
3. Pass entry data to the full editor
4. Support long entries
5. Support editing old entries

## Result of Phase 5

The app now supports both short notes and long diary entries.

---

# Phase 6 – Markdown Support

## Objective

Add Markdown writing and rendering.

## Tasks

1. Save entries as Markdown text
2. Render Markdown inside EntryCard
3. Support:
   - headings
   - lists
   - bold text
   - line breaks

4. Ensure performance remains smooth

## Result of Phase 6

Entries now look structured and readable.

---

# Phase 7 – Media Support

## Objective

Allow users to attach images, audio, and video.

## Tasks

1. Add image picker
2. Add camera support
3. Add audio recording
4. Save media locally
5. Link media to entries
6. Show image preview inside EntryCard
7. Add simple audio playback
8. Add video preview

## Result of Phase 7

The app becomes a full multimedia diary.

---

# Phase 8 – Mini Calendar

## Objective

Add a small calendar for navigation.

## Tasks

1. Create MiniCalendar component
2. Highlight days that contain entries
3. Allow clicking a date to filter entries
4. Ensure it remains minimal and lightweight

## Result of Phase 8

Users can easily navigate old entries.

---

# Phase 9 – Settings System

## Objective

Create a minimal settings page.

## Tasks

1. Add theme toggle:
   - dark
   - light
   - system default

2. Add export to JSON
3. Add export to PDF
4. Add manual backup button

## Result of Phase 9

The app becomes stable for long-term use.

---

# Phase 10 – Google Drive Backup

## Objective

Allow secure backup of entries and media.

## Tasks

1. Implement Google sign-in
2. Convert entries to JSON
3. Upload JSON to Google Drive
4. Upload media files
5. Add restore from backup

## Result of Phase 10

Users will not lose their journal data.

---

# Phase 11 – Performance Optimization

## Objective

Make the app fast and smooth.

## Tasks

1. Optimize FlatList rendering
2. Lazy load media previews
3. Improve scrolling performance
4. Reduce unnecessary re-renders
5. Optimize large entries

## Result of Phase 11

The app should feel fast even with many entries.

---

# Phase 12 – Android Widget

## Objective

Add a home screen widget for quick entry.

## Tasks

1. Create quick text entry widget
2. Add quick image capture
3. Add quick audio recording
4. Open the quick entry popup from widget

## Result of Phase 12

DayLog becomes a truly fast capture tool.

---

# Rules for AI Agents

Agents must follow these rules:

1. Do not implement Phase 7 before Phase 4 is stable
2. Do not implement backup before the database system is stable
3. Do not add extra features outside this roadmap
4. Always test each phase before moving forward
5. Keep the UI minimal at every stage
6. Avoid unnecessary libraries
7. Do not over-engineer

---

# Final Goal

The final app should feel:

- fast
- minimal
- distraction-free
- reliable
- calm
- easy to use every day

If the app becomes complicated, the project has failed.

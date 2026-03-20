# DayLog – Technical Architecture Specification

This document defines the full technical structure of the DayLog application.
It is written specifically for AI agents that will generate and maintain the codebase.

This file focuses only on architecture, folder structure, data flow, and implementation rules.

---

# 1. Technology Stack

## 1.1 Frontend

The application must be built using:

- React Native
- Expo (managed workflow)
- TypeScript
- NativeWind (Tailwind for React Native)
- React Navigation

The codebase must be written in a way that it can later support:

- React Native Web
- Desktop version (via web build)

---

## 1.2 Storage

The app must work **offline-first**.

Required storage systems:

- SQLite (for entries and metadata)
- Local file storage (for media files)
- JSON export system (for backups)
- Google Drive API (backup only, not real-time sync)

---

## 1.3 Content System

Entries must be stored as:

- Markdown text
- Media file references
- Timestamps

Markdown must not be converted before saving. It must always be stored as raw text.

---

# 2. Project Folder Structure

The project must follow a clean and scalable folder structure.

```
src/
│
├── app/
│   ├── entries/
│   │   ├── EntriesScreen.tsx
│   │   └── EntryCard.tsx
│   │
│   ├── editor/
│   │   ├── QuickEntryBar.tsx
│   │   ├── ExpandedEditor.tsx
│   │   └── FullScreenEditor.tsx
│   │
│   ├── settings/
│   │   └── SettingsScreen.tsx
│   │
│   └── navigation/
│       └── RootNavigator.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── TextArea.tsx
│   │   └── Modal.tsx
│   │
│   ├── calendar/
│   │   └── MiniCalendar.tsx
│   │
│   └── media/
│       ├── ImagePreview.tsx
│       ├── AudioPlayer.tsx
│       └── VideoPreview.tsx
│
├── database/
│   ├── db.ts
│   ├── entries.ts
│   └── migrations.ts
│
├── storage/
│   ├── fileStorage.ts
│   ├── mediaManager.ts
│   └── backupManager.ts
│
├── markdown/
│   ├── markdownParser.ts
│   └── markdownRenderer.tsx
│
├── hooks/
│   ├── useEntries.ts
│   ├── useAutoSave.ts
│   └── useMedia.ts
│
└── types/
    ├── Entry.ts
    └── Media.ts
```

---

# 3. Data Model

## 3.1 Entry Type

Every journal entry must follow this structure:

```
id: string
content: string
createdAt: number
updatedAt: number
date: string
media: Media[]
```

---

## 3.2 Media Type

Media must follow this structure:

```
type: "image" | "video" | "audio" | "file"
path: string
preview?: string
createdAt: number
```

---

# 4. Database Structure (SQLite)

## Table: entries

Columns:

```
id TEXT PRIMARY KEY
content TEXT
createdAt INTEGER
updatedAt INTEGER
date TEXT
```

---

## Table: media

Columns:

```
id TEXT PRIMARY KEY
entryId TEXT
type TEXT
path TEXT
createdAt INTEGER
```

---

# 5. Entry Creation Flow

This section defines exactly how the app must create entries.

### Step 1: User types in quick entry bar

The app must immediately create a temporary entry in memory.

### Step 2: Auto-save triggers

Auto-save must trigger when:

- user stops typing
- user exits the app
- user navigates away

### Step 3: Save to SQLite

The entry must be saved immediately to SQLite.

### Step 4: Media is attached (if any)

Media must be saved locally first, then linked to the entry.

---

# 6. Editor System Architecture

The editor must be divided into 3 components.

## 6.1 QuickEntryBar

Purpose:

- fast 1–2 line entry
- appears at bottom of timeline

---

## 6.2 ExpandedEditor

Purpose:

- appears when text becomes longer
- still remains on the same screen

---

## 6.3 FullScreenEditor

Purpose:

- used for long writing
- supports full markdown editing
- supports media attachments

---

# 7. Media Handling System

Media must be handled using a centralized system.

## Required features:

- Save image locally
- Save video locally
- Record audio
- Store file paths
- Generate preview thumbnails (if needed)

---

# 8. Auto Save System

Auto-save must be implemented using a reusable hook.

Example:

- `useAutoSave()`

Auto-save rules:

- Save after 1–2 seconds of inactivity
- Save when app goes to background
- Save when user leaves editor screen

---

# 9. Timeline Rendering System

The timeline must:

- load entries from SQLite
- render using FlatList
- collapse long entries automatically
- support media preview
- load fast even with many entries

---

# 10. Backup System Architecture

Backup must work like this:

### Step 1: Convert entries to JSON

### Step 2: Copy media files

### Step 3: Upload to Google Drive

### Step 4: Allow restore from backup

Backup must never block the main UI thread.

---

# 11. Performance Requirements

The app must:

- open in under 2 seconds
- scroll smoothly
- load entries instantly
- support large entries without lag
- support many media files

---

# 12. Coding Rules for AI Agents

AI agents must follow these rules:

- Use functional components only
- Use TypeScript everywhere
- Avoid class components
- Avoid unnecessary libraries
- Avoid large UI frameworks
- Write modular reusable code
- Keep logic simple and readable
- Use hooks whenever possible

---

# 13. Future Compatibility

The architecture must support:

- Web version
- Desktop version
- Multi-device backup
- Large number of entries
- Large media files

Do not write code that only works for Android.

---

# 14. Final Technical Goal

The final codebase must be:

- clean
- scalable
- minimal
- offline-first
- easy for AI agents to continue developing

The system must prioritize simplicity over complexity.

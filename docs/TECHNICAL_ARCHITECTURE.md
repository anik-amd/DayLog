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
- AsyncStorage (for settings)
- JSON export system (for backups)
- Google Drive API (backup only, not real-time sync)

---

## 1.3 External Services

The app integrates with:

- **Open-Meteo API**: Free weather API for fetching current weather data
- **Fuse.js**: Client-side fuzzy search for entry search functionality
- **Google OAuth + Drive API**: For backup functionality

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
│   │   ├── EntriesScreen.tsx      # Main timeline screen
│   │   ├── EntryCard.tsx          # Entry display component
│   │   ├── CalendarStrip.tsx      # Horizontal calendar strip
│   │   └── ReadEntryScreen.tsx    # Full entry view screen
│   │
│   ├── editor/
│   │   ├── QuickEntryBar.tsx      # Bottom quick entry input
│   │   ├── FullScreenEditor.tsx   # Full screen editor
│   │   ├── Picker.tsx             # Custom date/time picker (web)
│   │   ├── ClockPicker.tsx        # Time picker component
│   │   └── WebPicker.tsx          # Web picker component
│   │
│   ├── settings/
│   │   └── SettingsScreen.tsx    # Settings page
│   │
│   ├── search/
│   │   └── SearchScreen.tsx       # Search screen
│   │
│   ├── map/
│   │   └── MapScreen.tsx          # Map screen (placeholder)
│   │
│   └── navigation/
│       ├── RootNavigator.tsx      # Root navigation
│       └── TabBar.tsx             # Custom bottom tab bar
│
├── components/
│   ├── ui/
│   │   ├── ConfirmationModal.tsx # Confirmation dialog
│   │   ├── Pill.tsx               # Reusable pill component
│   │   └── ...
│   │
│   ├── TagStrip.tsx               # Horizontal tag strip
│   ├── TagPill.tsx                # Tag pill component
│   └── TagSelectorModal.tsx       # Tag selection modal
│
├── database/
│   ├── db.ts                      # SQLite initialization
│   ├── entries.ts                 # Entry CRUD operations
│   ├── tags.ts                    # Tag management
│   └── media.ts                   # Media CRUD operations
│
├── storage/
│   └── settings.ts                # AsyncStorage settings
│
├── services/
│   ├── WeatherService.ts          # Open-Meteo API integration
│   └── BackupEngine.ts            # Google Drive backup
│
├── themes/
│   └── colors.ts                  # Color scheme definitions
│
├── contexts/
│   └── ColorSchemeContext.tsx     # Theme context provider
│
├── hooks/
│   ├── useThemeColors.ts          # Theme colors hook
│   ├── useAutoSave.ts             # Auto-save hook
│   ├── useResponsive.ts           # Device info (tablet, landscape, font scale)
│   └── useKeyboardHeight.ts       # Keyboard height detection
│
├── utils/
│   ├── responsive.ts              # Scaling functions (moderateScale, breakpoints)
│   └── spacing.ts                 # Responsive spacing constants
│
├── markdown/
│   └── MarkdownRenderer.tsx       # Markdown rendering
│
└── types/
    ├── Entry.ts                   # Entry type definition
    └── Media.ts                   # Media type definition
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
date: string            // YYYY-MM-DD format
time?: string           // HH:MM format, optional
latitude?: number       // GPS latitude, optional
longitude?: number      // GPS longitude, optional
locationFull?: string   // Full address, optional
locationDisplay?: string // Short display address, optional
weather?: string        // e.g., "22°C Clear sky", optional
tags?: string           // Comma-separated extracted hashtags, optional
media?: Media[]         // Array of media items, optional
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
time TEXT
latitude REAL
longitude REAL
locationFull TEXT
locationDisplay TEXT
weather TEXT
tags TEXT
```

Indexes:
- `idx_entries_date` on `date` column

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

## Table: tags

Columns:

```
name TEXT PRIMARY KEY
count INTEGER DEFAULT 0
createdAt INTEGER
```

Used for tracking tag usage counts and sorting by popularity.

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
- AI agents MUST always run type checking (e.g., `npx tsc --noEmit`) after updating code to ensure type safety.
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

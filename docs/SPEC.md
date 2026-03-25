# DayLog – Product & Development Specification

## 1. What DayLog Is

DayLog is a minimal, fast, distraction-free diary application focused on **quick capture first, long writing later**.

It is not a traditional diary app where the user opens a page and writes a long entry. Instead, it is designed for people who:

- want to quickly capture thoughts throughout the day
- may write only 1–2 lines at a time
- may attach images, voice recordings, or location/weather data
- want everything automatically organized into a timeline
- want to organize entries with tags

DayLog should feel closer to a messaging input box than a writing application.

---

## 2. Core Philosophy

The design and development of DayLog must follow these principles:

### 2.1 Capture must be instant

The user should be able to write something in less than 3 seconds after opening the app.

### 2.2 Writing must feel calm and minimal

The UI must never feel busy, colorful, or distracting. The app should feel quiet and minimal.

### 2.3 The user should never feel forced to write long entries

Short notes must feel just as valid as long entries.

### 2.4 The timeline is more important than the editor

Users will spend more time reading past entries than writing new ones.

### 2.5 The app must work offline first

All data must be stored locally. Internet is only used for backup.

---

## 3. Target User Behavior

DayLog is designed for a user who:

- writes small thoughts throughout the day
- sometimes writes long entries at night
- wants to quickly attach images or voice recordings
- does not want a complicated journaling system
- prefers minimal tools

---

## 4. Platforms

Initial platform:

- Android (primary platform)

Future platforms:

- Web (using the same codebase)
- Windows (via web version)
- Possibly Linux later

The architecture must support cross-platform expansion.

---

## 5. Core Features

### 5.1 Timeline (Main Screen)

The main screen of the app is the timeline.

It must:

- show entries in chronological order (newest first)
- collapse large entries automatically
- show a preview of text
- show media previews if present (image)
- feel smooth while scrolling
- include a **calendar strip** at the top for date navigation
- show dots on dates that have entries
- support **tag filtering** - tap tags to filter entries
- support **AND logic** for multiple tag selection

The timeline is the default screen when the app opens.

---

### 5.2 Quick Entry System (Most Important Feature)

Instead of opening a full editor page, the app must open a **small full-width input popup at the bottom**.

This input should behave like a messaging input box.

#### Quick Entry Pills

The quick entry bar includes several metadata pills:

- **Tags**: Automatically extracted from `#hashtag` in content
- **Date**: Tap to change entry date (defaults to today)
- **Time**: Tap to change entry time (defaults to current time)
- **Location**: Tap to fetch current GPS location (reverse geocoded address)
- **Weather**: Tap to fetch current weather (via Open-Meteo API)
- **Photo**: Tap to attach images from gallery

#### Behaviour:

1. User opens the app
2. A small input bar appears at the bottom with pills row
3. User can write quickly (1–2 lines)
4. Tags are automatically extracted from `#hashtag` syntax
5. User can tap pills to add location/weather data
6. If text becomes longer, the input expands automatically
7. If the user taps the expand arrow, the editor opens in full screen

This is the main way users will create entries.

---

### 5.3 Expandable Editor

The editor has 3 states:

#### State 1: Small quick input

- single small input box
- used for fast thoughts

#### State 2: Expanded input

- grows automatically when text becomes longer
- still stays on the timeline screen

#### State 3: Full screen editor

Triggered when:

- the user presses the expand arrow
- the user attaches media
- the text becomes long
- the user wants to edit properly

---

### 5.4 Markdown Support

All entries must support Markdown.

The editor must allow:

- headings
- bold text
- italic text
- lists
- paragraphs
- line breaks
- inline images
- inline media references

Markdown must be stored as raw text in the database.

---

### 5.5 Media Support

Users must be able to attach:

- images
- videos
- audio recordings
- files (PDF, documents, etc.)

Behaviour rules:

- Images and videos must show preview in the timeline
- Audio must be playable directly inside the app
- Files must open using the system default app
- Media must be stored locally first

---

### 5.6 Auto Save

The app must automatically save entries.

The user should never need to press a save button.

Auto-save should happen when:

- the user stops typing
- the user exits the editor
- the app goes to background

---

### 5.7 Mini Calendar

At the top of the timeline screen, there must be a small calendar.

Purpose:

- show which days have entries
- allow quick navigation to a specific date

The calendar must be minimal and not visually heavy.

---

### 5.8 Settings Page

The settings page must remain minimal.

Initial features:

- theme selection (dark / light / system default)
- color scheme selection (Default, Dracula, Nord)
- temperature unit (Celsius / Fahrenheit)
- export entries to JSON
- backup to Google Drive
- app statistics (total entries, total photos)

No unnecessary settings should be added.

---

### 5.9 Google Drive Backup

Backup rules:

- all entries must be stored in JSON format
- media files must be stored in a separate folder
- backup must not require internet all the time
- backup should be manual first
- automatic backup can be added later

---

### 5.10 Android Widget

The app must support a home screen widget.

The widget should allow:

- quick text entry
- quick image capture
- quick audio recording
- opening the quick entry popup

The widget must be fast and minimal.

---

### 5.11 Tag System

The app uses a hashtag-based tag system:

- Tags are extracted automatically from `#hashtag` syntax in entry content
- Tags are stored in a dedicated `tags` table with usage count
- Users can filter entries by one or more tags (AND logic)
- Tag strip appears below the calendar on the timeline
- Most used tags appear first in the tag selector modal

---

### 5.12 Search Screen

The app includes a dedicated search screen (accessible via bottom tab):

- Full-text search across entry content using Fuse.js
- Tag search (prefix with `#`)
- Search results show entry preview with date
- Popular tags displayed when search is empty
- Click on tag to filter timeline by that tag

---

### 5.13 Map Screen

The app includes a map screen (placeholder, accessible via bottom tab):

- Currently shows "Map coming soon" placeholder
- Future: View entries on a map by location

---

### 5.14 Color Schemes

The app supports multiple color schemes (themes):

- **Default**: Indigo accent
- **Dracula**: Purple/pink accent
- **Nord**: Frost blue accent

Each scheme has both light and dark variants. Users can switch between schemes in Settings.

---

## 6. Data Structure

Each entry must contain:

- id
- content (markdown)
- createdAt (timestamp)
- updatedAt (timestamp)
- date (YYYY-MM-DD format)
- time (optional, HH:MM format)
- latitude (optional)
- longitude (optional)
- locationFull (optional, full address)
- locationDisplay (optional, short display address)
- weather (optional, e.g., "22°C Clear sky")
- tags (optional, comma-separated extracted from content)
- media array (optional)

Media object structure:

- type (image / video / audio / file)
- path (local file path)
- createdAt (timestamp)

The structure must work offline and must not depend on a server.

---

## 7. UI Philosophy

The UI must follow these rules:

- minimal design
- dark theme first
- no bright colors
- no large animations
- smooth scrolling
- calm typography
- clean layout
- no unnecessary icons

The app must feel more like a notebook than a productivity tool.

---

## 7.1 Responsive Design & Accessibility

The app must be fully responsive across all screen sizes and configurations:

### Screen Size Support

- **Phones** (320px - 767px): Primary target, optimized for portrait and landscape
- **Tablets** (768px+): Enhanced layouts with larger spacing, wider components
- **Landscape Mode**: Adjusted layouts, increased content visibility, proper padding
- **Foldables**: Dynamic adaptation using window dimensions

### Responsive Implementation

- All dimensions use scaling functions based on reference screen (390x844)
- `moderateScale()` provides non-linear scaling for a natural feel
- `useResponsive` hook provides device information throughout the app
- Breakpoints: xs (<375), sm (375-413), md (414-767), lg (768-1024), xl (1024+)

### Accessibility

- Respects system font scale (accessibility settings)
- Touch targets minimum 44px (Material Design guidelines)
- Proper contrast ratios maintained across color schemes
- Dynamic type scaling respects user preferences

---

## 8. Technical Requirements

The project must use:

- React Native (Expo)
- Tailwind (NativeWind)
- SQLite for local storage
- Local file storage for media
- Google Drive API for backup
- Markdown rendering library

The architecture must support:

- Android first
- Web later
- Windows later

---

## 9. Development Philosophy for AI Agents

AI agents working on this project must follow these rules:

1. Do not over-engineer
2. Do not add unnecessary features
3. Keep everything minimal
4. Focus on performance and speed
5. Prefer simple logic over complex logic
6. AI agents MUST always run type checking after updating code to ensure type safety.
7. Avoid large UI libraries
8. Always prioritize the quick-entry experience

---

## 10. User Experience Goal

The final experience should feel like this:

The user opens the app → writes something quickly → closes the app → later opens the app again and sees a clean timeline of thoughts.

If the app feels fast, minimal, and calm, then the project is successful.

---

## 11. Future Features (Not Required Now)

Possible future features:

- tags
- search
- mood tracking
- location tagging
- AI summary of entries
- encrypted private entries
- web sync

These must NOT be implemented in the first version.

---

## 12. Final Goal

DayLog should become a tool that helps users capture their life in small moments instead of forcing them to write long diary entries.

The most important feature is not the editor.
The most important feature is the ability to write quickly at any moment.

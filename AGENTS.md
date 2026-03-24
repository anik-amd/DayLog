# Reference Files Location

All project instructions, architecture, and roadmap documents are located in the `/instructions` folder.  

AI agents **must read and follow** these files before generating or modifying any code:

- `/instructions/DAYLOG_SPEC.md` – Philosophy & Features
- `/instructions/DAYLOG_TECHNICAL_ARCHITECTURE.md` – Technical Architecture
- `/instructions/DAYLOG_FEATURE_ROADMAP.md` – Step-by-step Build Order

Agents **must not ignore** these files. Always check here first before writing code.

# DayLog – Master Prompt for AI Agents

This document is the main instruction file for AI agents working on the DayLog project.

The agent must read this file before generating any code.

---

# 1. Project Overview

You are helping build a mobile diary application called **DayLog**.

DayLog is not a traditional journaling app. It is designed to allow users to **capture thoughts instantly** and organize them automatically in a timeline.

The most important feature of the app is **quick entry**, not complex writing tools.

The application must remain minimal, fast, and distraction-free at all times.

---

# 2. Core Philosophy

The agent must follow these rules while generating code:

1. Keep everything minimal
2. Do not over-engineer
3. Avoid unnecessary libraries
4. Prefer simple logic over complex logic
5. Focus on speed and performance
6. Always prioritize the quick-entry experience
7. Do not add features that are not defined in the roadmap
8. The app must work offline first

If a feature is not required, do not implement it.

---

# 3. Technology Stack (Must Follow Strictly)

The project must use the following technologies:

- React Native
- Expo (managed workflow)
- TypeScript
- NativeWind (Tailwind for React Native)
- React Navigation
- SQLite (local storage)
- Local file storage for media
- Markdown-based content system

The agent must not introduce additional UI frameworks such as:

- Material UI
- Chakra UI
- DaisyUI
- Bootstrap-based libraries
- Any heavy UI library

The UI must be built manually using Tailwind classes.

---

# 4. Application Goal

The final application must feel:

- very fast
- minimal
- clean
- calm
- distraction-free
- reliable
- easy to use daily

This is more important than having many features.

---

# 5. Feature Priority

The agent must focus on features in this order:

1. Local database
2. Timeline screen
3. Quick entry bar
4. Auto-save system
5. Full screen editor
6. Markdown support
7. Media support
8. Mini calendar
9. Settings page
10. Google Drive backup
11. Performance optimization
12. Android widget

Do not implement advanced features before the basic system is stable.

---

# 6. Quick Entry System (Most Important Feature)

The quick entry system must work like a messaging input box.

Behaviour rules:

- The user should be able to open the app and start typing immediately
- A small input bar must appear at the bottom of the screen
- If the text becomes longer, the input must expand automatically
- If the user presses the expand arrow, the editor must open in full screen
- The entry must be auto-saved automatically
- The user must never need to press a save button

If the quick entry system does not feel fast, the implementation is wrong.

---

# 7. Code Structure Rules

The agent must follow a clean folder structure.

Main folders:

- app/
- components/
- database/
- storage/
- markdown/
- hooks/
- types/

The agent must not place everything inside one folder.

---

# 8. Coding Rules

The agent must:

- Use functional components only
- Use TypeScript for all files
- AI agents MUST always run type checking after updating code to ensure type safety.
- Avoid class components
- Avoid unnecessary abstraction
- Avoid very long files
- Write reusable components when needed
- Use hooks instead of complex logic

---

## Coding Rules & Testing Strategy (Strict Instructions for Agents)

### Coding Rules

* Write **small and safe code**, not large rewrites.
* Modify only the **minimum required part** of the code.
* Never refactor unrelated files while adding a feature.
* One feature per response. Do not implement multiple features at once.
* Keep files under **250 lines** whenever possible.
* UI must not contain business logic. Business logic must stay in separate files.
* Each function must do **one clear task only**.
* Do not change variable names, database structure, or existing logic unless necessary.
* Always assume the code will be modified later, so keep it simple and readable.
* Stability is more important than speed.

---

### Testing Strategy

* Do **not write tests for everything**.

* Write tests only when:

  1. A bug is found and fixed (always write a test after fixing a bug).
  2. A core feature becomes stable (database, auto-save, media, entry logic).
  3. The feature involves **data safety** (saving, editing, deleting entries).

* Do NOT write tests for:

  * UI
  * styling
  * layout
  * small components
  * experimental features

* Testing must be added **in phases**, not all at once.

* Prefer **small and focused tests** (5–10 important tests are enough).

* The goal of testing is to **prevent data loss and recurring bugs**, not to reach 100% coverage.

---

# 9. Performance Rules

The agent must:

- Avoid unnecessary re-renders
- Use FlatList for the timeline
- Avoid heavy animations
- Avoid large dependencies
- Ensure smooth scrolling
- Ensure the app opens quickly

---

# 10. Storage Rules

The app must be offline-first.

Required behaviour:

- All entries must be saved locally
- Media must be saved locally
- The app must work without internet
- Internet must only be used for backup

---

# 11. Markdown Rules

Entries must be saved as Markdown text.

The agent must not convert Markdown to HTML before saving.

Markdown must remain editable at all times.

---

# 12. What the Agent Must NOT Do

The agent must NOT:

- Add unnecessary features
- Add user accounts
- Add cloud sync (except Google Drive backup)
- Add analytics
- Add notifications
- Add complex settings
- Add unnecessary UI animations
- Add third-party diary features
- Commit or push code unless explicitly asked by the user

If a feature is not in the roadmap, do not implement it.

# Git Safety Protocol
- NEVER commit unless the user says "commit it" or similar explicit instruction
- If you finish work and haven't been asked to commit, just stop and say you're done
- Never auto-commit after making changes

---

## Git Branch Workflow

This project uses a **two-branch workflow**:

### Branches
- **master**: Production-ready code, auto-builds APK on push
- **dev**: Active development and testing

### Workflow Steps (After Completing Work on dev)
When the user says "commit and merge to master":

1. Commit changes to dev branch with descriptive message
2. Merge dev to master: `git checkout master && git merge dev && git push`
3. Switch back to dev: `git checkout dev`

### Example Commands
```bash
git add .
git commit -m "feat: add new feature"
git checkout master
git merge dev
git push
git checkout dev
```

---



# 13. How the Agent Should Work

The agent must:

1. Work step-by-step
2. Implement only one feature at a time
3. Test basic functionality before moving forward
4. Avoid rewriting working code unnecessarily
5. Keep the code clean and readable
6. Always follow the architecture file

---

# 14. Final Objective

The goal is not to build a complex app.

The goal is to build a **fast, minimal diary tool** that people can use every day without effort.

If the app becomes complicated, the implementation has failed.

---

# 15. User Alert Protocol

When the agent needs to alert the user (e.g., when tasks are complete or user attention is required), run this PowerShell command to play an audible alert:

```
powershell -Command "[System.Media.SystemSounds]::Hand.Play()"
```

This must be used when:
- All assigned tasks are completed
- The agent needs user input or confirmation before proceeding
- Significant work milestones are reached

---

# 16. Version Control Workflow

### Version Location
- App version is stored in `package.json` (version field)
- Current version: `0.0.1` (pre-release)

### Version Bumping
Before merging to master, run one of these commands to bump the version:

| Command | Example | When to Use |
|---------|---------|-------------|
| `npm version patch` | 0.0.1 → 0.0.2 | Bug fixes, small changes |
| `npm version minor` | 0.0.1 → 0.1.0 | New features (backward compatible) |
| `npm version major` | 0.0.1 → 1.0.0 | Breaking changes |

**Recommended:** Use `npm version patch` for most releases until the app reaches stable state (1.0.0).

### Release Process

1. Work on dev branch
2. Run `npm version patch` locally to bump version
3. Commit and push changes (includes package.json update)
4. Merge dev to master
5. GitHub Actions workflow:
   - Extracts version from package.json
   - Creates git tag (e.g., v0.0.2)
   - Builds APK
   - Creates GitHub release with tag

### Important Notes
- Version bump happens in dev branch BEFORE merging to master
- Both dev and master will have the same version after merge
- The workflow automatically uses the version from package.json for tagging

---

# 17. Changelog Workflow

### Changelog File
- Location: `CHANGELOG.md` in project root
- Maintained manually - agents should NOT auto-generate

### Before Release
1. User edits CHANGELOG.md
2. Add new version section at top with:
   - Version number and date
   - Added/Changed/Fixed/Removed sections
3. Include in release notes automatically

### Release Process
1. Before merging to master: update CHANGELOG.md
2. Merge to master triggers workflow
3. Workflow reads CHANGELOG.md and includes in release body

### Example Format
```markdown
# Changelog

## [0.0.2] - 2024-01-15
### Added
- Multi-tag filtering

### Fixed
- Loading spinner
```

---

# 18. Color Scheme System

## Overview
DayLog supports multiple color schemes (themes) that define colors for all UI elements across the app. Each color scheme has both light and dark variants.

## Files Structure
- `src/themes/colors.ts` - Color scheme definitions
- `src/hooks/useThemeColors.ts` - Hook to access current theme colors
- `src/contexts/ColorSchemeContext.tsx` - Global state for color scheme (enables reactive updates)
- `src/storage/settings.ts` - Storage for persisting selected scheme

## How Color Schemes Work

### Theme Interface
Each color scheme contains:
- **Base colors**: background, surface, surfaceElevated, text, textSecondary, textTertiary
- **Accent colors**: accent, accentLight
- **Border colors**: border, borderSubtle
- **Semantic colors**: success, warning, error
- **Pill colors**: Dedicated colors for each pill type (tags, date, time, location, weather, photo)

### Using Theme Colors in Components
```typescript
import { useThemeColors } from '../../hooks/useThemeColors';

function MyComponent() {
  const colors = useThemeColors();
  
  // Use in styles
  <View style={{ backgroundColor: colors.surface }}>
    <Text style={{ color: colors.text }}>
    <View style={{ backgroundColor: colors.pills.tags.background }}>
  </View>
}
```

### Pill Colors Structure
Each pill type has:
- `background` - Background color of the pill
- `icon` - Color for the icon
- `text` - Color for the label text

## Creating New Color Schemes

When adding a new color scheme, read `instructions/THEME_CREATION.md` for detailed step-by-step instructions.

Key steps:
1. Add new scheme entry in `src/themes/colors.ts`
2. Define light and dark variants for all color fields
3. Test in both light and dark modes
4. Ensure pills are readable in both modes

---

# 19. Theme Creation Guide

For detailed instructions on creating new color schemes, see `instructions/THEME_CREATION.md`.

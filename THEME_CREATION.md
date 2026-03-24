# Theme Creation Guide

This document provides step-by-step instructions for creating new color schemes in DayLog.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Color Scheme Interface](#color-scheme-interface)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Color Recommendations](#color-recommendations)
6. [Testing](#testing)
7. [Common Pitfalls](#common-pitfalls)

---

## Overview

DayLog uses a color scheme system that allows each theme to have distinct colors for:
- Backgrounds (screen, surface, elevated)
- Text (primary, secondary, tertiary)
- Accent colors (brand colors)
- Borders
- Semantic colors (success, warning, error)
- Pill colors (tags, date, time, location, weather, photo)

Each color scheme defines both **light** and **dark** variants. When a user selects a color scheme, it applies to both dark and light modes.

---

## File Structure

The color scheme system consists of these key files:

```
src/
├── themes/
│   └── colors.ts          # Color scheme definitions (MAIN FILE TO EDIT)
├── hooks/
│   └── useThemeColors.ts   # Hook to access theme colors in components
├── contexts/
│   └── ColorSchemeContext.tsx  # Global state for reactive updates
└── storage/
    └── settings.ts        # Persists user's color scheme selection
```

---

## Color Scheme Interface

In `src/themes/colors.ts`, the `ColorSchemeColors` interface defines all required colors:

```typescript
export interface PillColors {
  background: string;
  icon: string;
  text: string;
}

export interface PillsColors {
  tags: PillColors;
  date: PillColors;
  time: PillColors;
  location: PillColors;
  weather: PillColors;
  photo: PillColors;
}

export interface ColorSchemeColors {
  // Backgrounds
  background: string;      // Main screen background
  surface: string;         // Card/panel background
  surfaceElevated: string; // Elevated surfaces (input fields, etc.)
  
  // Text
  text: string;            // Primary text
  textSecondary: string;   // Secondary/muted text
  textTertiary: string;    // Tertiary/hint text
  
  // Accent (brand color)
  accent: string;          // Primary accent color
  accentLight: string;    // Lighter variant for backgrounds
  
  // Borders
  border: string;         // Primary border color
  borderSubtle: string;   // Subtle border color
  
  // Semantic
  success: string;         // Success/positive (green)
  warning: string;         // Warning/attention (amber/yellow)
  error: string;           // Error/danger (red)
  
  // Pills (input field pills)
  pills: PillsColors;
}
```

Each color scheme entry looks like:

```typescript
dracula: {
  name: 'Dracula',
  light: {
    background: '#f8f8f2',
    surface: '#ffffff',
    // ... all fields
    pills: {
      tags: { background: '#f3e8ff', icon: '#bd93f9', text: '#bd93f9' },
      // ... all pill types
    },
  },
  dark: {
    background: '#282a36',
    // ... all fields
    pills: {
      // ... all pill types for dark mode
    },
  },
},
```

---

## Step-by-Step Guide

### Step 1: Add New Entry to colorSchemes Object

Open `src/themes/colors.ts` and add a new entry to the `colorSchemes` object:

```typescript
export const colorSchemes: Record<string, ColorScheme> = {
  default: { /* existing */ },
  dracula: { /* existing */ },
  
  // ADD YOUR NEW SCHEME HERE
  myNewTheme: {
    name: 'My New Theme',
    light: {
      // ... all required fields
    },
    dark: {
      // ... all required fields
    },
  },
};
```

### Step 2: Define Light Mode Colors

Fill in all fields for the light variant. Use the color recommendations below as a guide.

### Step Step 3: Define Dark Mode Colors

Fill in all fields for the dark variant. The colors should be:
- Readable and accessible in dark mode
- Consistent with the theme's visual identity
- Distinct from the light mode colors but related

### Step 4: Define Pill Colors

Each pill type (tags, date, time, location, weather, photo) needs:
- **background**: Light tint of the color (for visibility)
- **icon**: The main color for icons
- **text**: The text color (usually same as icon)

### Step 5: Test the Theme

Test your theme by:
1. Selecting it in Settings → Color Scheme
2. Checking both dark and light modes
3. Verifying all components use the new colors
4. Ensuring text is readable in both modes

---

## Color Recommendations

### For Light Mode

| Element | Recommended | Hex |
|---------|--------------|-----|
| Background | White/Cream | `#ffffff` or `#f8f8f2` |
| Surface | Light Gray | `#fafafa` or `#f5f5f5` |
| Text Primary | Dark Gray | `#27272a` or `#1a1a2e` |
| Text Secondary | Medium Gray | `#71717a` or `#6272a4` |
| Accent | Theme's brand color | `#6366f1` (indigo) or `#bd93f9` (purple) |
| Success | Green | `#16a34a` or `#50fa7b` |
| Warning | Amber | `#d97706` or `#f1fa8c` |
| Error | Red | `#ef4444` or `#ff5555` |

### For Dark Mode

| Element | Recommended | Hex |
|---------|--------------|-----|
| Background | Dark | `#09090b` or `#282a36` |
| Surface | Dark Gray | `#171717` or `#44475a` |
| Text Primary | Light | `#e4e4e7` or `#f8f8f2` |
| Text Secondary | Muted | `#71717a` or `#bd93f9` |
| Accent | Lighter brand | `#818cf8` or `#bd93f9` |
| Success | Green | `#22c55e` or `#50fa7b` |
| Warning | Amber | `#fbbf24` or `#f1fa8c` |
| Error | Red | `#ef4444` or `#ff5555` |

### Pill Color Guidelines

Each pill should have:
- **Distinct colors** for each pill type (not just the accent color)
- Good contrast in both modes
- Lighter backgrounds with darker text/icons for readability

#### Dracula Dark Mode Example (Distinctive Pills)

| Pill | Background | Icon/Text | Notes |
|------|------------|-----------|-------|
| Tags | `#3d3556` | `#bd93f9` | Purple |
| Date | `#4a2d4a` | `#ff79c6` | Pink |
| Time | `#2d3d4a` | `#8be9fd` | Cyan |
| Location | `#3d3520` | `#f1fa8c` | Yellow |
| Weather | `#4a3020` | `#ffb86c` | Orange |
| Photo | `#203d2d` | `#50fa7b` | Green |

#### Dracula Light Mode Example (Distinctive Pills)

| Pill | Background | Icon/Text | Notes |
|------|------------|-----------|-------|
| Tags | `#f3e8ff` | `#9055d4` | Purple |
| Date | `#ffe4f0` | `#d43385` | Pink |
| Time | `#e0faff` | `#0891b2` | Teal |
| Location | `#fefce8` | `#b8960f` | Gold |
| Weather | `#fff4e6` | `#e66a00` | Orange |
| Photo | `#e0ffe4` | `#0f8f4d` | Green |

#### Default Dark Mode Example

| Pill | Background | Icon/Text | Notes |
|------|------------|-----------|-------|
| Tags | `#14532d` | `#22c55e` | Green |
| Date | `#4c1d95` | `#a78bfa` | Purple |
| Time | `#4c1d95` | `#a78bfa` | Purple |
| Location | `#451a03` | `#fbbf24` | Amber |
| Weather | `#831843` | `#e879f9` | Pink |
| Photo | `#164e63` | `#22d3ee` | Cyan |

---

## Testing

### Manual Testing Checklist

After adding a new theme, verify:

- [ ] Light mode background is correct
- [ ] Dark mode background is correct
- [ ] Text is readable in both modes
- [ ] Accent colors show correctly on buttons, icons, selections
- [ ] Calendar uses accent for selected dates and dots
- [ ] Tab bar shows accent on active tab
- [ ] Pills show correct colors
- [ ] Modal backgrounds match theme
- [ ] Color scheme selector shows correct colors

### How to Test

1. Run the app: `npx expo start`
2. Go to Settings
3. Select your new theme from Color Scheme
4. Check Timeline, Editor, Search, Settings screens
5. Toggle dark/light mode to verify both variants

---

## Common Pitfalls

### 1. Missing Colors
Always include ALL fields in the interface. Missing fields will cause errors.

### 2. Poor Contrast
Ensure text has sufficient contrast with backgrounds. Use darker text on light backgrounds and lighter text on dark backgrounds.

### 3. Inconsistent Colors
Keep the theme cohesive - light and dark variants should feel related even if colors differ.

### 4. Not Updating Components
After adding a theme, ensure components use `useThemeColors()` hook. Hardcoded colors won't respond to theme changes.

### 5. Forgetting Pill Colors
Each pill type needs distinct colors. Don't reuse the same color for all pills.

---

## Adding More Themes

To add more themes in the future:

1. Follow the step-by-step guide above
2. Use existing themes (Default, Dracula) as templates
3. Test thoroughly in both modes
4. Update this document with any new patterns discovered

---

## Summary

Creating a new color scheme in DayLog requires:

1. Adding entry to `src/themes/colors.ts`
2. Defining all color fields for both light and dark variants
3. Setting distinct, readable pill colors
4. Testing in both modes
5. Ensuring components use the theme via `useThemeColors()`

For questions or issues, review the existing themes (Default, Dracula) in `src/themes/colors.ts` as reference implementations.

---

## Implementation Phases

The color scheme implementation is divided into phases to systematically update all components:

### Phase 1: Theme Infrastructure ✓ DONE
- ColorSchemeContext
- useThemeColors hook
- Storage functions
- Settings UI

### Phase 2: Main Components ✓ DONE
- CalendarStrip.tsx
- TabBar.tsx
- TagStrip.tsx
- SearchScreen.tsx
- SettingsScreen.tsx

### Phase 3: Entry Card & Read Entry Screen ✓ DONE
- EntryCard.tsx
- ReadEntryScreen.tsx

### Phase 4: Editor Pickers ✓ DONE
- ClockPicker.tsx
- WebPicker.tsx

### Phase 5: Tag Selector Modal
- TagSelectorModal.tsx

### Phase 6: Entries Screen
- EntriesScreen.tsx

### Phase 7: Other Components
- ConfirmationModal.tsx
- MarkdownRenderer.tsx
- RootNavigator.tsx
- MapScreen.tsx
# Changelog

## [0.2.0] - 2026-10-22

### Changed
- Rebuilt the app natively for Android with Kotlin and Jetpack Compose — the app now opens faster and scrolls more smoothly
- New look: a ledger-inspired timeline with dates set in the margin, a serif for your writing and a quieter interface
- Entry text is now set in Spectral, a typeface designed for long-form reading
- Photos, weather, tags and search all keep working, now stored locally in the app's own database

### Added
- Paper (light) and Night (dark) themes, or follow your system setting
- Optional accent colour taken from your wallpaper
- Backup and restore as a JSON file
- Import your entries from the previous version of DayLog

### Fixed
- Entries no longer group into the wrong day when the device changes time zone
- The keyboard no longer pushes the quick entry bar off screen
- Scrolling the timeline no longer stutters on long entries

## [0.1.2] - 2026-03-30

### Fixed
- UTC date bug causing entries to group incorrectly
- TabBar icon backgrounds not rounding properly on Android
- Navigation bar moving with keyboard

### Changed
- Improved keyboard handling with smooth animations
- Enhanced responsive design with better spacing on all screens
- Cleaner QuickEntryBar appearance

### Added
- Dynamic app version display in settings
- Performance improvements for smoother scrolling

## [0.1.0] - 2026-03-25

### Added
- **Dracula Theme**: New color scheme with dark and light variants
- **Quick Theme Toggle**: Switch themes instantly from the timeline header
- **Search**: Find entries by text, tags, locations, and weather
- **Tag Filtering**: Organize entries by selecting multiple tags
- **Nord Theme**: Cool arctic color palette option

### Changed
- Entry cards now blend smoothly with the background
- Quick entry bar has improved visibility
- Smoother animations when toggling tags

## [0.0.1] - 2026-03-22

### Added
- **Timeline View**: Scrollable diary with calendar navigation
- **Quick Entry**: Fast note capture from bottom bar
- **Full Editor**: Long-form writing with markdown support
- **Search & Tags**: Find and organize entries
- **Photos**: Attach images to entries
- **Dark Mode**: System and manual theme options

### Features
- Works offline
- Auto-saves entries
- SQLite local storage

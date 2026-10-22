# Changelog

## [0.3.1] - 2026-10-22

### Added
- Tap any entry to open it: the date in the margin, the entry as you wrote it, its tags and place,
  and a way to edit or delete it
- Search: find entries by any word in them or in their tags, as you type
- The formatting toolbar now works on the words you have selected, and pressing a button twice
  takes the mark off again
- A delete that asks first and says what it will do

### Fixed
- The accent colour is no longer spent on buttons and switches. It is used only where there is
  data, so the screen stays quiet
- The search finds the start of a word as you type, not only whole words
- Your existing entries are kept when the app is updated, and the search index is built from them,
  so the whole diary can be searched straight away

## [0.2.0] - 2026-10-22

### Changed
- Rebuilt the app natively for Android with Kotlin and Jetpack Compose — the app now opens faster and scrolls more smoothly
- New look, built on Material 3: tonal surfaces, the platform's own buttons and chips, and an optional true-black dark mode
- New type: a single modern sans for the whole app, sized for long reading
- The timeline is a ledger's margin: the dates sit against a rule down the left of the page
- Your entries can be written in markdown — bold, italic, headings and lists — and are shown as written

### Added
- Paper (light) and Night (dark) themes, or follow your system setting
- An optional theme that takes its colours from your wallpaper
- A settings screen for the theme choices

### Fixed
- The quick entry no longer takes the writing away from you: a pause no longer splits a thought in two, and the text stays where you left it
- The quick entry now sits above the keyboard instead of behind it
- Entries no longer group into the wrong day when the device changes time zone
- Scrolling the timeline no longer stutters on long entries

### Not in this release
Photos, search, a calendar, a place and weather, and importing your entries from the previous
version of DayLog are not in 0.2.0. They are the next release.

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

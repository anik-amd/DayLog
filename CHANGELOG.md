# Changelog

## [0.4.1] - 2026-10-23

### Added
- A place can be given in three ways: type a name and the app finds where in the world it is, tap
  one of the names you have already used, or ask "My location" — the first time, the app asks for
  the location permission and keeps the street you last stood on. A place is stored with its
  coordinates, and a place once named is a tap away the next time
- The timeline's filter popup now offers places beside tags — see only what was written on the
  waterfront, in the office, wherever you wrote at
- Word counts ride on the facts line in the reader and in the editor

### Changed
- The timeline reads as a notebook: each day is a heading across the page with its entries sitting
  right under it, and the days come with a quiet line between them. Search looks the same
- The pin in the quick entry bar says where with its colour alone — no word beside it

## [0.4.0] - 2026-10-23

### Added
- Bottom tabs: the timeline and the calendar are the app's two homes, one tap apart
- "On this day": the same date in past years, with a count on the timeline's top bar so you know
  when there is something to look back at
- Tags and places can be given to a thought in the quick entry bar and in the full editor — pick
  a tag from the ones you have used, type a new one, take a tag back off, name a place or change
  it
- Tags glow in an entry when you read it, so the filing shows through the writing
- A filter popup for choosing which tags the timeline shows, instead of a strip that ran out of
  room

### Changed
- The app is friendlier under the fingers: the quick entry bar is now a floating bubble with a
  border that folds into a small plus when you scroll down and comes back when you scroll up, and
  the shapes all went rounder
- An entry opens with its date and time above the text, small and out of the way, and edit and
  delete as small icons at the top
- The timeline, the calendar's day lists and "On this day" read plain text — no markdown marks,
  nothing lit up; an entry marks its tags only when you are reading it
- The location icon is drawn as a proper map pin

## [0.3.8] - 2026-10-22

### Added
- Statistics: how much you have written, how many days you wrote on, your streak, and the last
  thirty days as a small chart. Settings, then Statistics
- Export: everything in one file you can keep or send to yourself. The writing is plain JSON and
  the photos go with it, so a backup does not quietly leave the pictures behind
- Import: bring a file back in. It merges rather than replaces, so nothing you have written since
  is lost, and where both have the same entry the newer one wins

## [0.3.7] - 2026-10-22

### Added
- Bring the entries you wrote in the previous version of DayLog across: Settings, then "Import
  from the previous version". Your tags, your place and your photos come across too, and nothing
  is overwritten

## [0.3.6] - 2026-10-22

### Added
- Photos: attach them to an entry with the system photo picker, so there is no permission prompt
  and nothing is asked for that the app does not need
- The photos are copied into the app, so the entry keeps them even if you delete the original from
  your gallery
- A small photo on the timeline for the entries that have one

## [0.3.5] - 2026-10-22

### Added
- A calendar: a month on one screen, a dot on every day you wrote, and tap a day to read what
  you wrote
- The calendar is one tap away from the top bar

### Fixed
- The search results carry the same rule down the margin as the timeline, so a result looks
  like the entry it is

## [0.3.4] - 2026-10-22

### Added
- A live preview in the editor, toggled from the top bar
- The formatting toolbar works on the words you have selected, and pressing a button twice takes
  the mark off again

### Fixed
- The label of a button could not be read on the ink button
- The accent is for data, not for chrome: buttons and switches are the ink, and only a selected
  chip carries the accent

## [0.3.3] - 2026-10-22

### Added
- Tap any entry to open it: the date in the margin, the entry as you wrote it, its tags and place,
  and a way to edit or delete it
- Editing an existing entry loads it rather than starting a new one
- The formatting toolbar now works on the words you have selected, and pressing a button twice
  takes the mark off again
- A delete that asks first and says what it will do

### Fixed
- The accent is for data, not for chrome: buttons and switches are the ink, and only a selected
  chip carries the accent
- The label of a button could not be read on the ink button

## [0.3.2] - 2026-10-22

### Added
- Search: find any entry by a word in it, or by one of its tags, from the magnifying glass at the
  top of the timeline
- A strip of the tags you have used, under the top bar. Choose one to filter by it, or two to see
  only the entries that carry both
- The search results are in the same margin as your timeline, so a result looks like the entry it
  is

## [0.3.1] - 2026-10-22

### Added
- Tap any entry to open it: the date in the margin, the entry as you wrote it, its tags and place,
  and a way to edit or delete it
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

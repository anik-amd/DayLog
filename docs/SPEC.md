# DayLog — Specification

DayLog is a minimal, offline-first diary for Android. It exists so a thought can be captured in
seconds, without setup, without a network, and without thinking about where it goes.

---

## The problem

Most diary apps make you choose a format before you can write. You pick a category, you pick a
date, you name the entry, you press save. By then the thought has cooled off.

DayLog inverts that. The app opens straight into the timeline with the input already focused. You
type, and it saves itself. Everything else — dates, tags, places, weather — is added automatically
or not at all.

---

## Principles

**Speed over completeness.** The quick entry bar is the product. If capturing a thought takes more
than three seconds, the design has failed regardless of how good the rest looks.

**Local first.** Every entry, photo and setting lives on the device. The app is fully usable with
no network. The only time the internet is touched is to look up a place name or the weather.

**Calm, not empty.** Minimal does not mean stripped. A diary is read often and for a long time, so
the reading experience gets generous line height and a quiet chrome. What is removed is
noise, not care.

**One way to do things.** No modes, no filters that need explaining, no settings that change how
the app looks unless the user asks for it.

---

## The core loop

1. Open the app.
2. Type in the bar at the bottom.
3. Press save.

That is the whole loop. Everything else exists to support it or to let the user look back.

---

## Features

### Timeline

Entries grouped by day, newest first. Each day has a date in the left margin beside a vertical
hairline — the app's signature. No cards, no shadows, no coloured headers.

### Quick entry

A single line at the bottom of the timeline that expands upward as you type, up to about ten
lines, and then scrolls. Nothing is saved by itself. The actions sit under the field: a photo, an
unfold arrow to the full editor, and the save button — the only thing that writes the thought
down, and the only thing that empties the field. The text carries into the full editor when the
arrow is tapped, and an entry a photo has already begun is continued there rather than split.

### Full editor

A full-screen editor for longer writing, with a formatting toolbar (bold, italic, underline, H1,
H2), a live preview toggle, the entry's moment (tappable, so a wrong time can be put right), a
live word count and photos. Every way out saves — the back arrow, the system's back gesture and
the save button all write the entry first. The menu holds the discard, behind a question. Content
is stored as Markdown and stays editable as Markdown.

### Tags

Any `#hashtag` in an entry is picked up automatically. Tags can be filtered from a strip above the
timeline, with AND logic — selecting two tags shows entries carrying both.

### Place and weather

A place can be attached to an entry by name. The name is resolved to coordinates and the weather
at that place is fetched and stored on the entry, so it stays true even later. Both are optional
and both are one tap away. Coordinates are stored, so a map view can be added later without
changing the data.

### Calendar

A month grid with a dot on every day that has entries. Tapping a day filters the timeline to it.

### Search

Full-text search over entry content and tags, backed by SQLite FTS.

### Photos

Photos are attached through the Android photo picker — no permission prompt — copied into the
app's own storage, and shown as a thumbnail strip on the entry.

### Settings

Theme (System / Paper / Night), accent (fixed teal or the wallpaper's colour), text size, JSON
export and import, and entry statistics.

---

## Out of scope for v2

Maps, cloud sync, a home-screen widget, accounts, notifications, iOS and web. The data shape
already supports sync later without a migration, so these are additions rather than rewrites.

---

## Data

An entry is: a stable UUID, its text, when it was created and updated, a tombstone when deleted,
an optional place with coordinates, and an optional weather snapshot. Tags and photos hang off it.

Entries are never hard-deleted while the app is running. A delete writes a tombstone, so a future
sync can replicate the deletion instead of resurrecting the entry.

---

## Versioning

The native rewrite continues the version line as `0.2.0`. It replaces the React Native app rather
than restarting the numbering, so an update installs over the existing app.

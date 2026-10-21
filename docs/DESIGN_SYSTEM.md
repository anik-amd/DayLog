# DayLog — Design System

**Ink & Margin.**

A diary read like a well-made ledger. One vertical rule runs down the timeline; dates live in that
margin; entry text is set in a serif so a long entry stays pleasant to read. Chrome is a quiet
grotesque. Colour appears only where there is data.

---

## Palette

Near-monochrome with a single hue.

| Token | Paper | Night | Used for |
|---|---|---|---|
| `background` | `#F2F3F2` | `#0B0C0D` | Screen ground |
| `surface` | `#FFFFFF` | `#141618` | Sheets, fields |
| `surfaceRaised` | `#FAFAF9` | `#1D2023` | One step above the ground |
| `ink` | `#14161A` | `#ECEDEC` | Primary text |
| `inkMuted` | `#565C63` | `#9AA0A6` | Secondary text |
| `inkFaint` | `#8A9099` | `#6C7278` | Decorative metadata only |
| `rule` | `#E1E3E2` | `#262A2D` | Hairlines |
| `accent` | `#0E6B62` | `#63C6BA` | Data marks |
| `accentSoft` | `#E0EEEB` | `#113330` | Selected chip fill |
| `onAccent` | `#FFFFFF` | `#06201D` | Text on accent |
| `danger` | `#B3261E` | `#E06A60` | Destructive actions |

Paper is a cool off-white, not a warm cream. Night is near-black rather than pure black, so a
raised surface can be one tone step above the ground without the harshness of true-black smear.

### Accent discipline

The accent marks **data**, never chrome. It appears on:

- today's date in the margin
- the selected chip
- the pending-change dot

It never appears on a primary button, never on navigation, never on a card. If the accent is
everywhere, it is nowhere.

---

## Type

Two families, both bundled so the app renders identically offline.

**Spectral** — a serif, for content. Entry prose is read at length, so the text that carries the
writing is set in a face designed for reading.

**Instrument Sans** — a grotesque with a real weight axis, for chrome. Labels, dates, buttons,
chips. A genuine weight axis means no synthetic bold.

| Role | Family | Size / line | Weight | Used for |
|---|---|---|---|---|
| `entryTitle` | Spectral | 20 / 27 | SemiBold | An entry's title, and a first-level heading |
| `entrySubheading` | Spectral | 15 / 21 | SemiBold | A second-level heading inside an entry |
| `entryBody` | Spectral | 17 / 26 | Normal | Entry prose |
| `chromeTitle` | Instrument Sans | 20 / 26 | SemiBold | Screen headings |
| `label` | Instrument Sans | 13 / 18 | Medium | Buttons, chips, field labels |
| `meta` | Instrument Sans | 11.5 / 16 | Normal | Dates, counts, captions |

Roles are named by purpose, not by size, so a screen cannot quietly use `entryBody` for a button
label. Sentence case everywhere — no tracked capitals.

Spectral is cut at three weights — Regular, Medium and SemiBold — so **bold** in markdown is the
SemiBold face. Asking for a weight the family does not have would fall back to the same face
anyway, but silently.

---

## Space and shape

A 4dp base: 4, 8, 12, 16, 20, 24, 32, 40. Plus 1 for hairlines and 2 for tight optical nudges.

Radius: 6 for chips, 10 for cards, 16 for sheets. Full rounding only for date pills.

Surfaces are flat. Separation is a 1dp rule or one tone step. **No drop shadows on cards.** The
only things that may float — the composer, a dialog — carry their own light shadow.

---

## Signature elements

### The margin rule

A 72dp gutter runs down the left of the timeline with a 1dp vertical rule at its edge. The date
sits in that gutter in `meta` style.

This is not ornament. It encodes the structure of the timeline the way a ledger's margin does: you
can see where one day ends and the next begins without reading a single entry.

### The writing line

The quick entry composer is a bottom bar with a single hairline that expands upward as you type.
It reads as a line you write on, not as a chat input in a card.

### Flatness

Surfaces do not float. Cards are the ground colour with a hairline between them, or one tone step
above it. Elevation is used once, sparingly, for something that genuinely floats.

---

## Icons

Hand-drawn vectors at 1.5dp stroke. Back, search, settings, calendar, tag, pin, weather, image,
plus, trash, chevron, check.

No Material icon dependency. The generic Material glyph set would undo the point of a hand-built
visual language.

---

## Theme modes

**System / Paper / Night** — the user's choice, stored in DataStore.

**Adaptive accent** — on Android 12+, the wallpaper's accent re-tints *only* the accent ramp.
Paper, ink and rules never change, so turning on adaptive colour does not turn the app into a
generic Material palette. Saturation is pulled down so a loud wallpaper still reads as an ink
accent.

---

## Rules

- Accent marks data, never chrome.
- One typeface per job: serif for content, grotesque for chrome.
- Flat surfaces; a rule or a tone step, never a shadow.
- Sentence case. No tracked capitals.
- Every colour pair that carries text meets WCAG AA (4.5:1). The design system asserts this in
  `DayLogPalettesTest`, so a palette change that breaks readability fails the build.
- One signature element per screen. The margin rule is enough.

---

## Reference

`core/designsystem/`

```
color/DayLogColors.kt     the token set
color/DayLogPalettes.kt    Paper and Night values
color/Contrast.kt          WCAG contrast maths
theme/DayLogTheme.kt       theme, modes, adaptive accent
theme/DayLogTypography.kt  the type scale
theme/DayLogSpacing.kt     the spacing scale
theme/DayLogShapes.kt      radii
theme/DayLogFonts.kt       the two families
```

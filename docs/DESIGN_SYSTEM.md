# DayLog — Design System

**Material 3, with a voice.**

A native Android app: tonal surfaces, the platform's own widgets, and the option of taking its
colours from the wallpaper. On top of that, one idea that belongs to this app and to no other:
a diary read like a well-made ledger, where the dates sit in the margin beside a rule.

---

## Colour

Every colour is a **tone** of one hue, not a colour picked by eye. The seed is a deep teal. The
ramps are Material 3's, so the surfaces get their depth from the tone rather than from a shadow
anywhere.

| | Paper | Night |
|---|---|---|
| Ground | `#F4FBF8` | `#0E1513` |
| Surface | `#F4FBF8` | `#0E1513` |
| Container | `#E9EFED` | `#1A2120` |
| Container, one step up | `#E3E9E7` | `#252B2A` |
| Ink | `#161D1C` | `#DDE4E1` |
| Muted ink | `#3F4947` | `#BEC9C6` |
| Rule | `#BEC9C6` | `#3F4947` |
| Accent | `#006A60` | `#82D5C7` |
| Accent container | `#9FF2E3` | `#005048` |
| Danger | `#BA1A1A` | `#FFB4AB` |

**Pure black.** A reading app is often used in a dark room, so the dark scheme can go on true
black. The containers keep their tones, so the depth is still there; only the ground goes black.

**The wallpaper.** On Android 12 and later the colours can come from the wallpaper instead, which
is what most of Android looks like now. The app's own palette is the default: a diary is a
reading app, and the reading is the point.

### Accent discipline

The accent marks **data**, never chrome. It appears on:

- the selected chip
- the pending-change dot
- the cursor

It never appears on a primary button, never on navigation, never on a card. If the accent is
everywhere, it is nowhere.

---

## Type

**One family: Inter.** A grotesque with a real weight axis, bundled as a variable font so the
whole range comes from one file.

The serif is gone. A diary is read in long stretches, and one well-set sans is quieter than two
faces fighting each other. The reading is carried by size and line height instead.

| Role | Size / line | Weight | Used for |
|---|---|---|---|
| `entryTitle` | 20 / 27 | SemiBold | An entry's title, and a first-level heading |
| `entrySubheading` | 16 / 23 | SemiBold | A second-level heading inside an entry |
| `entryBody` | 16 / 26 | Regular | Entry prose |
| `chromeTitle` | 20 / 26 | SemiBold | Screen headings |
| `label` | 13 / 18 | Medium | Buttons, chips, field labels |
| `meta` | 12 / 16 | Regular | Dates, counts, captions |

Roles are named by purpose, not by size, so a screen cannot quietly use `entryBody` for a button
label. Sentence case everywhere — no tracked capitals.

---

## Space and shape

A 4dp base: 4, 8, 12, 16, 20, 24, 32, 40. Plus 1 for hairlines.

Radius: 6 for chips and buttons, 10 for cards, 16 for sheets. Full rounding only for the date
pills.

**No shadows.** The depth comes from the tonal ramp. The Material widgets carry their own press
animation, which is the only motion that is not explaining a change.

---

## Signature elements

### The margin rule

A gutter runs down the left of the timeline with a 1dp rule at its edge. The date sits in that
gutter, right-aligned against the rule, the way a date is written in the margin of a ledger.

The gutter **grows with the text**. A reader who has turned the font up has already said they
want fewer words on a line, so the margin takes its share rather than the day name being cut
off.

The rule is drawn a piece at a time, by each row, so it begins with the first day and ends with
the last entry. A rule that ran on past the writing into the empty space below would be a line to
nothing.

### The writing line

The composer is a bar on a tonal container with a hairline above it. There is no box around the
field and no save button.

The placeholder *is* the field: it sits exactly where the text will be, so the field never
changes shape and the placeholder is never a label above the input.

The bar rides above the keyboard rather than hiding behind it.

---

## Components

The Material widgets, not lookalikes. The Material button *is* the Android button: it carries the
press animation, the shape and the tonal behaviour the platform expects. The app's own shape
scale decides how round they are.

`DLText` · `DLLabel` · `DLButton` · `DLChip` · `DLIcon` · `DLIconButton` · `DLTextField` ·
`DLTopBar` · `DLRule` · `DLDivider` · `DLEmptyState` · `DLPendingDot`

### Icons

Hand-drawn vectors at 1.5dp stroke. Back, search, settings, calendar, tag, pin, weather, image,
plus, trash, chevron, check, bold, italic, underline.

No Material icon set: those glyphs are instantly recognisable as Material, which is exactly the
impression a hand-built visual language is trying to avoid.

Circles are drawn with four Béziers rather than arcs, because an arc has to be got right by eye
and a Bézier circle is exact.

---

## Rules

- Accent marks data, never chrome.
- One family. Roles named by purpose.
- Depth comes from tone, never from a shadow.
- Sentence case. No tracked capitals.
- Every colour pair that carries text meets WCAG AA (4.5:1). The design system asserts this in
  `DayLogPalettesTest`, so a palette change that breaks readability fails the build.
- One signature element per screen. The margin rule is enough.

---

## Reference

`core/designsystem/`

```
color/DayLogColors.kt      the app's tokens, read from a Material scheme
color/DayLogPalettes.kt     the tonal schemes: Paper, Night, and pure black
color/Contrast.kt           WCAG contrast maths
theme/DayLogTheme.kt       the theme, the modes, the wallpaper option
theme/DayLogTypography.kt   the type scale, and the Material mapping
theme/DayLogSpacing.kt     the spacing scale
theme/DayLogShapes.kt      the radii
theme/DayLogFonts.kt        Inter
component/                  the widgets
icon/DayLogIcons.kt         the hand-drawn icons
markdown/MarkdownParser.kt  the app's markdown
```

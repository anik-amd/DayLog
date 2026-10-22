package app.daylog.core.model

/**
 * Which colour scheme the app renders in.
 *
 * This lives in the model rather than in the design system because the data layer persists it.
 * A setting that a repository stores is a domain value, not a rendering detail — and it keeps
 * `core:data` from depending on `core:designsystem`, which knows about colour.
 */
enum class DayLogThemeMode {
    /** Follow the system setting. */
    System,

    /** Always the light "Paper" scheme. */
    Light,

    /** Always the dark "Night" scheme. */
    Dark,
}

/**
 * Where the colours come from.
 *
 * The app has its own tonal palette, seeded with a deep teal. On Android 12 and later the
 * wallpaper's colours can be used instead, which is what most of Android looks like now.
 *
 * The app's own palette is the default: a diary is a reading app, and the reading is the point.
 */
enum class DayLogAccentSource {
    /** The app's own tonal palette. */
    Teal,

    /** The wallpaper's colours, on Android 12 and later. */
    Wallpaper,
}

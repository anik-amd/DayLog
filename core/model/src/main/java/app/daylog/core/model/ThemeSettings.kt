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
 * Where the accent colour comes from.
 *
 * The accent marks data — today's date, the selected chip, a pending change — and never chrome.
 * Adaptive takes it from the wallpaper on Android 12+ and only shifts the accent ramp; the paper,
 * the ink and the rules stay put.
 */
enum class DayLogAccentSource {
    /** The fixed Ink & Margin teal. */
    Teal,

    /** The wallpaper's colour, on Android 12+. */
    Adaptive,
}

package app.daylog.core.designsystem.color

import androidx.compose.ui.graphics.Color

/**
 * Paper — the light scheme.
 *
 * A cool off-white ground, not a warm cream. The teal is deep enough to read as ink on paper
 * rather than as a brand fill.
 */
val PaperColors = DayLogColors(
    background = Color(0xFFF2F3F2),
    surface = Color(0xFFFFFFFF),
    surfaceRaised = Color(0xFFFAFAF9),
    ink = Color(0xFF14161A),
    inkMuted = Color(0xFF565C63),
    inkFaint = Color(0xFF8A9099),
    rule = Color(0xFFE1E3E2),
    accent = Color(0xFF0E6B62),
    accentSoft = Color(0xFFE0EEEB),
    onAccent = Color(0xFFFFFFFF),
    danger = Color(0xFFB3261E),
    onDanger = Color(0xFFFFFFFF),
)

/**
 * Night — the dark scheme.
 *
 * Near-black rather than pure black, so raised surfaces can be a single tone step above the ground
 * without the harshness of true-black OLED smearing.
 */
val NightColors = DayLogColors(
    background = Color(0xFF0B0C0D),
    surface = Color(0xFF141618),
    surfaceRaised = Color(0xFF1D2023),
    ink = Color(0xFFECEDEC),
    inkMuted = Color(0xFF9AA0A6),
    inkFaint = Color(0xFF6C7278),
    rule = Color(0xFF2F343A),
    accent = Color(0xFF63C6BA),
    accentSoft = Color(0xFF113330),
    onAccent = Color(0xFF06201D),
    danger = Color(0xFFE06A60),
    onDanger = Color(0xFF2A0B08),
)

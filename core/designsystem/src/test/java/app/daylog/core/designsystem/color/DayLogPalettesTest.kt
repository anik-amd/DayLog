package app.daylog.core.designsystem.color

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The palette is the app's contract with the reader. These tests fail the build if a colour is
 * changed to something unreadable.
 */
class DayLogPalettesTest {

    private fun assertReadable(name: String, foreground: androidx.compose.ui.graphics.Color, background: androidx.compose.ui.graphics.Color, minimum: Double) {
        val ratio = contrastRatio(foreground, background)
        assertTrue(
            "$name contrast is $ratio, expected at least $minimum",
            ratio >= minimum,
        )
    }

    @Test
    fun `paper ink on background is readable`() {
        assertReadable("paper ink", PaperColors.ink, PaperColors.background, 4.5)
    }

    @Test
    fun `paper muted ink on background is readable`() {
        assertReadable("paper muted", PaperColors.inkMuted, PaperColors.background, 4.5)
    }

    @Test
    fun `paper accent on background is readable`() {
        assertReadable("paper accent", PaperColors.accent, PaperColors.background, 4.5)
    }

    @Test
    fun `paper ink on surface is readable`() {
        assertReadable("paper ink on surface", PaperColors.ink, PaperColors.surface, 4.5)
    }

    @Test
    fun `night ink on background is readable`() {
        assertReadable("night ink", NightColors.ink, NightColors.background, 4.5)
    }

    @Test
    fun `night muted ink on background is readable`() {
        assertReadable("night muted", NightColors.inkMuted, NightColors.background, 4.5)
    }

    @Test
    fun `night accent on background is readable`() {
        assertReadable("night accent", NightColors.accent, NightColors.background, 4.5)
    }

    @Test
    fun `night ink on surface is readable`() {
        assertReadable("night ink on surface", NightColors.ink, NightColors.surface, 4.5)
    }

    @Test
    fun `on accent colour is readable on the accent`() {
        assertReadable("paper on accent", PaperColors.onAccent, PaperColors.accent, 4.5)
        assertReadable("night on accent", NightColors.onAccent, NightColors.accent, 4.5)
    }

    @Test
    fun `danger colour is readable on the background`() {
        assertReadable("paper danger", PaperColors.danger, PaperColors.background, 4.5)
        assertReadable("night danger", NightColors.danger, NightColors.background, 4.5)
    }

    @Test
    fun `ink on accent soft is readable`() {
        assertReadable("paper ink on accent soft", PaperColors.ink, PaperColors.accentSoft, 4.5)
        assertReadable("night ink on accent soft", NightColors.ink, NightColors.accentSoft, 4.5)
    }

    @Test
    fun `faint ink is decorative only and stays below body text contrast`() {
        // inkFaint is for decorative metadata only, so it is intentionally below the 4.5 threshold.
        val ratio = contrastRatio(PaperColors.inkFaint, PaperColors.background)
        assertTrue("paper faint ratio was $ratio", ratio < 4.5)
    }

    @Test
    fun `rule is visible against the background`() {
        val ratio = contrastRatio(PaperColors.rule, PaperColors.background)
        assertTrue("paper rule ratio was $ratio", ratio > 1.05)
    }

    @Test
    fun `contrast ratio of a colour against itself is one`() {
        assertEquals(1.0, contrastRatio(PaperColors.ink, PaperColors.ink), 0.001)
    }
}

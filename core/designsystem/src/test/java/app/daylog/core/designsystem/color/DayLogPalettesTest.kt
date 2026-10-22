package app.daylog.core.designsystem.color

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The palette is the app's contract with the reader. These tests fail the build if a colour is
 * changed to something unreadable.
 */
class DayLogPalettesTest {

    private val paper = DayLogColors.from(PaperScheme)
    private val night = DayLogColors.from(NightScheme)

    private fun assertReadable(name: String, foreground: androidx.compose.ui.graphics.Color, background: androidx.compose.ui.graphics.Color, minimum: Double) {
        val ratio = contrastRatio(foreground, background)
        assertTrue(
            "$name contrast is $ratio, expected at least $minimum",
            ratio >= minimum,
        )
    }

    @Test
    fun `paper ink on background is readable`() {
        assertReadable("paper ink", paper.ink, paper.background, 4.5)
    }

    @Test
    fun `paper muted ink on background is readable`() {
        assertReadable("paper muted", paper.inkMuted, paper.background, 4.5)
    }

    @Test
    fun `paper accent on background is readable`() {
        assertReadable("paper accent", paper.accent, paper.background, 4.5)
    }

    @Test
    fun `paper ink on surface is readable`() {
        assertReadable("paper ink on surface", paper.ink, paper.surface, 4.5)
    }

    @Test
    fun `night ink on background is readable`() {
        assertReadable("night ink", night.ink, night.background, 4.5)
    }

    @Test
    fun `night muted ink on background is readable`() {
        assertReadable("night muted", night.inkMuted, night.background, 4.5)
    }

    @Test
    fun `night accent on background is readable`() {
        assertReadable("night accent", night.accent, night.background, 4.5)
    }

    @Test
    fun `night ink on surface is readable`() {
        assertReadable("night ink on surface", night.ink, night.surface, 4.5)
    }

    @Test
    fun `on accent colour is readable on the accent`() {
        assertReadable("paper on accent", paper.onAccent, paper.accent, 4.5)
        assertReadable("night on accent", night.onAccent, night.accent, 4.5)
    }

    @Test
    fun `danger colour is readable on the background`() {
        assertReadable("paper danger", paper.danger, paper.background, 4.5)
        assertReadable("night danger", night.danger, night.background, 4.5)
    }

    @Test
    fun `ink on accent soft is readable`() {
        assertReadable("paper ink on accent soft", paper.ink, paper.accentSoft, 4.5)
        assertReadable("night ink on accent soft", night.ink, night.accentSoft, 4.5)
    }

    @Test
    fun `faint ink is decorative only and stays below body text contrast`() {
        // inkFaint is for decorative metadata only, so it is intentionally below the 4.5 threshold.
        val ratio = contrastRatio(paper.inkFaint, paper.background)
        assertTrue("paper faint ratio was $ratio", ratio < 4.5)
    }

    @Test
    fun `rule is visible against the background`() {
        val ratio = contrastRatio(paper.rule, paper.background)
        assertTrue("paper rule ratio was $ratio", ratio > 1.05)
    }

    @Test
    fun `contrast ratio of a colour against itself is one`() {
        assertEquals(1.0, contrastRatio(paper.ink, paper.ink), 0.001)
    }

    @Test
    fun `pure black keeps the ground black and the depth in the containers`() {
        val pureBlack = DayLogColors.from(PureBlackScheme)

        assertEquals(androidx.compose.ui.graphics.Color.Black, pureBlack.background)
        assertEquals(androidx.compose.ui.graphics.Color.Black, pureBlack.surface)
        // The containers keep their tones, so the depth is still there.
        assertTrue(pureBlack.surfaceContainerHigh != pureBlack.background)
    }
}

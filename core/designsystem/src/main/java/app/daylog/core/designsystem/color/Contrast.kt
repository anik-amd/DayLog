package app.daylog.core.designsystem.color

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

/**
 * Relative luminance, per WCAG 2.x.
 */
fun Color.relativeLuminance(): Double {
    fun channel(value: Float): Double {
        val c = value.toDouble()
        return if (c <= 0.03928) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)
    }
    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

/**
 * WCAG contrast ratio between two colours, from 1.0 to 21.0.
 */
fun contrastRatio(foreground: Color, background: Color): Double {
    val lighter = max(foreground.relativeLuminance(), background.relativeLuminance())
    val darker = min(foreground.relativeLuminance(), background.relativeLuminance())
    return (lighter + 0.05) / (darker + 0.05)
}

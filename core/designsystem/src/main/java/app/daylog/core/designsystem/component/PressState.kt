package app.daylog.core.designsystem.component

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember

/**
 * The press feedback for a control.
 *
 * The app has no Material dependency, and the ripple Material provides is deprecated in favour of
 * the newer indication APIs. So the press state is read directly and each control decides how it
 * looks while it is held down — which is the right answer for a design system anyway: the
 * feedback belongs to the control, not to a generic overlay painted on top of it.
 */
class PressState internal constructor(
    internal val interactionSource: MutableInteractionSource,
    /** True while a finger is on the control. */
    val isPressed: Boolean,
)

/**
 * Remembers the press state for a control that calls [onClick].
 *
 * Pass [PressState.interactionSource] to `Modifier.clickable` with `indication = null`, so the
 * control's own appearance is the only feedback.
 */
@Composable
fun rememberPressState(
    onClick: () -> Unit,
    enabled: Boolean = true,
): PressState {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    // The lambda is captured so a control that changes its action does not reset the state.
    remember(onClick, enabled) { onClick }
    return remember(interactionSource, isPressed) {
        PressState(interactionSource, isPressed)
    }
}

package app.daylog.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * A text field.
 *
 * A hairline on the ground rather than a filled Material field: the app's surfaces are flat and
 * separated by rules, and a field is no different from any other surface.
 *
 * The placeholder is muted and disappears on the first character. There is no floating label —
 * the caller puts a label above the field.
 */
@Composable
fun DLTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    singleLine: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    enabled: Boolean = true,
) {
    val colors = DayLogTheme.colors
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = modifier
            .background(colors.surface, DayLogShapes.chip)
            .border(1.dp, colors.rule, DayLogShapes.chip)
            .padding(horizontal = 12.dp, vertical = 11.dp),
    ) {
        if (value.isEmpty() && placeholder.isNotEmpty()) {
            DLText(
                text = placeholder,
                style = DayLogTheme.typography.entryBody,
                color = colors.inkFaint,
            )
        }

        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
            maxLines = if (singleLine) 1 else Int.MAX_VALUE,
            textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
            cursorBrush = SolidColor(colors.accent),
            interactionSource = interactionSource,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
            visualTransformation = visualTransformation,
        )
    }
}

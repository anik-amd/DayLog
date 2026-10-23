package app.daylog.feature.timeline

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.data.place.PickedPlace
import app.daylog.core.designsystem.component.DLDivider
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLPendingDot
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Tag
import app.daylog.core.model.TagExtractor
import app.daylog.feature.place.PlaceDialog
import app.daylog.feature.tag.TagPickerDialog

/**
 * The quick entry bar.
 *
 * It is a line you write on, not a chat input in a card: the only thing above it is a hairline.
 * The field grows upward as the writing grows, up to ten lines, and then it stops growing and
 * scrolls.
 *
 * Nothing is saved by itself. The actions sit under the field, where the thumb rests: a tag, a
 * place, a photo, a way up to the full editor, and the save button — the only thing that writes
 * the thought down. A tag is written where tags are written, in the text itself; the place is
 * kept on the thought until it is saved away. Saving is also what empties the field, so the bar
 * is honest about when it is done.
 */
@Composable
fun QuickEntryBar(
    value: String,
    onValueChange: (String) -> Unit,
    onSave: () -> Unit,
    onExpand: () -> Unit,
    onAddPhoto: () -> Unit,
    modifier: Modifier = Modifier,
    isSaving: Boolean = false,
    tags: List<Tag> = emptyList(),
    /** The place the thought carries, when one was picked. */
    place: PickedPlace? = null,
    /** The place names already in use, handed to the picker for tapping instead of typing. */
    usedNames: List<String> = emptyList(),
    onPlaceChange: (PickedPlace?) -> Unit = {},
) {
    val colors = DayLogTheme.colors
    var pickingTag by remember { mutableStateOf(false) }
    var pickingPlace by remember { mutableStateOf(false) }

    /**
     * Puts a tag into the writing, on the boundary its own space is, where the extractor reads it.
     */
    val insertTag: (String) -> Unit = { name ->
        onValueChange(
            if (value.isBlank()) "#$name " else "${value.trimEnd()} #$name ",
        )
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = DayLogShapes.bubble,
        color = colors.surfaceContainer,
        contentColor = colors.ink,
        tonalElevation = 2.dp,
        border = BorderStroke(1.dp, colors.rule),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .imePadding(),
        ) {
            DLDivider()

            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
            ) {
                BasicTextField(
                    value = value,
                    onValueChange = onValueChange,
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
                    cursorBrush = SolidColor(colors.accent),
                    maxLines = 10,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Default),
                    decorationBox = { innerTextField ->
                        // The placeholder sits exactly where the text will be, so the field never
                        // changes shape and the placeholder is the field rather than a label
                        // above it.
                        Box {
                            if (value.isEmpty()) {
                                DLText(
                                    text = "Write something",
                                    style = DayLogTheme.typography.entryBody,
                                    color = colors.inkFaint,
                                )
                            }
                            innerTextField()
                        }
                    },
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DLIconButton(
                        imageVector = DayLogIcons.Tag,
                        contentDescription = "Add a tag",
                        onClick = { pickingTag = true },
                        tint = colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.Pin,
                        contentDescription = if (place == null) "Add a location" else "Change the location",
                        onClick = { pickingPlace = true },
                        // The pin carries the fact on its own colour: set is accent, unset is
                        // muted. A word saying where beside it would be chrome the bar's one
                        // line cannot afford.
                        tint = if (place == null) colors.inkMuted else colors.accent,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.Image,
                        contentDescription = "Add a photo",
                        onClick = onAddPhoto,
                        tint = colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.UnfoldMore,
                        contentDescription = "Open the full editor",
                        onClick = onExpand,
                        tint = colors.inkMuted,
                    )

                    Spacer(Modifier.weight(1f))

                    if (isSaving) {
                        DLPendingDot()
                        Spacer(Modifier.width(8.dp))
                    }
                    DLIconButton(
                        imageVector = DayLogIcons.Check,
                        contentDescription = "Save",
                        onClick = onSave,
                        enabled = value.isNotBlank(),
                        tint = colors.ink,
                    )
                }
            }
        }
    }

    if (pickingTag) {
        TagPickerDialog(
            tags = tags,
            current = TagExtractor.extract(value).toSet(),
            onPick = insertTag,
            onRemove = { name -> onValueChange(TagExtractor.remove(value, name)) },
            onDismiss = { pickingTag = false },
        )
    }

    if (pickingPlace) {
        PlaceDialog(
            place = place,
            usedNames = usedNames,
            onSet = onPlaceChange,
            onDismiss = { pickingPlace = false },
        )
    }
}

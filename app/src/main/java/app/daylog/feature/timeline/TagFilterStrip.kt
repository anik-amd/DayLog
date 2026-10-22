package app.daylog.feature.timeline

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Tag

/**
 * The filter strip.
 *
 * The tags the writer has used, as chips. Choosing two shows the entries that carry both, so
 * the tags work together rather than one at a time.
 *
 * The strip is hidden when there are no tags yet: an empty row of nothing is just a gap.
 */
@Composable
fun TagFilterStrip(
    tags: List<Tag>,
    selected: Set<String>,
    onToggle: (String) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (tags.isEmpty()) return

    LazyRow(
        modifier = modifier.fillMaxWidth(),
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (selected.isNotEmpty()) {
            item(key = "clear") {
                DLChip(
                    text = "Clear",
                    onClick = onClear,
                )
            }
        }

        items(tags, key = { it.name }) { tag ->
            DLChip(
                text = if (tag.count > 1) "${tag.name} ${tag.count}" else tag.name,
                selected = tag.name in selected,
                onClick = { onToggle(tag.name) },
            )
        }
    }
}

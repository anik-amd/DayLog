package app.daylog.feature.search

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLTextField
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayGroup
import app.daylog.feature.timeline.DayHeading
import app.daylog.feature.timeline.EntryRow

/**
 * Finding an entry.
 *
 * One field at the top and the results underneath, in the same notebook shape the timeline uses,
 * so a result looks like the entry it is. The search is over the words of the entries and their
 * tags.
 */
@Composable
fun SearchScreen(
    query: String,
    onQueryChanged: (String) -> Unit,
    groups: List<DayGroup>,
    onEntryClick: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors
    val focusRequester = remember { FocusRequester() }
    val keyboard = LocalSoftwareKeyboardController.current

    // The keyboard is up as soon as the screen opens, because the whole point of the screen is to
    // type into it.
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        keyboard?.show()
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column {
            DLTopBar(
                title = "Search",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
            )

            DLTextField(
                value = query,
                onValueChange = onQueryChanged,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .focusRequester(focusRequester),
                placeholder = "Search your entries",
                imeAction = ImeAction.Search,
            )

            when {
                query.isBlank() -> Box(
                    modifier = Modifier.weight(1f),
                    contentAlignment = Alignment.Center,
                ) {
                    DLEmptyState(
                        title = "Search your diary",
                        body = "Every word you have written, and every tag you have used.",
                    )
                }

                groups.isEmpty() -> Box(
                    modifier = Modifier.weight(1f),
                    contentAlignment = Alignment.Center,
                ) {
                    DLEmptyState(
                        title = "Nothing found",
                        body = "No entry has that word in it yet.",
                    )
                }

                else -> LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp),
                ) {
                    groups.forEach { group ->
                        item(key = "day-${group.key}") {
                            DayHeading(group)
                        }
                        items(group.entries, key = { it.uid }) { entry ->
                            EntryRow(
                                entry = entry,
                                modifier = Modifier.pressable { onEntryClick(entry.uid) },
                            )
                        }
                    }
                }
            }
        }
    }
}

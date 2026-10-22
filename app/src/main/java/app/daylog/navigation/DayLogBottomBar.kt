package app.daylog.navigation

import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import app.daylog.core.designsystem.icon.DayLogIcons

/**
 * The two tabs at the bottom.
 *
 * Material's own bar, left as it comes: the tonal pill marks the tab the writer is on, and the
 * accent stays out of the chrome. Only the two homes of the app live here — everything else is a
 * screen the writer opens and leaves.
 */
@Composable
fun DayLogBottomBar(
    current: String?,
    onTab: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    NavigationBar(
        modifier = modifier,
    ) {
        NavigationBarItem(
            selected = current == Routes.Timeline,
            onClick = { onTab(Routes.Timeline) },
            icon = { Icon(imageVector = DayLogIcons.Timeline, contentDescription = null) },
            label = { Text(text = "Timeline") },
        )
        NavigationBarItem(
            selected = current == Routes.Calendar,
            onClick = { onTab(Routes.Calendar) },
            icon = { Icon(imageVector = DayLogIcons.Calendar, contentDescription = null) },
            label = { Text(text = "Calendar") },
        )
    }
}

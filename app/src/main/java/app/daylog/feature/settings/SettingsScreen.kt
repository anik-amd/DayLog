package app.daylog.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import app.daylog.core.data.settings.DayLogSettings
import app.daylog.core.data.settings.SettingsStore
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayLogAccentSource
import app.daylog.core.model.DayLogThemeMode

/**
 * The settings.
 *
 * Three decisions and nothing else: how the app is themed, whether it follows the wallpaper, and
 * whether the dark theme is on true black. A settings screen that lists twenty things is a
 * settings screen nobody reads.
 */
@Composable
fun SettingsScreen(
    settingsStore: SettingsStore,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val settings by settingsStore.settings.collectAsState(initial = DayLogSettings())
    val scope = rememberCoroutineScope()

    Surface(
        modifier = modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.surface,
    ) {
        Column {
            DLTopBar(
                title = "Settings",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 32.dp),
            ) {
                SettingSection(title = "Theme") {
                    ChoiceRow(
                        options = DayLogThemeMode.entries,
                        selected = settings.themeMode,
                        label = { mode ->
                            when (mode) {
                                DayLogThemeMode.System -> "System"
                                DayLogThemeMode.Light -> "Light"
                                DayLogThemeMode.Dark -> "Dark"
                            }
                        },
                        onSelect = { mode -> scope.launch { settingsStore.setThemeMode(mode) } },
                    )
                }

                SettingSection(title = "Colours") {
                    ChoiceRow(
                        options = DayLogAccentSource.entries,
                        selected = settings.accentSource,
                        label = { source ->
                            when (source) {
                                DayLogAccentSource.Teal -> "DayLog"
                                DayLogAccentSource.Wallpaper -> "Wallpaper"
                            }
                        },
                        onSelect = { source -> scope.launch { settingsStore.setAccentSource(source) } },
                    )
                }

                if (settings.themeMode == DayLogThemeMode.Dark ||
                    settings.themeMode == DayLogThemeMode.System
                ) {
                    SettingSection(title = "Night") {
                        SwitchRow(
                            title = "Pure black",
                            description = "Turn the dark theme's background off completely.",
                            checked = settings.pureBlack,
                            onCheckedChange = { enabled ->
                                scope.launch { settingsStore.setPureBlack(enabled) }
                            },
                        )
                    }
                }
            }
        }
    }
}

/**
 * A titled group of settings.
 */
@Composable
private fun SettingSection(
    title: String,
    content: @Composable () -> Unit,
) {
    Column(modifier = Modifier.padding(top = 20.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
        )
        content()
    }
}

/**
 * A row of choices, only one of which is on.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun <T> ChoiceRow(
    options: List<T>,
    selected: T,
    label: (T) -> String,
    onSelect: (T) -> Unit,
) {
    SingleChoiceSegmentedButtonRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
    ) {
        options.forEach { option ->
            SegmentedButton(
                selected = option == selected,
                onClick = { onSelect(option) },
                shape = SegmentedButtonDefaults.itemShape(
                    index = options.indexOf(option),
                    count = options.size,
                ),
            ) {
                Text(label(option))
            }
        }
    }
}

/**
 * A row with a switch.
 */
@Composable
private fun SwitchRow(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            // A switch is chrome, so it is the ink rather than the accent. The accent is for data.
            colors = SwitchDefaults.colors(
                checkedThumbColor = DayLogTheme.colors.background,
                checkedTrackColor = DayLogTheme.colors.ink,
                checkedBorderColor = DayLogTheme.colors.ink,
                uncheckedThumbColor = DayLogTheme.colors.inkMuted,
                uncheckedTrackColor = DayLogTheme.colors.surfaceContainerHigh,
                uncheckedBorderColor = DayLogTheme.colors.rule,
            ),
        )
    }
}

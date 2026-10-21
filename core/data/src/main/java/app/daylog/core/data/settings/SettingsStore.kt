package app.daylog.core.data.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import app.daylog.core.model.DayLogAccentSource
import app.daylog.core.model.DayLogThemeMode
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.settingsStore: DataStore<Preferences> by preferencesDataStore(name = "daylog_settings")

/**
 * The user's saved settings.
 */
data class DayLogSettings(
    val themeMode: DayLogThemeMode = DayLogThemeMode.System,
    val accentSource: DayLogAccentSource = DayLogAccentSource.Teal,
)

/**
 * Reads and writes the app's settings.
 */
class SettingsStore(private val context: Context) {

    private object Keys {
        val themeMode = stringPreferencesKey("theme_mode")
        val accentSource = stringPreferencesKey("accent_source")
    }

    val settings: Flow<DayLogSettings> = context.settingsStore.data.map { prefs ->
        DayLogSettings(
            themeMode = prefs[Keys.themeMode]
                ?.let { runCatching { DayLogThemeMode.valueOf(it) }.getOrNull() }
                ?: DayLogThemeMode.System,
            accentSource = prefs[Keys.accentSource]
                ?.let { runCatching { DayLogAccentSource.valueOf(it) }.getOrNull() }
                ?: DayLogAccentSource.Teal,
        )
    }

    suspend fun setThemeMode(mode: DayLogThemeMode) {
        context.settingsStore.edit { it[Keys.themeMode] = mode.name }
    }

    suspend fun setAccentSource(source: DayLogAccentSource) {
        context.settingsStore.edit { it[Keys.accentSource] = source.name }
    }
}

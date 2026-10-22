package app.daylog.di

import android.content.Context
import app.daylog.core.common.AppDispatchers
import app.daylog.core.common.DefaultAppDispatchers
import app.daylog.core.data.backup.BackupCodec
import app.daylog.core.data.local.DayLogDatabase
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.data.repository.MediaRepository
import app.daylog.core.data.settings.SettingsStore

/**
 * A hand-written dependency container.
 *
 * Everything the app needs is created lazily here and passed down explicitly. Nothing is looked
 * up from a global scope, so every dependency is visible at the point of use and tests can
 * substitute their own implementations.
 *
 * The graph is a handful of objects. A framework would add an annotation processor, a runtime and
 * a learning curve in exchange for solving a problem this app does not have.
 */
class AppContainer(private val context: Context) {

    val dispatchers: AppDispatchers by lazy { DefaultAppDispatchers() }

    val database: DayLogDatabase by lazy { DayLogDatabase.create(context) }

    val entryRepository: EntryRepository by lazy {
        EntryRepository(
            entryDao = database.entryDao(),
            tagDao = database.tagDao(),
            mediaDao = database.mediaDao(),
            entryFtsDao = database.entryFtsDao(),
        )
    }

    val mediaRepository: MediaRepository by lazy {
        MediaRepository(context = context, mediaDao = database.mediaDao())
    }

    val settingsStore: SettingsStore by lazy { SettingsStore(context) }

    val backupCodec: BackupCodec by lazy { BackupCodec }
}

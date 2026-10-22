package app.daylog.feature.settings

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import app.daylog.core.data.backup.BackupArchive
import app.daylog.core.data.backup.BackupCodec
import app.daylog.core.data.backup.BackupService
import app.daylog.di.AppContainer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.time.LocalDate

/**
 * The settings, wired up.
 *
 * The file picker belongs here rather than in the screen: a screen should show what is on it and
 * raise what happened, and a file picker is a thing that happened.
 */
@Composable
fun SettingsRoute(
    container: AppContainer,
    onBack: () -> Unit,
    onOpenStatistics: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    val exportContract = remember { ActivityResultContracts.CreateDocument("application/zip") }
    val importContract = remember { ActivityResultContracts.OpenDocument() }

    val exportLauncher = rememberLauncherForActivityResult(exportContract) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            busy = true
            message = exportTo(context, container.backupService, uri)
            busy = false
        }
    }

    val importLauncher = rememberLauncherForActivityResult(importContract) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            busy = true
            message = importFrom(context, container.backupService, uri)
            busy = false
        }
    }

    SettingsScreen(
        settingsStore = container.settingsStore,
        legacyImporter = container.legacyImporter,
        onBack = onBack,
        onOpenStatistics = onOpenStatistics,
        onExport = { exportLauncher.launch(backupFileName()) },
        onImport = { importLauncher.launch(arrayOf("application/zip", "application/json")) },
        busy = busy,
        message = message,
        modifier = modifier,
    )
}

/**
 * Writes everything out to the file the reader chose.
 */
private suspend fun exportTo(
    context: Context,
    service: BackupService,
    uri: Uri,
): String = withContext(Dispatchers.IO) {
    runCatching {
        val exported = service.export()
        context.contentResolver.openOutputStream(uri)?.use { output ->
            BackupArchive.write(output, BackupCodec.encode(exported.file), exported.photos)
        } ?: throw IllegalStateException("the file could not be opened")

        val photos = exported.photos.size
        "${exported.file.entries.size} entries exported" +
            if (photos > 0) ", with $photos photos." else "."
    }.getOrElse { error -> "The export failed: ${error.message}" }
}

/**
 * Reads everything back in from the file the reader chose.
 */
private suspend fun importFrom(
    context: Context,
    service: BackupService,
    uri: Uri,
): String = withContext(Dispatchers.IO) {
    runCatching {
        val archive = context.contentResolver.openInputStream(uri)?.use { stream ->
            BackupArchive.read(
                input = stream,
                mediaDirectory = File(context.filesDir, "media"),
                cacheDirectory = context.cacheDir,
            )
        } ?: throw IllegalStateException("the file could not be opened")

        val file = BackupCodec.decode(archive.json)
            ?: throw IllegalStateException("that file is not a DayLog backup")

        service.restore(file, archive.photos).message
    }.getOrElse { error -> "The import failed: ${error.message}" }
}

/**
 * The name the exported file is given.
 */
private fun backupFileName(): String = "daylog-backup-${LocalDate.now()}.zip"

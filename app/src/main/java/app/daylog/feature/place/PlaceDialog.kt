package app.daylog.feature.place

import android.Manifest.permission.ACCESS_COARSE_LOCATION
import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import android.location.Location
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import app.daylog.core.data.place.PickedPlace
import app.daylog.core.designsystem.component.DLPendingDot
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.component.DLIcon
import app.daylog.core.designsystem.theme.DayLogTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Naming the place an entry happened at.
 *
 * Three ways to answer the field: keep typing, tap a name the writer has already used, or ask the
 * device where it is. The permission the device one needs is asked on the tap and for nothing
 * else; the answer fills the field like a word would. Leaving the field empty and confirming
 * takes the place off the entry.
 */
@Composable
fun PlaceDialog(
    /** The place the entry carries, when it carries one. */
    place: PickedPlace?,
    /** The place names already in use, to tap rather than to type. */
    usedNames: List<String>,
    /** Answers with the picked place, whose coordinates still want resolving when they are null. */
    onSet: (PickedPlace?) -> Unit,
    onDismiss: () -> Unit,
) {
    val colors = DayLogTheme.colors
    val context = LocalContext.current
    var typed by remember { mutableStateOf(place?.name ?: "") }
    /** The fix the device answered with, if it is the fix the field now shows. */
    var deviceFix by remember { mutableStateOf<PickedPlace?>(null) }
    var locating by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val useFix: () -> Unit = {
        scope.launch {
            val fix = readCurrentPlace(context)
            if (fix != null) {
                deviceFix = fix
                typed = fix.name
            }
            locating = false
        }
    }

    /** The place the field stands for: the device fix when it still names it, else a word to resolve. */
    val answer: PickedPlace? = typed.trim().takeIf { it.isNotEmpty() }?.let { name ->
        deviceFix?.takeIf { it.name == name } ?: PickedPlace(name = name)
    }
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) {
            locating = true
            useFix()
        } else {
            locating = false
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Location") },
        text = {
            Column {
                OutlinedTextField(
                    value = typed,
                    onValueChange = { typed = it },
                    placeholder = { Text("Where was this?") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DLIcon(
                        imageVector = DayLogIcons.Pin,
                        contentDescription = null,
                        tint = if (locating) colors.accent else colors.inkMuted,
                    )
                    Spacer(Modifier.width(8.dp))
                    TextButton(
                        onClick = {
                            locating = true
                            permissionLauncher.launch(ACCESS_COARSE_LOCATION)
                        },
                    ) { Text("My location") }
                    if (locating) {
                        Spacer(Modifier.width(6.dp))
                        DLPendingDot()
                    }
                }

                val unused = usedNames.filter { it != place?.name && it != typed }
                if (unused.isNotEmpty()) {
                    Column {
                        unused.forEach { name ->
                            FilterChip(
                                selected = false,
                                onClick = { typed = name },
                                label = { Text(name) },
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onSet(answer)
                    onDismiss()
                },
            ) { Text("Done") }
        },
        dismissButton = {
            if (place != null) {
                TextButton(
                    onClick = {
                        onSet(null)
                        onDismiss()
                    },
                ) { Text("Remove") }
            } else {
                TextButton(onClick = onDismiss) { Text("Cancel") }
            }
        },
    )
}

/**
 * Where the device last was, and what that spot is called.
 *
 * A last known fix is all a diary needs — it is not a navigation app. The name comes from the
 * platform's own reverse geocoder; when it cannot answer, the fallback stands for the neighbourhood
 * the fix cannot name.
 */
@SuppressLint("MissingPermission")
suspend fun readCurrentPlace(context: Context): PickedPlace? = withContext(Dispatchers.Default) {
    val fix = runCatching {
        val manager = context.getSystemService(LocationManager::class.java) ?: return@withContext null
        listOf(
            LocationManager.NETWORK_PROVIDER,
            LocationManager.GPS_PROVIDER,
            LocationManager.PASSIVE_PROVIDER,
        ).asSequence()
            .mapNotNull { provider -> lastFix(manager, provider) }
            .firstOrNull()
    }.getOrNull() ?: return@withContext null

    val name = runCatching {
        Geocoder(context, java.util.Locale.getDefault())
            .getFromLocation(fix.latitude, fix.longitude, 1)
            ?.firstOrNull()
            ?.let { address -> address.locality ?: address.featureName }
    }.getOrNull()

    PickedPlace(name = name ?: "My location", latitude = fix.latitude, longitude = fix.longitude)
}

private fun lastFix(manager: LocationManager, provider: String): Location? = try {
    if (manager.isProviderEnabled(provider)) manager.getLastKnownLocation(provider) else null
} catch (security: SecurityException) {
    null
} catch (missing: IllegalArgumentException) {
    null
}

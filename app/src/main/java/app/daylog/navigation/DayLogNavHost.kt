package app.daylog.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.daylog.di.AppContainer
import app.daylog.feature.editor.FullScreenEditor
import app.daylog.feature.settings.SettingsScreen
import app.daylog.feature.timeline.TimelineRoute

/**
 * The screens in the app.
 */
object Routes {
    const val Timeline = "timeline"
    const val Editor = "editor"
    const val Settings = "settings"
}

/**
 * The app's navigation.
 *
 * Two screens: the timeline, and the full editor that opens over it. There is no bottom
 * navigation bar — the timeline is the app, and the editor is a mode of it.
 */
@Composable
fun DayLogNavHost(
    container: AppContainer,
    modifier: Modifier = Modifier,
) {
    val navController = rememberNavController()
    var editorText by remember { mutableStateOf("") }

    NavHost(
        navController = navController,
        startDestination = Routes.Timeline,
        modifier = modifier,
    ) {
        composable(Routes.Timeline) {
            TimelineRoute(
                container = container,
                onOpenEditor = {
                    editorText = ""
                    navController.navigate(Routes.Editor)
                },
                onOpenSettings = {
                    navController.navigate(Routes.Settings)
                },
            )
        }

        composable(Routes.Settings) {
            SettingsScreen(
                settingsStore = container.settingsStore,
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.Editor) {
            FullScreenEditor(
                initialText = editorText,
                onTextChanged = { editorText = it },
                onBack = { navController.popBackStack() },
            )
        }
    }
}

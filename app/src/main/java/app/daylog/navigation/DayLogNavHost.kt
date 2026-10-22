package app.daylog.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import app.daylog.di.AppContainer
import app.daylog.feature.calendar.CalendarRoute
import app.daylog.feature.editor.EditorRoute
import app.daylog.feature.editor.FullScreenEditor
import app.daylog.feature.entry.EntryDetailRoute
import app.daylog.feature.search.SearchRoute
import app.daylog.feature.settings.SettingsRoute
import app.daylog.feature.stats.StatisticsRoute
import app.daylog.feature.timeline.TimelineRoute

/**
 * The screens in the app.
 */
object Routes {
    const val Timeline = "timeline"
    const val Editor = "editor"
    const val Settings = "settings"
    const val Search = "search"
    const val Calendar = "calendar"
    const val Statistics = "statistics"
    const val Entry = "entry/{uid}"

    /** The route of one entry. */
    fun entry(uid: String) = "entry/$uid"
}

/**
 * The app's navigation.
 *
 * Three screens: the timeline, the full editor that opens over it, and the settings. An entry
 * opens in its own screen, because an entry is worth reading on its own terms.
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
                onOpenEntry = { uid ->
                    navController.navigate(Routes.entry(uid))
                },
                onOpenSearch = {
                    navController.navigate(Routes.Search)
                },
                onOpenCalendar = {
                    navController.navigate(Routes.Calendar)
                },
            )
        }

        composable(Routes.Search) {
            SearchRoute(
                container = container,
                onEntryClick = { uid -> navController.navigate(Routes.entry(uid)) },
                onBack = { navController.popBackStack() },
            )
        }

        composable(Routes.Calendar) {
            CalendarRoute(
                container = container,
                onBack = { navController.popBackStack() },
            )
        }

        composable(
            route = Routes.Entry,
            arguments = listOf(navArgument("uid") { type = NavType.StringType }),
        ) { backStackEntry ->
            val uid = backStackEntry.arguments?.getString("uid").orEmpty()
            EntryDetailRoute(
                container = container,
                uid = uid,
                onBack = { navController.popBackStack() },
                onEdit = {
                    navController.navigate("editor?uid=$uid")
                },
                onDeleted = { navController.popBackStack() },
            )
        }

        composable(
            route = "editor?uid={uid}",
            arguments = listOf(navArgument("uid") {
                type = NavType.StringType
                defaultValue = ""
                nullable = true
            }),
        ) { backStackEntry ->
            val uid = backStackEntry.arguments?.getString("uid")?.takeIf { it.isNotEmpty() }
            EditorRoute(
                container = container,
                uid = uid,
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

        composable(Routes.Settings) {
            SettingsRoute(
                container = container,
                onBack = { navController.popBackStack() },
                onOpenStatistics = { navController.navigate(Routes.Statistics) },
            )
        }

        composable(Routes.Statistics) {
            StatisticsRoute(
                container = container,
                onBack = { navController.popBackStack() },
            )
        }
    }
}

package app.daylog.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import app.daylog.di.AppContainer
import app.daylog.feature.calendar.CalendarRoute
import app.daylog.feature.editor.EditorRoute
import app.daylog.feature.entry.EntryDetailRoute
import app.daylog.feature.onthisday.OnThisDayRoute
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
    const val OnThisDay = "on-this-day"
    const val Statistics = "statistics"
    const val Entry = "entry/{uid}"

    /** The route of one entry. */
    fun entry(uid: String) = "entry/$uid"

    /** The screens the bottom tabs belong to. */
    val tabScreens = setOf(Timeline, Calendar)
}

/**
 * The app's navigation.
 *
 * Two tabs at the bottom — the timeline and the calendar, the two homes of the app — and above
 * them the screens the writer opens and leaves: an entry in its own screen, the full editor, the
 * search, this day in past years, the settings. The editor is one screen for the quick bar's
 * handover and for editing an entry that already exists; the text being handed over waits in
 * [editorText] between the bar and the editor, and is cleared again on the way out.
 */
@Composable
fun DayLogNavHost(
    container: AppContainer,
    modifier: Modifier = Modifier,
) {
    val navController = rememberNavController()
    var editorText by remember { mutableStateOf("") }

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route

    Column(modifier = modifier) {
        NavHost(
            navController = navController,
            startDestination = Routes.Timeline,
            modifier = Modifier.weight(1f),
        ) {
            composable(Routes.Timeline) {
                TimelineRoute(
                    container = container,
                    onOpenEditor = { text ->
                        editorText = text
                        navController.navigate(Routes.Editor)
                    },
                    onOpenEntryEditor = { uid, text ->
                        editorText = text
                        navController.navigate("editor?uid=$uid")
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
                    onOpenOnThisDay = {
                        navController.navigate(Routes.OnThisDay)
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
                    onOpenEntry = { uid ->
                        navController.navigate(Routes.entry(uid))
                    },
                )
            }

            composable(Routes.OnThisDay) {
                OnThisDayRoute(
                    container = container,
                    onBack = { navController.popBackStack() },
                    onOpenEntry = { uid ->
                        navController.navigate(Routes.entry(uid))
                    },
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
                    initialText = editorText,
                    onBack = {
                        editorText = ""
                        navController.popBackStack()
                    },
                )
            }

            composable(Routes.Editor) {
                EditorRoute(
                    container = container,
                    uid = null,
                    initialText = editorText,
                    onBack = {
                        editorText = ""
                        navController.popBackStack()
                    },
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

        // The tabs belong to the two homes; every other screen takes the whole of the phone.
        if (currentRoute in Routes.tabScreens) {
            DayLogBottomBar(
                current = currentRoute,
                onTab = { route ->
                    navController.navigate(route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
            )
        }
    }
}

package app.daylog

import android.app.Application

/**
 * Application entry point.
 *
 * Dependency wiring is manual (see [app.daylog.di.AppContainer]) rather than annotation-based.
 * The graph is small enough that a hand-written container is cheaper to build, faster to start and
 * easier to reason about than generated code.
 */
class DayLogApplication : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}

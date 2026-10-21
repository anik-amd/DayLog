package app.daylog.core.testing

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import org.junit.rules.TestWatcher
import org.junit.runner.Description

/**
 * Makes `Dispatchers.Main` a test dispatcher.
 *
 * A `viewModelScope` runs on the main dispatcher, and a plain JVM test has no main dispatcher, so
 * without this the coroutine never starts and the test passes for the wrong reason.
 *
 * The dispatcher is also handed to the test, so `runTest` uses the same scheduler and time can be
 * moved with `advanceTimeBy`.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule(
    val dispatcher: TestDispatcher = UnconfinedTestDispatcher(),
) : TestWatcher() {

    override fun starting(description: Description) {
        Dispatchers.setMain(dispatcher)
    }

    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}

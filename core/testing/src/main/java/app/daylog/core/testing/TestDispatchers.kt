package app.daylog.core.testing

import app.daylog.core.common.AppDispatchers
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.UnconfinedTestDispatcher

/**
 * The dispatchers a test runs on.
 *
 * Everything in the app takes its dispatchers as a dependency, so a test can hand it these and
 * know that nothing will run on a real thread or wait for a real clock.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class TestDispatchers(
    private val dispatcher: TestDispatcher = UnconfinedTestDispatcher(),
) : AppDispatchers {

    override val main: CoroutineDispatcher get() = dispatcher
    override val io: CoroutineDispatcher get() = dispatcher
    override val default: CoroutineDispatcher get() = dispatcher
}

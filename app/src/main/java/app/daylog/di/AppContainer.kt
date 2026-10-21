package app.daylog.di

import android.content.Context

/**
 * Hand-written dependency container.
 *
 * Everything the app needs is created lazily here and passed down explicitly. Nothing is looked up
 * from a global scope, so every dependency is visible at the point of use and tests can substitute
 * their own implementations.
 */
class AppContainer(private val context: Context) {

    // Repositories and use cases are added as their owning features land.
}

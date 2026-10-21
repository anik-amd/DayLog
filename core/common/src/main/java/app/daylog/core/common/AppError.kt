package app.daylog.core.common

/**
 * The failures the app can surface.
 *
 * Deliberately small. Anything a user can act on gets its own case so the UI can say something
 * specific; everything else collapses into [Unexpected].
 */
sealed interface AppError {
    /** The device has no usable network connection. */
    data object NoNetwork : AppError

    /** The server answered, but with an error. */
    data class Server(val code: Int, val message: String? = null) : AppError

    /** Reading or writing local storage failed. */
    data class Storage(val message: String? = null) : AppError

    /** The user's input could not be understood. */
    data class Invalid(val field: String, val reason: String) : AppError

    /** Anything not covered above. */
    data class Unexpected(val cause: Throwable? = null) : AppError
}

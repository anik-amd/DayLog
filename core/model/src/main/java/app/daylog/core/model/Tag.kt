package app.daylog.core.model

/**
 * A tag, either extracted from an entry's `#hashtag` or attached to it directly.
 */
data class Tag(
    val name: String,
    val count: Int = 0,
)

package app.daylog.core.model

/**
 * A diary entry.
 *
 * The shape is sync-ready: a stable [uid] for identity across devices, [updatedAt] for conflict
 * resolution and a nullable [deletedAt] tombstone so a delete can be replicated rather than
 * re-created on the next merge. Cloud sync is a later phase, but the data shape is chosen now so
 * adding it never needs a migration.
 */
data class Entry(
    val uid: String,
    val content: String,
    val createdAt: Long,
    val updatedAt: Long,
    val deletedAt: Long? = null,
    val placeName: String? = null,
    val placeLat: Double? = null,
    val placeLon: Double? = null,
    val weatherSummary: String? = null,
    val weatherCode: Int? = null,
    val syncedAt: Long? = null,
) {
    val isDeleted: Boolean get() = deletedAt != null
}

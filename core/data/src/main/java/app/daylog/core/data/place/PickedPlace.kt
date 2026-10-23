package app.daylog.core.data.place

/**
 * The place the writer has picked for an entry.
 *
 * A name and, when it is known, where it is — the name may come from the geocoder with
 * coordinates, from the device with coordinates, or from the writer's own typing without any.
 * Coordinates that are not known are simply absent; an entry never stores a place it cannot say.
 */
data class PickedPlace(
    /** The name as a chip would show it. Null only when the place is being taken off. */
    val name: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
)

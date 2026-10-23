package app.daylog.core.data.place

import app.daylog.core.data.weather.WeatherService

/**
 * Turns a name the writer typed into the place it is.
 *
 * The geocoder answers with the coordinates and with the name as the map spells it, which is what
 * a chip should read. When nothing is found the writer's own words stand — a place does not have
 * to have coordinates to be worth keeping.
 */
suspend fun resolvePlace(service: WeatherService, query: String): PickedPlace {
    val trimmed = query.trim()
    if (trimmed.isEmpty()) return PickedPlace(name = "")

    val found = runCatching { service.findPlaces(trimmed) }
        .getOrDefault(emptyList())
        .firstOrNull()
        ?: return PickedPlace(name = trimmed)

    return PickedPlace(
        name = found.name.ifBlank { trimmed },
        latitude = found.latitude.takeIf { it != 0.0 },
        longitude = found.longitude.takeIf { it != 0.0 },
    )
}

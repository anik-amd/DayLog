package app.daylog.core.data.weather

/**
 * A place, resolved from a name.
 */
data class Place(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val country: String? = null,
)

/**
 * The weather at a place.
 */
data class Weather(
    /** A short description: "Clear", "Light rain", "Snow". */
    val summary: String,
    /** The temperature in degrees Celsius. */
    val temperatureCelsius: Double,
    /** The code the forecast uses, kept so the icon can be chosen without guessing. */
    val code: Int,
)

/**
 * Looks up places and their weather.
 *
 * An interface so the rest of the app does not know where the data comes from, and so a test can
 * supply its own. The only implementation talks to Open-Meteo, which needs no API key.
 */
interface WeatherService {

    /**
     * Finds places matching a name.
     */
    suspend fun findPlaces(query: String): List<Place>

    /**
     * The current weather at a place.
     */
    suspend fun weatherAt(place: Place): Weather?
}

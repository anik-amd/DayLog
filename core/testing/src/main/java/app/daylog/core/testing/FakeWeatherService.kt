package app.daylog.core.testing

import app.daylog.core.data.weather.Place
import app.daylog.core.data.weather.Weather
import app.daylog.core.data.weather.WeatherService

/**
 * A weather service that answers from a script instead of the network.
 *
 * The app never asks the network during a test, so a test is fast and does not fail when the
 * weather service is down.
 */
class FakeWeatherService(
    private val places: List<Place> = emptyList(),
    private val weather: Weather? = null,
) : WeatherService {

    override suspend fun findPlaces(query: String): List<Place> =
        places.filter { it.name.contains(query, ignoreCase = true) }

    override suspend fun weatherAt(place: Place): Weather? = weather

    companion object {
        /** The weather used when a test does not care. */
        val defaultWeather = Weather(
            summary = "Clear",
            temperatureCelsius = 18.0,
            code = 0,
        )
    }
}

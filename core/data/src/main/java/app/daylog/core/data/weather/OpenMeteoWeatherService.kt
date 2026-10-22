package app.daylog.core.data.weather

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.net.HttpURLConnection
import java.net.URL

/**
 * The weather, from Open-Meteo.
 *
 * Open-Meteo needs no key, which is the whole reason it is used: the app has no account and no
 * server, and the reader's data never leaves the device except as a coordinate in a request.
 *
 * The client is deliberately plain: a URL, a read, and a small amount of parsing. It sits behind
 * [WeatherService] so a test never touches the network.
 */
class OpenMeteoWeatherService(
    private val geocodingUrl: String = "https://geocoding-api.open-meteo.com/v1/search",
    private val forecastUrl: String = "https://api.open-meteo.com/v1/forecast",
) : WeatherService {

    private val json = Json { ignoreUnknownKeys = true }

    override suspend fun findPlaces(query: String): List<Place> = withContext(Dispatchers.IO) {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return@withContext emptyList()

        val url = URL("$geocodingUrl?name=${trimmed.urlEncoded()}&count=10&language=en&format=json")
        val body = read(url) ?: return@withContext emptyList()

        runCatching {
            json.parseToJsonElement(body).jsonObject["results"]?.jsonArray.orEmpty().map { result ->
                val obj = result.jsonObject
                Place(
                    name = listOfNotNull(
                        obj["name"]?.jsonPrimitive?.content,
                        obj["admin1"]?.jsonPrimitive?.content,
                        obj["country"]?.jsonPrimitive?.content,
                    ).joinToString(", "),
                    latitude = obj["latitude"]?.jsonPrimitive?.content?.toDoubleOrNull() ?: 0.0,
                    longitude = obj["longitude"]?.jsonPrimitive?.content?.toDoubleOrNull() ?: 0.0,
                    country = obj["country"]?.jsonPrimitive?.content,
                )
            }
        }.getOrDefault(emptyList())
    }

    override suspend fun weatherAt(place: Place): Weather? = withContext(Dispatchers.IO) {
        val url = URL(
            "$forecastUrl?latitude=${place.latitude}&longitude=${place.longitude}" +
                "&current=temperature_2m,weather_code",
        )
        val body = read(url) ?: return@withContext null

        runCatching {
            val current = json.parseToJsonElement(body).jsonObject["current"]?.jsonObject
            val code = current?.get("weather_code")?.jsonPrimitive?.content?.toIntOrNull() ?: 0
            Weather(
                summary = summaryFor(code),
                temperatureCelsius = current?.get("temperature_2m")?.jsonPrimitive?.content?.toDoubleOrNull() ?: 0.0,
                code = code,
            )
        }.getOrNull()
    }

    /**
     * Reads a URL, or null if it cannot be reached.
     */
    private fun read(url: URL): String? = runCatching {
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10_000
            readTimeout = 10_000
            setRequestProperty("Accept", "application/json")
        }
        try {
            if (connection.responseCode !in 200..299) return null
            connection.inputStream.bufferedReader().use { it.readText() }
        } finally {
            connection.disconnect()
        }
    }.getOrNull()

    private fun String.urlEncoded(): String = java.net.URLEncoder.encode(this, "UTF-8")

    companion object {
        /**
         * The wording for a weather code.
         *
         * The forecast uses a number, and a number is not something a person would want to read on
         * a chip, so it is turned into a word here.
         */
        fun summaryFor(code: Int): String = when (code) {
            0 -> "Clear"
            1, 2 -> "Partly cloudy"
            3 -> "Overcast"
            45, 48 -> "Fog"
            in 51..57 -> "Drizzle"
            in 61..67 -> "Rain"
            in 71..77 -> "Snow"
            in 80..82 -> "Showers"
            in 85..86 -> "Snow showers"
            in 95..99 -> "Thunderstorm"
            else -> "Clear"
        }
    }
}

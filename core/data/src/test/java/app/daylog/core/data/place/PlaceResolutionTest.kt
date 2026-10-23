package app.daylog.core.data.place

import app.daylog.core.data.weather.Place
import app.daylog.core.data.weather.WeatherService
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Choosing the place a name belongs to.
 */
class PlaceResolutionTest {

    private class FixedWeatherService(private val places: List<Place>) : WeatherService {
        override suspend fun findPlaces(query: String): List<Place> =
            if (query == "throw") throw RuntimeException() else places

        override suspend fun weatherAt(place: Place) = null
    }

    @Test
    fun `a found name answers with the coordinates and the mapped spelling`() = runTest {
        val service = FixedWeatherService(listOf(Place(name = "Coimbatore", latitude = 11.0, longitude = 76.9)))

        val place = resolvePlace(service, "coimbatore")

        assertEquals("Coimbatore", place.name)
        assertEquals(11.0, place.latitude)
        assertEquals(76.9, place.longitude)
    }

    @Test
    fun `a name nothing is found for stands as the writer wrote it`() = runTest {
        val place = resolvePlace(FixedWeatherService(emptyList()), "the harbour bench")

        assertEquals("the harbour bench", place.name)
        assertNull(place.latitude)
    }

    @Test
    fun `a name whose geocoder answers badly still keeps its coordinates`() = runTest {
        val service = FixedWeatherService(listOf(Place(name = "", latitude = 0.0, longitude = 0.0)))

        val place = resolvePlace(service, "the harbour bench")

        assertEquals("the harbour bench", place.name)
        assertNull(place.latitude)
        assertNull(place.longitude)
    }

    @Test
    fun `an empty answer is an empty place`() = runTest {
        assertEquals("", resolvePlace(FixedWeatherService(emptyList()), "  ").name)
    }

    @Test
    fun `a geocoder that cannot be reached keeps the writer's words`() = runTest {
        val place = resolvePlace(FixedWeatherService(emptyList()), "throw")

        assertEquals("throw", place.name)
    }
}

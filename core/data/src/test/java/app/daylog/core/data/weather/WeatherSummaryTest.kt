package app.daylog.core.data.weather

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WeatherSummaryTest {

    @Test
    fun `clear is clear`() {
        assertEquals("Clear", OpenMeteoWeatherService.summaryFor(0))
    }

    @Test
    fun `cloud is a cloud`() {
        assertEquals("Partly cloudy", OpenMeteoWeatherService.summaryFor(1))
        assertEquals("Partly cloudy", OpenMeteoWeatherService.summaryFor(2))
        assertEquals("Overcast", OpenMeteoWeatherService.summaryFor(3))
    }

    @Test
    fun `rain is rain`() {
        assertEquals("Rain", OpenMeteoWeatherService.summaryFor(61))
        assertEquals("Rain", OpenMeteoWeatherService.summaryFor(65))
        assertEquals("Drizzle", OpenMeteoWeatherService.summaryFor(53))
    }

    @Test
    fun `snow is snow`() {
        assertEquals("Snow", OpenMeteoWeatherService.summaryFor(71))
        assertEquals("Snow showers", OpenMeteoWeatherService.summaryFor(85))
    }

    @Test
    fun `a storm is a storm`() {
        assertEquals("Thunderstorm", OpenMeteoWeatherService.summaryFor(95))
    }

    @Test
    fun `fog is fog`() {
        assertEquals("Fog", OpenMeteoWeatherService.summaryFor(45))
    }

    @Test
    fun `an unknown code does not show a number to the reader`() {
        // The chip says a word, never a code. An unknown code still has to read as something.
        val summary = OpenMeteoWeatherService.summaryFor(4242)

        assertTrue(summary.isNotEmpty())
        assertTrue(summary.none { it.isDigit() })
    }
}

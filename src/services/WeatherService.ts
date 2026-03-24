const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export interface WeatherData {
  temperature: number;
  condition: string;
  weatherCode: number;
}

export const fetchWeather = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      return null;
    }

    const temperature = Math.round(current.temperature_2m);
    const weatherCode = current.weather_code;
    const condition = WEATHER_CODES[weatherCode] || 'Unknown';

    return {
      temperature,
      condition,
      weatherCode,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const getWeatherIconName = (weatherCode: number): string => {
  if (weatherCode === 0) return 'sunny';
  if (weatherCode >= 1 && weatherCode <= 3) return 'partly-sunny';
  if (weatherCode >= 45 && weatherCode <= 48) return 'cloud';
  if (weatherCode >= 51 && weatherCode <= 57) return 'rainy-outline';
  if (weatherCode >= 61 && weatherCode <= 67) return 'rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'snow';
  if (weatherCode >= 80 && weatherCode <= 82) return 'rainy';
  if (weatherCode >= 85 && weatherCode <= 86) return 'snow';
  if (weatherCode >= 95) return 'thunderstorm';
  return 'cloudy';
};

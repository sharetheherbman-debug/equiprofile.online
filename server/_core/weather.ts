/**
 * Weather Service - Open-Meteo Integration
 * Free weather API with riding suitability advice
 * No API key required
 */

const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  condition: string;
  timestamp: string;
}

export interface RidingAdvice {
  suitable: boolean;
  level: "excellent" | "good" | "fair" | "poor" | "unsafe";
  message: string;
  warnings: string[];
}

export interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
  latitude: string,
  longitude: string,
): Promise<WeatherData> {
  const url = new URL(OPEN_METEO_API);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
  );
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    windSpeed: current.wind_speed_10m,
    precipitation: current.precipitation || 0,
    humidity: current.relative_humidity_2m,
    condition: getWeatherCondition(current.weather_code),
    timestamp: current.time,
  };
}

/**
 * Get 7-day weather forecast
 */
export async function getWeatherForecast(
  latitude: string,
  longitude: string,
): Promise<ForecastDay[]> {
  const url = new URL(OPEN_METEO_API);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  const daily = data.daily;

  return daily.time.map((date: string, index: number) => ({
    date,
    tempMax: daily.temperature_2m_max[index],
    tempMin: daily.temperature_2m_min[index],
    precipitation: daily.precipitation_sum[index] || 0,
    windSpeed: daily.wind_speed_10m_max[index],
    condition: getWeatherCondition(daily.weather_code[index]),
  }));
}

/**
 * Get riding advice based on weather conditions
 * Plain language, no JSON formatting
 */
export function getRidingAdvice(weather: WeatherData): RidingAdvice {
  const { temperature, windSpeed, precipitation } = weather;
  const warnings: string[] = [];

  // Excellent conditions
  if (
    temperature >= 15 &&
    temperature <= 25 &&
    windSpeed < 15 &&
    precipitation === 0
  ) {
    return {
      suitable: true,
      level: "excellent",
      message:
        "Perfect weather for riding! Clear skies and comfortable temperatures make this an ideal time for outdoor work.",
      warnings: [],
    };
  }

  // Check for unsafe conditions
  if (windSpeed > 40) {
    warnings.push("Strong winds may spook horses");
  }
  if (temperature > 35) {
    warnings.push("Very hot - risk of overheating");
  }
  if (temperature < -5) {
    warnings.push("Freezing temperatures - risk of slippery conditions");
  }
  if (precipitation > 10) {
    warnings.push("Heavy rainfall - poor visibility and slippery ground");
  }

  // Unsafe conditions
  if (
    windSpeed > 50 ||
    temperature > 38 ||
    temperature < -10 ||
    precipitation > 15
  ) {
    return {
      suitable: false,
      level: "unsafe",
      message:
        "Weather conditions are unsafe for riding. Consider postponing or working indoors. Horse and rider safety should come first.",
      warnings,
    };
  }

  // Poor conditions
  if (
    windSpeed > 35 ||
    temperature > 32 ||
    temperature < 0 ||
    precipitation > 5
  ) {
    return {
      suitable: false,
      level: "poor",
      message:
        "Conditions are not ideal for riding. If you must ride, keep sessions short and monitor your horse closely. Indoor arena work recommended.",
      warnings,
    };
  }

  // Fair conditions
  if (
    windSpeed > 25 ||
    temperature > 28 ||
    temperature < 5 ||
    precipitation > 2
  ) {
    return {
      suitable: true,
      level: "fair",
      message:
        "Riding is possible but conditions aren't perfect. Take extra precautions and be prepared to cut your session short if needed.",
      warnings,
    };
  }

  // Good conditions (default)
  return {
    suitable: true,
    level: "good",
    message:
      "Good weather for riding. Conditions are favorable for most activities. Stay alert and adjust your plans if weather changes.",
    warnings,
  };
}

/**
 * Convert WMO weather code to human-readable condition
 * https://open-meteo.com/en/docs
 */
function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

/**
 * Get hourly forecast for the next 24 hours
 */
export async function getHourlyForecast(
  latitude: string,
  longitude: string,
): Promise<WeatherData[]> {
  const url = new URL(OPEN_METEO_API);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_hours", "24");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  const hourly = data.hourly;

  return hourly.time.slice(0, 24).map((time: string, index: number) => ({
    temperature: hourly.temperature_2m[index],
    windSpeed: hourly.wind_speed_10m[index],
    precipitation: hourly.precipitation[index] || 0,
    humidity: hourly.relative_humidity_2m[index],
    condition: getWeatherCondition(hourly.weather_code[index]),
    timestamp: time,
  }));
}

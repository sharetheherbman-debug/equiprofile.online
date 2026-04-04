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
 * Get riding advice based on weather conditions and time of day.
 * Considers precipitation, temperature, wind, and hour of day.
 */
export function getRidingAdvice(weather: WeatherData, hourOfDay?: number): RidingAdvice {
  const { temperature, windSpeed, precipitation } = weather;

  // Determine current hour from weather timestamp or injected hour.
  // Open-Meteo with timezone=auto returns local-time strings like "2024-03-15T23:00".
  // We extract the hour directly from the string to avoid Node.js treating the string
  // as server-local time, which would produce the wrong hour for users in non-UTC
  // timezones (e.g. someone riding at 11pm AEST would appear as midday in UTC).
  const hour =
    hourOfDay ??
    (() => {
      try {
        // Prefer direct string extraction: "2024-03-15T23:00" → 23
        const match = weather.timestamp.match(/T(\d{2}):/);
        if (match) return parseInt(match[1], 10);
        return new Date().getHours();
      } catch {
        return new Date().getHours();
      }
    })();

  const isNighttime = hour < 6 || hour >= 21;
  const isDusk = hour >= 19 && hour < 21;
  const isDawn = hour >= 5 && hour < 7;

  const warnings: string[] = [];

  // Time-of-day warnings
  if (isNighttime) {
    warnings.push("Night-time riding — limited visibility, significantly higher risk");
  } else if (isDusk || isDawn) {
    warnings.push("Low-light conditions (dawn/dusk) — reduced visibility, use hi-vis gear");
  }

  // Weather warnings
  if (windSpeed > 40) {
    warnings.push("Strong winds may spook horses and make riding hazardous");
  }
  if (temperature > 35) {
    warnings.push("Very hot — risk of heat stress for horse and rider");
  }
  if (temperature < -5) {
    warnings.push("Freezing temperatures — icy ground and stiff muscles");
  }
  if (precipitation > 10) {
    warnings.push(
      "Heavy rainfall — poor footing, reduced visibility, high slip risk",
    );
  } else if (precipitation > 3) {
    warnings.push("Significant rain — wet ground increases slip risk");
  } else if (precipitation > 0) {
    warnings.push("Light rain — monitor footing and reduce speed");
  }

  // Unsafe conditions (checked before excellent so safety always wins)
  if (
    isNighttime ||
    windSpeed > 50 ||
    temperature > 38 ||
    temperature < -10 ||
    precipitation > 15
  ) {
    return {
      suitable: false,
      level: "unsafe",
      message: isNighttime
        ? "Night-time riding is not recommended — darkness significantly increases risk for both horse and rider. Wait for daylight before riding outdoors."
        : "Outdoor riding is not safe in these conditions. Stay off the horse or confine all activity to a covered arena. Safety must come first.",
      warnings,
    };
  }

  // Excellent conditions (must be checked AFTER warnings and unsafe are handled)
  if (
    temperature >= 15 &&
    temperature <= 25 &&
    windSpeed < 15 &&
    precipitation === 0 &&
    !isDusk &&
    !isDawn
  ) {
    return {
      suitable: true,
      level: "excellent",
      message:
        "Perfect conditions for riding. Clear weather and comfortable temperature — ideal for any outdoor activity.",
      warnings: [],
    };
  }

  // Poor conditions — outdoor riding strongly discouraged
  if (
    windSpeed > 35 ||
    temperature > 32 ||
    temperature < 0 ||
    precipitation > 5 ||
    isDusk ||
    isDawn
  ) {
    return {
      suitable: false,
      level: "poor",
      message:
        precipitation > 5
          ? "Heavy rain makes outdoor riding inadvisable — wet ground is slippery and dangerous. Stick to indoor work or groundwork in a covered area."
          : isDusk || isDawn
            ? "Low-light conditions make outdoor riding risky. If you must ride, use hi-vis equipment and stick to familiar, safe terrain."
            : "Outdoor conditions are poor. Keep any sessions short, stay in the arena, and monitor your horse closely throughout.",
      warnings,
    };
  }

  // Fair conditions — riding possible with caution
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
        precipitation > 2
          ? "It is raining — outdoor riding is possible but use caution. Choose firm ground, keep to a steady pace, and shorten the session if conditions worsen."
          : "Conditions are workable but not ideal. Take extra warm-up time, keep a close eye on your horse, and be ready to cut the session short.",
      warnings,
    };
  }

  // Good conditions (default)
  return {
    suitable: true,
    level: "good",
    message:
      "Good conditions for riding. Most outdoor activities are suitable — stay alert to any changes.",
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

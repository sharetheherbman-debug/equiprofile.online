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
    const reason = isNighttime
      ? `Reason: darkness severely limits visibility for both horse and rider, significantly increasing the risk of falls and injury.`
      : windSpeed > 50
        ? `Reason: extreme wind speed (${windSpeed} km/h) makes it unsafe to control a horse outdoors.`
        : temperature > 38
          ? `Reason: temperature is dangerously high (${temperature}°C) — severe heat stress and dehydration risk for horse and rider.`
          : temperature < -10
            ? `Reason: extreme cold (${temperature}°C) causes icy ground, frozen muscles, and high injury risk.`
            : `Reason: heavy rainfall (${precipitation} mm) creates dangerous footing and near-zero visibility.`;
    return {
      suitable: false,
      level: "unsafe",
      message: isNighttime
        ? `Night-time riding is not recommended — wait for daylight before riding outdoors. ${reason}`
        : `Outdoor riding is not safe in these conditions. Confine all activity to a covered arena or rest your horse. ${reason}`,
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
        `Perfect conditions for riding. Reason: temperature is comfortable (${temperature}°C), wind is calm (${windSpeed} km/h), and no rain — ideal for any outdoor activity.`,
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
    const reason =
      precipitation > 5
        ? `Reason: heavy rain (${precipitation} mm) makes the ground slippery and dangerous.`
        : isDusk || isDawn
          ? `Reason: low-light conditions reduce visibility and increase the risk of misjudging terrain.`
          : windSpeed > 35
            ? `Reason: strong winds (${windSpeed} km/h) can spook horses and make outdoor control difficult.`
            : temperature > 32
              ? `Reason: high temperature (${temperature}°C) increases heat stress and dehydration risk for your horse.`
              : `Reason: near-freezing temperature (${temperature}°C) risks icy ground and stiff, injury-prone muscles.`;
    return {
      suitable: false,
      level: "poor",
      message:
        precipitation > 5
          ? `Heavy rain makes outdoor riding inadvisable — stick to indoor work or groundwork in a covered area. ${reason}`
          : isDusk || isDawn
            ? `Low-light conditions make outdoor riding risky. If you must ride, use hi-vis gear and stay on familiar terrain. ${reason}`
            : `Outdoor conditions are poor today. Keep any sessions short, stay in the arena, and monitor your horse closely. ${reason}`,
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
    const reason =
      precipitation > 2
        ? `Reason: rain (${precipitation} mm) makes ground wetter — choose firm footing and keep a steady pace.`
        : temperature > 28
          ? `Reason: warm temperature (${temperature}°C) means your horse may tire and dehydrate more quickly — keep sessions shorter and ensure fresh water.`
          : temperature < 5
            ? `Reason: cool temperature (${temperature}°C) means muscles take longer to warm up — extend your warm-up and cool-down.`
            : `Reason: moderate wind (${windSpeed} km/h) may affect your horse's focus — give extra time to settle before asking for precision work.`;
    return {
      suitable: true,
      level: "fair",
      message:
        precipitation > 2
          ? `Riding is possible but use caution in current rain. ${reason}`
          : `Conditions are workable but not ideal. ${reason}`,
      warnings,
    };
  }

  // Good conditions (default)
  const reason = `Reason: temperature (${temperature}°C) and wind (${windSpeed} km/h) are within comfortable ranges and no precipitation is expected.`;
  return {
    suitable: true,
    level: "good",
    message:
      `Good conditions for riding. Most outdoor activities are suitable — stay alert to any changes. ${reason}`,
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

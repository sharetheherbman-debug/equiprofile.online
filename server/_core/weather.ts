/**
 * Weather Service
 * Fetches and caches weather data from external API
 * Supports OpenWeatherMap and WeatherAPI providers
 */

import axios from 'axios';

// Cache structure
interface WeatherCache {
  data: any;
  timestamp: number;
}

const cache = new Map<string, WeatherCache>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Weather API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const WEATHER_API_PROVIDER = (process.env.WEATHER_API_PROVIDER || 'openweathermap').toLowerCase();

export interface WeatherData {
  location: string;
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  precipitation: number; // mm
  conditions: string;
  uvIndex?: number;
  visibility?: number; // km
  forecast?: Array<{
    date: string;
    tempHigh: number;
    tempLow: number;
    conditions: string;
    precipitation: number;
  }>;
}

/**
 * Fetch weather data for a location
 * @param location Location name or coordinates
 * @returns Weather data
 */
export async function getWeather(location: string): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    throw new Error('Weather API key not configured. Set WEATHER_API_KEY environment variable.');
  }

  // Check cache
  const cacheKey = `${WEATHER_API_PROVIDER}:${location}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch from API based on provider
  let weatherData: WeatherData;
  
  if (WEATHER_API_PROVIDER === 'openweathermap') {
    weatherData = await fetchOpenWeatherMap(location);
  } else if (WEATHER_API_PROVIDER === 'weatherapi') {
    weatherData = await fetchWeatherAPI(location);
  } else {
    throw new Error(`Unsupported weather provider: ${WEATHER_API_PROVIDER}`);
  }

  // Cache result
  cache.set(cacheKey, {
    data: weatherData,
    timestamp: Date.now(),
  });

  return weatherData;
}

/**
 * Fetch from OpenWeatherMap API
 */
async function fetchOpenWeatherMap(location: string): Promise<WeatherData> {
  try {
    // Current weather
    const currentResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
      timeout: 10000,
    });

    const current = currentResponse.data;

    // Forecast (optional)
    let forecast: WeatherData['forecast'] = [];
    try {
      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: location,
          appid: WEATHER_API_KEY,
          units: 'metric',
          cnt: 8, // 3-hour intervals for 24 hours
        },
        timeout: 10000,
      });

      // Group by day and take daily min/max
      const dailyMap = new Map<string, any>();
      forecastResponse.data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            temps: [],
            conditions: item.weather[0]?.main || 'Unknown',
            precipitation: item.rain?.['3h'] || 0,
          });
        }
        dailyMap.get(date).temps.push(item.main.temp);
      });

      forecast = Array.from(dailyMap.values()).map((day) => ({
        date: day.date,
        tempHigh: Math.round(Math.max(...day.temps)),
        tempLow: Math.round(Math.min(...day.temps)),
        conditions: day.conditions,
        precipitation: Math.round(day.precipitation),
      }));
    } catch (err) {
      console.warn('[Weather] Failed to fetch forecast:', err);
    }

    return {
      location: current.name,
      temperature: Math.round(current.main.temp),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // m/s to km/h
      precipitation: current.rain?.['1h'] || 0,
      conditions: current.weather[0]?.main || 'Unknown',
      uvIndex: current.uvi,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : undefined,
      forecast,
    };
  } catch (error: any) {
    console.error('[Weather] OpenWeatherMap API error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch weather data: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Fetch from WeatherAPI.com
 */
async function fetchWeatherAPI(location: string): Promise<WeatherData> {
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: WEATHER_API_KEY,
        q: location,
        days: 3,
        aqi: 'no',
        alerts: 'yes',
      },
      timeout: 10000,
    });

    const data = response.data;
    const current = data.current;
    const location_data = data.location;

    const forecast = data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      tempHigh: Math.round(day.day.maxtemp_c),
      tempLow: Math.round(day.day.mintemp_c),
      conditions: day.day.condition.text,
      precipitation: Math.round(day.day.totalprecip_mm),
    }));

    return {
      location: location_data.name,
      temperature: Math.round(current.temp_c),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      precipitation: current.precip_mm,
      conditions: current.condition.text,
      uvIndex: current.uv,
      visibility: Math.round(current.vis_km),
      forecast,
    };
  } catch (error: any) {
    console.error('[Weather] WeatherAPI error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch weather data: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Clear weather cache (for testing or manual refresh)
 */
export function clearWeatherCache() {
  cache.clear();
}

/**
 * Get care suggestions based on weather conditions
 */
export function getCareSuggestions(weather: WeatherData): string[] {
  const suggestions: string[] = [];

  // Temperature-based suggestions
  if (weather.temperature > 30) {
    suggestions.push('🌡️ High heat: Provide extra water, consider early morning/late evening turnout');
    suggestions.push('💧 Monitor for dehydration signs');
    suggestions.push('🌳 Ensure shade is available');
  } else if (weather.temperature < 5) {
    suggestions.push('❄️ Cold weather: Check water isn\'t frozen, consider extra forage');
    suggestions.push('🧥 Ensure adequate shelter from wind');
  }

  // Wind-based suggestions
  if (weather.windSpeed > 40) {
    suggestions.push('💨 Strong winds: Exercise caution during riding, secure loose items');
    suggestions.push('🏠 Check stable doors and fixtures are secure');
  }

  // Precipitation suggestions
  if (weather.precipitation > 10) {
    suggestions.push('🌧️ Heavy rain: Check hooves daily for signs of thrush');
    suggestions.push('🥾 Muddy conditions: Extra attention to leg hygiene');
  }

  // UV index suggestions
  if (weather.uvIndex && weather.uvIndex > 7) {
    suggestions.push('☀️ High UV: Apply sun protection to sensitive areas (nose, eyes)');
    suggestions.push('⏰ Limit midday sun exposure');
  }

  // General weather condition suggestions
  if (weather.conditions.toLowerCase().includes('storm') || 
      weather.conditions.toLowerCase().includes('thunder')) {
    suggestions.push('⚡ Storm alert: Bring horses in, check for anxiety signs');
  }

  return suggestions;
}

/**
 * Get riding safety recommendation
 */
export function getRidingRecommendation(weather: WeatherData): {
  safety: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
  reason: string;
} {
  // Check for dangerous conditions
  if (weather.windSpeed > 50) {
    return { safety: 'not_recommended', reason: 'Dangerous wind speeds' };
  }
  
  if (weather.conditions.toLowerCase().includes('storm') || 
      weather.conditions.toLowerCase().includes('thunder')) {
    return { safety: 'not_recommended', reason: 'Storm conditions' };
  }

  if (weather.temperature < -5) {
    return { safety: 'poor', reason: 'Extremely cold - risk of ice' };
  }

  if (weather.temperature > 35) {
    return { safety: 'poor', reason: 'Extreme heat - risk of heat stress' };
  }

  // Check for less-than-ideal conditions
  if (weather.windSpeed > 30 || weather.precipitation > 5) {
    return { safety: 'fair', reason: 'Challenging conditions but manageable' };
  }

  if (weather.temperature < 0 || weather.temperature > 30) {
    return { safety: 'good', reason: 'Temperature requires extra precautions' };
  }

  // Ideal conditions
  if (weather.temperature >= 10 && weather.temperature <= 25 &&
      weather.windSpeed < 20 && weather.precipitation < 2) {
    return { safety: 'excellent', reason: 'Ideal riding conditions' };
  }

  return { safety: 'good', reason: 'Good riding conditions' };
}

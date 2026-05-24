import { NextResponse } from "next/server";
import { getWeatherCondition } from "@/lib/weather";
import type { LiveConditions } from "@/types/liveConditions";

interface OpenMeteoCurrent {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
  is_day?: number;
}

interface OpenMeteoResponse {
  timezone?: string;
  timezone_abbreviation?: string;
  current?: OpenMeteoCurrent;
  error?: boolean;
  reason?: string;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LATITUDE = 14.5995;
const DEFAULT_LONGITUDE = 120.9842;
const DEFAULT_TIMEZONE = "Asia/Manila";
const DEFAULT_LOCATION_NAME = "Metro Manila";

function parseNumberEnv(value: string | undefined, fallbackValue: number) {
  if (!value) {
    return fallbackValue;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function createWeatherUrl() {
  const latitude = parseNumberEnv(process.env.WEATHER_LATITUDE, DEFAULT_LATITUDE);
  const longitude = parseNumberEnv(process.env.WEATHER_LONGITUDE, DEFAULT_LONGITUDE);
  const timezone = process.env.WEATHER_TIMEZONE || DEFAULT_TIMEZONE;
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");

  weatherUrl.searchParams.set("latitude", latitude.toString());
  weatherUrl.searchParams.set("longitude", longitude.toString());
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code,is_day"
  );
  weatherUrl.searchParams.set("timezone", timezone);

  return weatherUrl.toString();
}

export async function GET() {
  try {
    const response = await fetch(createWeatherUrl(), {
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve live weather conditions." },
        { status: 502 }
      );
    }

    const weatherData = (await response.json()) as OpenMeteoResponse;

    if (weatherData.error || !weatherData.current) {
      return NextResponse.json(
        { error: weatherData.reason || "Weather provider returned an error." },
        { status: 502 }
      );
    }

    const temperatureC = Number(weatherData.current.temperature_2m ?? 0);
    const apparentTemperatureC = Number(
      weatherData.current.apparent_temperature ?? temperatureC
    );
    const weatherCode = Number(weatherData.current.weather_code ?? -1);
    const isDay = Number(weatherData.current.is_day ?? 1) === 1;
    const { label, summary } = getWeatherCondition(weatherCode, temperatureC, isDay);

    const payload: LiveConditions = {
      locationName: process.env.WEATHER_LOCATION_NAME || DEFAULT_LOCATION_NAME,
      timezone: weatherData.timezone || process.env.WEATHER_TIMEZONE || DEFAULT_TIMEZONE,
      timezoneAbbreviation: weatherData.timezone_abbreviation || "PST",
      nowEpochMs: Date.now(),
      weatherCode,
      weatherLabel: label,
      weatherSummary: summary,
      temperatureC,
      apparentTemperatureC,
      isDay
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Live weather service is currently unavailable." },
      { status: 500 }
    );
  }
}

export interface WeatherCondition {
  label: string;
  summary: string;
}

export function getWeatherCondition(
  weatherCode: number,
  temperatureC: number,
  isDay: boolean
): WeatherCondition {
  const label = getWeatherLabel(weatherCode, isDay);
  const summary = getWeatherSummary(weatherCode, temperatureC);

  return { label, summary };
}

export function getWeatherLabel(weatherCode: number, isDay: boolean) {
  switch (weatherCode) {
    case 0:
      return isDay ? "Clear sky" : "Clear night";
    case 1:
      return isDay ? "Mostly clear" : "Mostly clear night";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Drizzle";
    case 56:
    case 57:
      return "Freezing drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain";
    case 66:
    case 67:
      return "Freezing rain";
    case 71:
    case 73:
    case 75:
      return "Snowfall";
    case 77:
      return "Snow grains";
    case 80:
    case 81:
    case 82:
      return "Rain showers";
    case 85:
    case 86:
      return "Snow showers";
    case 95:
      return "Thunderstorm";
    case 96:
    case 99:
      return "Thunderstorm with hail";
    default:
      return "Weather unavailable";
  }
}

function getWeatherSummary(weatherCode: number, temperatureC: number) {
  if (temperatureC >= 35) {
    return "Extreme heat. Minimize prolonged outdoor exposure.";
  }

  if (temperatureC >= 32) {
    return "Heat advisory: stay hydrated and limit midday sun exposure.";
  }

  if (temperatureC <= 20) {
    return "Cool conditions expected today.";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "Thunderstorm risk in the area. Monitor updates closely.";
  }

  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return "Rain expected. Prepare for wet conditions.";
  }

  if ([45, 48].includes(weatherCode)) {
    return "Low visibility likely due to fog.";
  }

  return "Conditions are currently stable.";
}

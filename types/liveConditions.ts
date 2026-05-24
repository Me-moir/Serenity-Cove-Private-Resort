export interface LiveConditions {
  locationName: string;
  timezone: string;
  timezoneAbbreviation: string;
  nowEpochMs: number;
  weatherCode: number;
  weatherLabel: string;
  weatherSummary: string;
  temperatureC: number;
  apparentTemperatureC: number;
  isDay: boolean;
}

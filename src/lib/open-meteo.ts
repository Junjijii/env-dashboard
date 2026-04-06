const REVALIDATE_SECONDS = 60 * 60;
const MAX_ARCHIVE_YEAR = 2024;

type OpenMeteoCurrentResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
};

type OpenMeteoArchiveResponse = {
  daily?: {
    time?: string[];
    temperature_2m_mean?: Array<number | null>;
  };
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
};

export type YearlyTemp = {
  year: number;
  avgTemp: number;
};

export async function fetchCurrentWeather(
  lat: number,
  lng: number,
): Promise<CurrentWeather | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      console.error(
        `Open-Meteo current weather request failed: ${response.status}`,
      );
      return null;
    }

    const json = (await response.json()) as OpenMeteoCurrentResponse;
    const current = json.current;

    if (
      !current ||
      !Number.isFinite(current.temperature_2m) ||
      !Number.isFinite(current.relative_humidity_2m) ||
      !Number.isFinite(current.wind_speed_10m)
    ) {
      console.error("Open-Meteo current weather response missing fields:", json);
      return null;
    }

    const temperature = Number(current.temperature_2m);
    const humidity = Number(current.relative_humidity_2m);
    const windSpeed = Number(current.wind_speed_10m);

    return {
      time: current.time ?? "",
      temperature,
      humidity,
      windSpeed,
    };
  } catch (error) {
    console.error("Failed to fetch current weather:", error);
    return null;
  }
}

export async function fetchYearlyTempTrend(
  lat: number,
  lng: number,
  startYear: number,
  endYear: number,
): Promise<YearlyTemp[]> {
  try {
    const safeEndYear = Math.min(endYear, MAX_ARCHIVE_YEAR);

    if (startYear > safeEndYear) {
      return [];
    }

    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startYear}-01-01&end_date=${safeEndYear}-12-31&daily=temperature_2m_mean`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      console.error(
        `Open-Meteo archive request failed: ${response.status}`,
      );
      return [];
    }

    const json = (await response.json()) as OpenMeteoArchiveResponse;
    const dates = json.daily?.time ?? [];
    const temperatures = json.daily?.temperature_2m_mean ?? [];
    const yearlyTotals = new Map<number, { sum: number; count: number }>();

    dates.forEach((date, index) => {
      const temp = temperatures[index];

      if (!Number.isFinite(temp)) {
        return;
      }

      const temperature = Number(temp);
      const year = Number(date.slice(0, 4));

      if (!Number.isFinite(year)) {
        return;
      }

      const bucket = yearlyTotals.get(year) ?? { sum: 0, count: 0 };
      bucket.sum += temperature;
      bucket.count += 1;
      yearlyTotals.set(year, bucket);
    });

    return [...yearlyTotals.entries()]
      .map(([year, { sum, count }]) => ({
        year,
        avgTemp: Number((sum / count).toFixed(2)),
      }))
      .sort((left, right) => left.year - right.year);
  } catch (error) {
    console.error("Failed to fetch yearly temperature trend:", error);
    return [];
  }
}

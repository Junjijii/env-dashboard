const AQICN_TOKEN = "demo";
const REVALIDATE_SECONDS = 60 * 60;

type AqiMetric = {
  v: number;
};

type AqiApiResponse = {
  status: string;
  data?: {
    aqi?: number | string;
    city?: {
      name?: string;
    };
    dominentpol?: string;
    iaqi?: Record<string, AqiMetric>;
    time?: {
      iso?: string;
      s?: string;
    };
  };
};

export type AqiData = {
  aqi: number;
  city: string;
  dominentpol: string;
  iaqi: Record<string, AqiMetric>;
  time: string;
};

export function formatCityLabel(city: string): string {
  if (!city.trim()) {
    return city;
  }

  if (/[^\x00-\x7F]/.test(city)) {
    return city;
  }

  return city
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeCityName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resolveCityName(requestedCity: string, apiCityName?: string): string {
  const fallbackCity = formatCityLabel(requestedCity);

  if (!apiCityName) {
    return fallbackCity;
  }

  const requestedTokens = normalizeCityName(requestedCity)
    .split(" ")
    .filter((token) => token.length > 2);
  const normalizedApiCity = normalizeCityName(apiCityName);
  const hasMatchingToken = requestedTokens.some((token) =>
    normalizedApiCity.includes(token),
  );

  return hasMatchingToken ? apiCityName : fallbackCity;
}

export async function fetchAqi(city: string): Promise<AqiData | null> {
  try {
    const response = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${AQICN_TOKEN}`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      console.error(`AQICN request failed for ${city}: ${response.status}`);
      return null;
    }

    const json = (await response.json()) as AqiApiResponse;

    if (json.status !== "ok" || !json.data) {
      console.error(`AQICN response error for ${city}:`, json);
      return null;
    }

    const aqi = Number(json.data.aqi);

    if (!Number.isFinite(aqi)) {
      console.error(`AQICN returned invalid AQI for ${city}:`, json.data.aqi);
      return null;
    }

    return {
      aqi,
      city: resolveCityName(city, json.data.city?.name),
      dominentpol: json.data.dominentpol ?? "unknown",
      iaqi: json.data.iaqi ?? {},
      time: json.data.time?.iso ?? json.data.time?.s ?? "",
    };
  } catch (error) {
    console.error(`Failed to fetch AQI for ${city}:`, error);
    return null;
  }
}

export async function fetchMultipleAqi(cities: string[]): Promise<AqiData[]> {
  try {
    const results = await Promise.all(cities.map((city) => fetchAqi(city)));

    return results.filter((result): result is AqiData => result !== null);
  } catch (error) {
    console.error("Failed to fetch multiple AQI cities:", error);
    return [];
  }
}

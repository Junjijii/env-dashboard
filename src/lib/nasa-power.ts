const REVALIDATE_SECONDS = 60 * 60;
const MAX_NASA_YEAR = 2023;
const NASA_FILL_VALUE = -999;

type NasaPowerResponse = {
  properties?: {
    parameter?: {
      T2M?: Record<string, number>;
    };
  };
};

export type MonthlyTemp = {
  date: string;
  year: number;
  month: number;
  temp: number;
};

export type YearlyAverageTemp = {
  year: number;
  avgTemp: number;
};

export async function fetchMonthlyTemp(
  lat: number,
  lng: number,
  startYear: number,
  endYear: number,
): Promise<MonthlyTemp[]> {
  try {
    const safeEndYear = Math.min(endYear, MAX_NASA_YEAR);

    if (startYear > safeEndYear) {
      return [];
    }

    const response = await fetch(
      `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=RE&longitude=${lng}&latitude=${lat}&start=${startYear}&end=${safeEndYear}&format=JSON`,
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      console.error(`NASA POWER request failed: ${response.status}`);
      return [];
    }

    const json = (await response.json()) as NasaPowerResponse;
    const monthlySeries = json.properties?.parameter?.T2M ?? {};

    return Object.entries(monthlySeries)
      .map(([key, temp]) => {
        const year = Number(key.slice(0, 4));
        const month = Number(key.slice(4, 6));

        if (
          !Number.isFinite(year) ||
          !Number.isFinite(month) ||
          month === 13 ||
          !Number.isFinite(temp) ||
          temp <= NASA_FILL_VALUE
        ) {
          return null;
        }

        return {
          date: `${year}-${String(month).padStart(2, "0")}`,
          year,
          month,
          temp,
        };
      })
      .filter((item): item is MonthlyTemp => item !== null)
      .sort(
        (left, right) =>
          left.year - right.year || left.month - right.month,
      );
  } catch (error) {
    console.error("Failed to fetch NASA POWER monthly temperatures:", error);
    return [];
  }
}

export function monthlyTempsToYearlyAverages(
  data: MonthlyTemp[],
): YearlyAverageTemp[] {
  const buckets = new Map<number, { sum: number; count: number }>();

  data.forEach((entry) => {
    const bucket = buckets.get(entry.year) ?? { sum: 0, count: 0 };
    bucket.sum += entry.temp;
    bucket.count += 1;
    buckets.set(entry.year, bucket);
  });

  return [...buckets.entries()]
    .map(([year, { sum, count }]) => ({
      year,
      avgTemp: Number((sum / count).toFixed(2)),
    }))
    .sort((left, right) => left.year - right.year);
}

export function calculateDeviationFromBaseline(
  data: MonthlyTemp[],
  baselineYear: number,
  targetYear: number,
): number | null {
  const yearlyAverages = monthlyTempsToYearlyAverages(data);
  const baseline = yearlyAverages.find((entry) => entry.year === baselineYear);
  const target = yearlyAverages.find((entry) => entry.year === targetYear);

  if (!baseline || !target) {
    return null;
  }

  return Number((target.avgTemp - baseline.avgTemp).toFixed(2));
}

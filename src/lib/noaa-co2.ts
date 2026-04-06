const REVALIDATE_SECONDS = 60 * 60;
const NOAA_CO2_URL =
  "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.csv";
const MISSING_VALUE = -999.99;

export type Co2DataPoint = {
  date: string;
  ppm: number;
  yearAgo: number;
  tenYearAgo: number;
  increaseSince1800: number;
};

function isMissingValue(value: number): boolean {
  return value === MISSING_VALUE || !Number.isFinite(value);
}

export async function fetchCo2Data(): Promise<Co2DataPoint[]> {
  try {
    const response = await fetch(NOAA_CO2_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`NOAA CO2 request failed: ${response.status}`);
      return [];
    }

    const csv = await response.text();

    return csv
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("year"))
      .map((line) => line.split(","))
      .map((columns) => {
        const [year, month, day, , average, , yearAgo, tenYearAgo, increase] =
          columns;
        const numericYear = Number(year);
        const numericMonth = Number(month);
        const numericDay = Number(day);
        const ppm = Number(average);
        const yearAgoPpm = Number(yearAgo);
        const tenYearAgoPpm = Number(tenYearAgo);
        const increaseSince1800 = Number(increase);

        if (
          !Number.isFinite(numericYear) ||
          !Number.isFinite(numericMonth) ||
          !Number.isFinite(numericDay) ||
          isMissingValue(ppm) ||
          isMissingValue(yearAgoPpm) ||
          isMissingValue(tenYearAgoPpm) ||
          isMissingValue(increaseSince1800)
        ) {
          return null;
        }

        return {
          date: `${numericYear}-${String(numericMonth).padStart(2, "0")}-${String(
            numericDay,
          ).padStart(2, "0")}`,
          ppm,
          yearAgo: yearAgoPpm,
          tenYearAgo: tenYearAgoPpm,
          increaseSince1800,
        };
      })
      .filter((row): row is Co2DataPoint => row !== null);
  } catch (error) {
    console.error("Failed to fetch NOAA CO2 data:", error);
    return [];
  }
}

import AqiCityCard from "@/components/AqiCityCard";
import SummaryCard from "@/components/SummaryCard";
import TempTrendChart from "@/components/TempTrendChart";
import type { AqiData } from "@/lib/aqicn";
import { fetchMultipleAqi, formatCityLabel } from "@/lib/aqicn";
import { fetchCurrentWeather, fetchYearlyTempTrend } from "@/lib/open-meteo";

export const revalidate = 3600;

const TOKYO = {
  lat: 35.6762,
  lng: 139.6503,
};

const japanCities = [
  { label: "東京", query: "tokyo" },
  { label: "大阪", query: "osaka" },
  { label: "名古屋", query: "nagoya" },
  { label: "福岡", query: "fukuoka" },
  { label: "札幌", query: "sapporo" },
  { label: "仙台", query: "sendai" },
  { label: "広島", query: "hiroshima" },
  { label: "京都", query: "kyoto" },
  { label: "横浜", query: "yokohama" },
  { label: "神戸", query: "kobe" },
];

export default async function JapanPage() {
  const [aqiResults, yearlyTrend, currentWeather] = await Promise.all([
    fetchMultipleAqi(japanCities.map((city) => city.query)),
    fetchYearlyTempTrend(TOKYO.lat, TOKYO.lng, 1960, 2024),
    fetchCurrentWeather(TOKYO.lat, TOKYO.lng),
  ]);

  const aqiLookup = new Map(
    aqiResults.map((entry) => [formatCityLabel(entry.city), entry] as const),
  );
  const cityCards = japanCities
    .map((city) => {
      const data = aqiLookup.get(formatCityLabel(city.query));

      return data ? { ...data, city: city.label } : null;
    })
    .filter(
      (
        entry,
      ): entry is AqiData => entry !== null,
    );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2.5rem] border border-white/10 bg-slate-950/72 px-6 py-10 shadow-[0_36px_90px_-48px_rgba(0,0,0,0.9)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-emerald-200/80">
          Japan environment data
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          日本の環境データ
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          日本の主要都市の大気質、東京の長期気温推移、現在の気象条件を 1 ページに集約しました。
          日々の空気の変化と、数十年単位の温暖化傾向を同時に確認できます。
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          title="東京の現在気温"
          value={currentWeather ? currentWeather.temperature.toFixed(1) : "--"}
          unit="°C"
          description="Open-Meteo による東京の現在気温。"
          trend="stable"
          color="sky"
        />
        <SummaryCard
          title="東京の湿度"
          value={currentWeather ? currentWeather.humidity : "--"}
          unit="%"
          description="相対湿度。体感温度や視程の変化を把握する指標です。"
          trend="stable"
          color="emerald"
        />
        <SummaryCard
          title="東京の風速"
          value={currentWeather ? currentWeather.windSpeed.toFixed(1) : "--"}
          unit="km/h"
          description="風速 10m の現在値。汚染物質の拡散や体感への影響を見ます。"
          trend="stable"
          color="slate"
        />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">
              Air quality
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              主要10都市の AQI
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            東京・大阪・名古屋・福岡などの主要都市を横並びで比較します。数値が高いほど空気は悪化しています。
          </p>
        </div>

        {cityCards.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {cityCards.map((entry) => (
              <AqiCityCard
                key={entry.city}
                city={entry.city}
                aqi={entry.aqi}
                dominentpol={entry.dominentpol}
                time={entry.time}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
            日本主要都市のAQIデータを取得できませんでした。
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">
              Temperature archive
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              東京の年平均気温推移
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Open-Meteo Archive の日次平均気温から、1960年から2024年までの年平均を算出しています。
          </p>
        </div>

        <TempTrendChart data={yearlyTrend} city="東京" />
      </section>
    </div>
  );
}

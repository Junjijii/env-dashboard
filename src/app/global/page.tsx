import AqiRanking from "@/components/AqiRanking";
import Co2Chart from "@/components/Co2Chart";
import SummaryCard from "@/components/SummaryCard";
import TempTrendChart from "@/components/TempTrendChart";
import { fetchMultipleAqi } from "@/lib/aqicn";
import {
  calculateDeviationFromBaseline,
  fetchMonthlyTemp,
  monthlyTempsToYearlyAverages,
} from "@/lib/nasa-power";
import { fetchCo2Data } from "@/lib/noaa-co2";

export const revalidate = 3600;

const climateCities = [
  { label: "東京", lat: 35.6762, lng: 139.6503 },
  { label: "ニューヨーク", lat: 40.7128, lng: -74.006 },
  { label: "ロンドン", lat: 51.5072, lng: -0.1276 },
  { label: "シドニー", lat: -33.8688, lng: 151.2093 },
  { label: "ムンバイ", lat: 19.076, lng: 72.8777 },
];

const aqiCities = [
  "tokyo",
  "beijing",
  "delhi",
  "london",
  "new-york",
  "paris",
  "sydney",
  "mumbai",
  "shanghai",
  "cairo",
  "lagos",
  "moscow",
  "seoul",
  "bangkok",
  "jakarta",
  "mexico-city",
  "sao-paulo",
  "los-angeles",
  "berlin",
  "dubai",
];

function average(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  return Number(
    (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
  );
}

export default async function GlobalPage() {
  const [co2Data, climateSeries, aqiRanking] = await Promise.all([
    fetchCo2Data(),
    Promise.all(
      climateCities.map((city) => fetchMonthlyTemp(city.lat, city.lng, 2000, 2023)),
    ),
    fetchMultipleAqi(aqiCities),
  ]);

  const latestCo2 = co2Data.at(-1) ?? null;
  const averageDeviation = average(
    climateSeries
      .map((series) => calculateDeviationFromBaseline(series, 2000, 2023))
      .filter((value): value is number => value !== null),
  );
  const climateCharts = climateCities.map((city, index) => ({
    city: city.label,
    data: monthlyTempsToYearlyAverages(climateSeries[index] ?? []),
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2.5rem] border border-white/10 bg-slate-950/72 px-6 py-10 shadow-[0_36px_90px_-48px_rgba(0,0,0,0.9)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-rose-200/80">
          Global environment stress
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          世界の環境破壊
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          CO2濃度、主要都市の気温上昇、大都市圏の大気質を並べて追い、
          気候変動と生活環境の悪化を同じ視界で比較できるページです。
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <SummaryCard
          title="最新 CO2 観測値"
          value={latestCo2 ? latestCo2.ppm.toFixed(2) : "--"}
          unit="ppm"
          description="NOAA マウナロア観測所の最新週次データ。"
          trend={latestCo2 && latestCo2.ppm > latestCo2.yearAgo ? "up" : "stable"}
          color="emerald"
        />
        <SummaryCard
          title="主要5都市の平均偏差"
          value={
            averageDeviation === null
              ? "--"
              : `${averageDeviation > 0 ? "+" : ""}${averageDeviation.toFixed(2)}`
          }
          unit="vs 2000"
          description="東京・NY・ロンドン・シドニー・ムンバイの 2023 年平均気温と 2000 年平均気温の差の平均値です。"
          trend={averageDeviation !== null && averageDeviation > 0 ? "up" : "stable"}
          color="rose"
        />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">
              Carbon concentration
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              CO2 濃度の長期推移
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            全週次データから月次サンプルを抽出し、長期の上昇トレンドと危険水準の目安を可視化しています。
          </p>
        </div>

        <Co2Chart data={co2Data} />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">
              Temperature anomaly proxy
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              主要都市の気温推移
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            NASA POWER の月次気温から年平均を集計し、都市ごとの温暖化の傾きを比較しています。
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {climateCharts.map((chart) => (
            <TempTrendChart key={chart.city} data={chart.data} city={chart.city} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-200/80">
              Air quality stress
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              世界20都市の AQI
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            AQICN フィードを取得し、AQI の高い順に並べています。値が高いほど健康負荷が大きい状態です。
          </p>
        </div>

        <AqiRanking data={aqiRanking} />
      </section>
    </div>
  );
}

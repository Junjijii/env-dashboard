import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import { fetchAqi } from "@/lib/aqicn";
import {
  calculateDeviationFromBaseline,
  fetchMonthlyTemp,
} from "@/lib/nasa-power";
import { fetchCo2Data } from "@/lib/noaa-co2";
import { fetchCurrentWeather } from "@/lib/open-meteo";

export const revalidate = 3600;

const TOKYO = {
  lat: 35.6762,
  lng: 139.6503,
};

const globalClimateCities = [
  { name: "東京", lat: 35.6762, lng: 139.6503 },
  { name: "ニューヨーク", lat: 40.7128, lng: -74.006 },
  { name: "ロンドン", lat: 51.5072, lng: -0.1276 },
  { name: "シドニー", lat: -33.8688, lng: 151.2093 },
  { name: "ムンバイ", lat: 19.076, lng: 72.8777 },
];

function average(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  return Number(
    (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
  );
}

function formatValue(value: number | null, digits = 1): string {
  return value === null ? "--" : value.toFixed(digits);
}

export default async function Home() {
  const [co2Data, tokyoAqi, tokyoWeather, globalMonthlySeries] =
    await Promise.all([
      fetchCo2Data(),
      fetchAqi("tokyo"),
      fetchCurrentWeather(TOKYO.lat, TOKYO.lng),
      Promise.all(
        globalClimateCities.map((city) =>
          fetchMonthlyTemp(city.lat, city.lng, 2000, 2023),
        ),
      ),
    ]);

  const latestCo2 = co2Data.at(-1) ?? null;
  const latestCo2Trend =
    latestCo2 && latestCo2.ppm > latestCo2.yearAgo ? "up" : "stable";
  const globalDeviation = average(
    globalMonthlySeries
      .map((series) => calculateDeviationFromBaseline(series, 2000, 2023))
      .filter((value): value is number => value !== null),
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 px-6 py-10 shadow-[0_36px_90px_-48px_rgba(0,0,0,0.9)] sm:px-10 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.16),transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-emerald-200/80">
              Environment destruction in numbers
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              リアルタイムの環境変化を、日本と世界のデータで一望する。
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              NOAA、NASA POWER、Open-Meteo、AQICN の公開データを束ね、
              大気質・気温・CO2濃度の変動をダークテーマのダッシュボードで可視化します。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/japan"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                日本の環境データを見る
              </Link>
              <Link
                href="/global"
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                世界の環境破壊を見る
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Snapshot
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                東京の現況
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  AQI
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {tokyoAqi?.aqi ?? "--"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Temperature
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {tokyoWeather ? `${tokyoWeather.temperature.toFixed(1)}°C` : "--"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Humidity
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {tokyoWeather ? `${tokyoWeather.humidity}%` : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="現在の CO2 濃度"
          value={formatValue(latestCo2?.ppm ?? null, 2)}
          unit="ppm"
          description="NOAA マウナロア観測所の最新週次観測値。産業化以前からの累積増加が続いています。"
          trend={latestCo2Trend}
          color="emerald"
        />
        <SummaryCard
          title="東京の AQI"
          value={tokyoAqi?.aqi ?? "--"}
          unit="AQI"
          description="AQICN の公開フィードから取得した現在の大気質指標。数値が高いほど健康リスクが高まります。"
          trend={tokyoAqi && tokyoAqi.aqi > 100 ? "up" : "stable"}
          color="orange"
        />
        <SummaryCard
          title="東京の現在気温"
          value={formatValue(tokyoWeather?.temperature ?? null, 1)}
          unit="°C"
          description="Open-Meteo の現在値。湿度や風速と合わせて日本ページで詳細を確認できます。"
          trend="stable"
          color="sky"
        />
        <SummaryCard
          title="主要5都市の気温偏差"
          value={
            globalDeviation === null
              ? "--"
              : `${globalDeviation > 0 ? "+" : ""}${formatValue(globalDeviation, 2)}`
          }
          unit="vs 2000"
          description="東京・NY・ロンドン・シドニー・ムンバイの 2023 年平均気温が、2000 年に対してどれだけ上振れしたかの平均値です。"
          trend={globalDeviation !== null && globalDeviation > 0 ? "up" : "stable"}
          color="rose"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
            Japan dashboard
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            日本の環境データ
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            東京から札幌まで主要都市の AQI を比較し、1960年からの気温推移と現在の気象を重ねて確認できます。
          </p>
          <Link
            href="/japan"
            className="mt-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/16"
          >
            日本ページへ
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
            Global dashboard
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            世界の環境破壊
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            CO2濃度の長期推移、主要都市の温暖化傾向、世界20都市の AQI ランキングをまとめて追跡します。
          </p>
          <Link
            href="/global"
            className="mt-6 inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/16"
          >
            世界ページへ
          </Link>
        </div>
      </section>
    </div>
  );
}

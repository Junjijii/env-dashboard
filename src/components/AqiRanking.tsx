"use client";

import type { AqiData } from "@/lib/aqicn";

import { formatObservedAt, getAqiVisualMeta } from "./aqi-utils";

type AqiRankingProps = {
  data: AqiData[];
};

export default function AqiRanking({ data }: AqiRankingProps) {
  const ranking = [...data].sort((left, right) => right.aqi - left.aqi);

  if (!ranking.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
        世界都市のAQIランキングを取得できませんでした。
      </div>
    );
  }

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">
          Global AQI
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          世界主要都市ランキング
        </h3>
      </div>

      <div className="space-y-3">
        {ranking.map((entry, index) => {
          const meta = getAqiVisualMeta(entry.aqi);

          return (
            <div
              key={`${entry.city}-${entry.time}-${index}`}
              className={`grid gap-3 rounded-[1.4rem] border ${meta.borderClassName} bg-white/[0.03] p-4 md:grid-cols-[4rem_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)] md:items-center`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/6 text-sm font-semibold text-white ring-1 ring-white/10">
                  #{index + 1}
                </span>
                <div className="md:hidden">
                  <p className="font-semibold text-white">{entry.city}</p>
                  <p className="text-sm text-slate-400">
                    {entry.dominentpol.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="hidden min-w-0 md:block">
                <p className="truncate font-semibold text-white">{entry.city}</p>
                <p className="mt-1 text-sm text-slate-400">
                  主汚染物質 {entry.dominentpol.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClassName}`}
                >
                  {meta.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-white">
                  {entry.aqi}
                </span>
              </div>

              <p className="text-sm text-slate-400">
                更新: {formatObservedAt(entry.time)}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

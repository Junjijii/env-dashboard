"use client";

import { formatObservedAt, getAqiVisualMeta } from "./aqi-utils";

type AqiCityCardProps = {
  city: string;
  aqi: number;
  dominentpol: string;
  time: string;
};

export default function AqiCityCard({
  city,
  aqi,
  dominentpol,
  time,
}: AqiCityCardProps) {
  const meta = getAqiVisualMeta(aqi);

  return (
    <article
      className={`relative overflow-hidden rounded-[1.5rem] border ${meta.borderClassName} bg-slate-950/80 p-5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.glowClassName}`}
      />
      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">{city}</p>
            <p className="mt-1 text-sm text-slate-400">
              最終更新: {formatObservedAt(time)}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClassName}`}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              AQI
            </p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
              {aqi}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              主汚染物質
            </p>
            <p className="mt-2 text-lg font-medium text-slate-200">
              {dominentpol.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

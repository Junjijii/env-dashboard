"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TempTrendChartProps = {
  data: { year: number; avgTemp: number }[];
  city: string;
};

type TrendLine = {
  slope: number;
  intercept: number;
};

function calculateTrendLine(data: { year: number; avgTemp: number }[]): TrendLine | null {
  if (data.length < 2) {
    return null;
  }

  const length = data.length;
  const sumX = data.reduce((total, point) => total + point.year, 0);
  const sumY = data.reduce((total, point) => total + point.avgTemp, 0);
  const sumXY = data.reduce((total, point) => total + point.year * point.avgTemp, 0);
  const sumXX = data.reduce((total, point) => total + point.year * point.year, 0);
  const denominator = length * sumXX - sumX * sumX;

  if (denominator === 0) {
    return null;
  }

  const slope = (length * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / length;

  return { slope, intercept };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { year: number; avgTemp: number; trend: number } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-white">{point.year}年</p>
      <p className="mt-2 text-sm text-slate-200">{point.avgTemp.toFixed(2)}°C</p>
      <p className="mt-1 text-xs text-slate-400">
        トレンド推定 {point.trend.toFixed(2)}°C
      </p>
    </div>
  );
}

export default function TempTrendChart({ data, city }: TempTrendChartProps) {
  const trend = calculateTrendLine(data);
  const chartId = city.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "temp";
  const chartData = data.map((point) => ({
    ...point,
    trend: trend ? trend.slope * point.year + trend.intercept : point.avgTemp,
  }));
  const delta =
    chartData.length >= 2
      ? Number((chartData.at(-1)!.avgTemp - chartData[0].avgTemp).toFixed(2))
      : null;

  if (!chartData.length) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
        {city} の気温データを取得できませんでした。
      </div>
    );
  }

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_28px_70px_-46px_rgba(0,0,0,0.95)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">
            Temperature trend
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{city}</h3>
        </div>
        {delta !== null ? (
          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/8 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">
              Span
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {delta > 0 ? "+" : ""}
              {delta}°C
            </p>
          </div>
        ) : null}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 6, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`temp-gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis
              dataKey="year"
              minTickGap={28}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avgTemp"
              stroke="#7dd3fc"
              strokeWidth={2.5}
              fill={`url(#temp-gradient-${chartId})`}
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#f97316"
              strokeDasharray="6 4"
              dot={false}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

"use client";

import type { Co2DataPoint } from "@/lib/noaa-co2";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Co2ChartProps = {
  data: Co2DataPoint[];
};

type ChartPoint = Co2DataPoint & {
  month: string;
};

function buildMonthlySeries(data: Co2DataPoint[]): ChartPoint[] {
  const buckets = new Map<string, Co2DataPoint>();

  data.forEach((point) => {
    const monthKey = point.date.slice(0, 7);

    if (!buckets.has(monthKey)) {
      buckets.set(monthKey, point);
    }
  });

  return [...buckets.values()].map((point) => ({
    ...point,
    month: point.date.slice(0, 7),
  }));
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-white">{point.date}</p>
      <p className="mt-2 text-sm text-slate-200">{point.ppm.toFixed(2)} ppm</p>
      <p className="mt-1 text-xs text-slate-400">
        1800年比 +{point.increaseSince1800.toFixed(2)} ppm
      </p>
    </div>
  );
}

export default function Co2Chart({ data }: Co2ChartProps) {
  const chartData = buildMonthlySeries(data);
  const latest = chartData.at(-1);

  if (!chartData.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
        CO2データを取得できませんでした。
      </div>
    );
  }

  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">
            NOAA Mauna Loa
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            大気中 CO2 濃度
          </h3>
        </div>
        {latest ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
              Latest
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {latest.ppm.toFixed(2)} ppm
            </p>
          </div>
        ) : null}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
            <XAxis
              dataKey="month"
              minTickGap={36}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value: string) => value.slice(0, 4)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={350}
              stroke="#34d399"
              strokeDasharray="4 4"
              label={{
                value: "350 ppm",
                fill: "#34d399",
                position: "insideTopRight",
              }}
            />
            <ReferenceLine
              y={400}
              stroke="#fb7185"
              strokeDasharray="4 4"
              label={{
                value: "400 ppm",
                fill: "#fb7185",
                position: "insideTopLeft",
              }}
            />
            <Line
              type="monotone"
              dataKey="ppm"
              stroke="#4ade80"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#bbf7d0" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

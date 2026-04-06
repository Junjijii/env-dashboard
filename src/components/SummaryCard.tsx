"use client";

type SummaryCardProps = {
  title: string;
  value: string | number;
  unit: string;
  description: string;
  trend?: "up" | "down" | "stable";
  color?: string;
};

const colorStyles: Record<
  string,
  { border: string; glow: string; accent: string; text: string }
> = {
  emerald: {
    border: "border-emerald-400/20",
    glow: "from-emerald-500/18 via-emerald-400/8 to-transparent",
    accent: "bg-emerald-400/15 ring-1 ring-emerald-300/30",
    text: "text-emerald-100",
  },
  sky: {
    border: "border-sky-400/20",
    glow: "from-sky-500/18 via-sky-400/8 to-transparent",
    accent: "bg-sky-400/15 ring-1 ring-sky-300/30",
    text: "text-sky-100",
  },
  orange: {
    border: "border-orange-400/20",
    glow: "from-orange-500/18 via-orange-400/8 to-transparent",
    accent: "bg-orange-400/15 ring-1 ring-orange-300/30",
    text: "text-orange-100",
  },
  rose: {
    border: "border-rose-400/20",
    glow: "from-rose-500/18 via-rose-400/8 to-transparent",
    accent: "bg-rose-400/15 ring-1 ring-rose-300/30",
    text: "text-rose-100",
  },
  slate: {
    border: "border-slate-400/20",
    glow: "from-slate-400/18 via-slate-300/8 to-transparent",
    accent: "bg-slate-400/15 ring-1 ring-slate-300/30",
    text: "text-slate-100",
  },
};

const trendStyles = {
  up: {
    label: "悪化",
    icon: "↑",
    className: "bg-rose-500/10 text-rose-200",
  },
  down: {
    label: "改善",
    icon: "↓",
    className: "bg-emerald-500/10 text-emerald-200",
  },
  stable: {
    label: "横ばい",
    icon: "→",
    className: "bg-slate-500/10 text-slate-200",
  },
} as const;

export default function SummaryCard({
  title,
  value,
  unit,
  description,
  trend = "stable",
  color = "emerald",
}: SummaryCardProps) {
  const palette = colorStyles[color] ?? colorStyles.emerald;
  const trendMeta = trendStyles[trend];

  return (
    <article
      className={`relative overflow-hidden rounded-[1.75rem] border ${palette.border} bg-slate-950/75 p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.95)]`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.glow}`}
      />
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-300">{title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              Real-time snapshot
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${trendMeta.className}`}
          >
            {trendMeta.icon} {trendMeta.label}
          </span>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {value}
          </span>
          <span
            className={`mb-1 rounded-full px-3 py-1 text-sm font-medium ${palette.accent} ${palette.text}`}
          >
            {unit}
          </span>
        </div>

        <p className="max-w-sm text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </article>
  );
}

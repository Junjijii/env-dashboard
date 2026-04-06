export type AqiVisualMeta = {
  label: string;
  badgeClassName: string;
  borderClassName: string;
  glowClassName: string;
};

export function getAqiVisualMeta(aqi: number): AqiVisualMeta {
  if (aqi <= 50) {
    return {
      label: "良好",
      badgeClassName:
        "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40",
      borderClassName: "border-emerald-400/25",
      glowClassName:
        "from-emerald-500/14 via-emerald-400/6 to-transparent",
    };
  }

  if (aqi <= 100) {
    return {
      label: "普通",
      badgeClassName:
        "bg-amber-400/15 text-amber-100 ring-1 ring-amber-300/40",
      borderClassName: "border-amber-300/25",
      glowClassName:
        "from-amber-400/14 via-amber-300/6 to-transparent",
    };
  }

  if (aqi <= 150) {
    return {
      label: "敏感な人に有害",
      badgeClassName:
        "bg-orange-500/15 text-orange-100 ring-1 ring-orange-300/40",
      borderClassName: "border-orange-300/25",
      glowClassName:
        "from-orange-500/14 via-orange-400/6 to-transparent",
    };
  }

  if (aqi <= 200) {
    return {
      label: "有害",
      badgeClassName:
        "bg-rose-500/15 text-rose-100 ring-1 ring-rose-300/40",
      borderClassName: "border-rose-300/25",
      glowClassName: "from-rose-500/14 via-rose-400/6 to-transparent",
    };
  }

  return {
    label: "非常に有害",
    badgeClassName:
      "bg-fuchsia-500/15 text-fuchsia-100 ring-1 ring-fuchsia-300/40",
    borderClassName: "border-fuchsia-300/25",
    glowClassName:
      "from-fuchsia-500/14 via-fuchsia-400/6 to-transparent",
  };
}

export function formatObservedAt(value: string): string {
  if (!value) {
    return "観測時刻不明";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

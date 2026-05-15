import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsDailyBucket } from "@/hooks/useListingDailyAnalytics";

interface ListingViewsChartProps {
  data: AnalyticsDailyBucket[];
  /** 7 or 30 — used to thin out X-axis labels on the wider range. */
  windowDays: 7 | 30;
  height?: number;
  className?: string;
}

/**
 * Two-series area chart of views + contacts over time. Drawn with
 * recharts (already a dependency). Tooltip and axes localise to
 * Czech short labels.
 */
export default function ListingViewsChart({
  data,
  windowDays,
  height = 200,
  className = "",
}: ListingViewsChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      label: formatShortLabel(d.date),
      views: d.views,
      contacts:
        d.contactClicks + d.whatsappClicks + d.telegramClicks,
    }));
  }, [data]);

  const tickInterval = windowDays === 30 ? 4 : 0;

  return (
    <div
      className={`w-full ${className}`}
      style={{ height }}
      data-testid="listing-views-chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="lvc-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8860B" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#B8860B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lvc-contacts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f7a5a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1f7a5a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            strokeOpacity={0.08}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "currentColor", fillOpacity: 0.55 }}
            padding={{ left: 4, right: 4 }}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "currentColor", fillOpacity: 0.55 }}
          />
          <Tooltip
            cursor={{
              stroke: "#B8860B",
              strokeWidth: 1,
              strokeOpacity: 0.5,
              strokeDasharray: "3 3",
            }}
            contentStyle={{
              borderRadius: 8,
              borderColor: "#B8860B",
              fontSize: 12,
              padding: "6px 10px",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 2 }}
            formatter={(value: number, name: string) => {
              if (name === "views") return [value, "Zobrazení"];
              if (name === "contacts") return [value, "Kontakty"];
              return [value, name];
            }}
            labelFormatter={(label: string, payload) => {
              const raw = payload?.[0]?.payload?.date;
              return raw ? formatTooltipLabel(String(raw)) : label;
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#B8860B"
            strokeWidth={2}
            fill="url(#lvc-views)"
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="contacts"
            stroke="#1f7a5a"
            strokeWidth={1.5}
            fill="url(#lvc-contacts)"
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatShortLabel(isoDate: string): string {
  // "2026-05-08" → "8.5."
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const day = Number(parts[2]);
  const month = Number(parts[1]);
  if (!Number.isFinite(day) || !Number.isFinite(month)) return isoDate;
  return `${day}.${month}.`;
}

function formatTooltipLabel(isoDate: string): string {
  // "2026-05-08" → "8. 5. 2026"
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${Number(parts[2])}. ${Number(parts[1])}. ${parts[0]}`;
}

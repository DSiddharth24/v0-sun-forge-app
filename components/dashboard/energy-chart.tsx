"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { energyData } from "@/lib/solar-data"

export function EnergyChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Energy Production vs Consumption
          </h3>
          <p className="text-xs text-muted-foreground">Today&apos;s overview (kW)</p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={energyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.75 0.16 65)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.75 0.16 65)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "oklch(0.6 0.02 250)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.6 0.02 250)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0.005 250)",
                border: "1px solid oklch(0.28 0.01 250)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "oklch(0.95 0.01 90)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "oklch(0.6 0.02 250)" }}
            />
            <Area
              type="monotone"
              dataKey="production"
              stroke="oklch(0.75 0.16 65)"
              fill="url(#prodGrad)"
              strokeWidth={2}
              name="Production"
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="oklch(0.55 0.15 250)"
              fill="url(#consGrad)"
              strokeWidth={2}
              name="Consumption"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { weeklyData } from "@/lib/solar-data"

export function WeeklyChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Weekly Output
        </h3>
        <p className="text-xs text-muted-foreground">Total kWh per day</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 250)" />
            <XAxis
              dataKey="day"
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
            <Bar
              dataKey="output"
              fill="oklch(0.75 0.16 65)"
              radius={[6, 6, 0, 0]}
              name="Output (kWh)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

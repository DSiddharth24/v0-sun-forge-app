"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
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

const lightColors = {
  grid: "#e5e5e5",
  tick: "#737373",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e5e5e5",
  tooltipText: "#171717",
  bar: "#d97706",
}

const darkColors = {
  grid: "oklch(0.28 0.01 250)",
  tick: "oklch(0.6 0.02 250)",
  tooltipBg: "oklch(0.18 0.005 250)",
  tooltipBorder: "oklch(0.28 0.01 250)",
  tooltipText: "oklch(0.95 0.01 90)",
  bar: "oklch(0.75 0.16 65)",
}

export function WeeklyChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const c = mounted && resolvedTheme === "light" ? lightColors : darkColors

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Weekly Output</h3>
        <p className="text-xs text-muted-foreground">Total kWh per day</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: c.tick }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: c.tick }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: c.tooltipBg,
                border: `1px solid ${c.tooltipBorder}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: c.tooltipText,
              }}
            />
            <Bar dataKey="output" fill={c.bar} radius={[6, 6, 0, 0]} name="Output (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

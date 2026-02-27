"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
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

const lightColors = {
  grid: "#e5e5e5",
  tick: "#737373",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e5e5e5",
  tooltipText: "#171717",
  prod: "#d97706",
  cons: "#2563eb",
}

const darkColors = {
  grid: "oklch(0.28 0.01 250)",
  tick: "oklch(0.6 0.02 250)",
  tooltipBg: "oklch(0.18 0.005 250)",
  tooltipBorder: "oklch(0.28 0.01 250)",
  tooltipText: "oklch(0.95 0.01 90)",
  prod: "oklch(0.75 0.16 65)",
  cons: "oklch(0.55 0.15 250)",
}

export function EnergyChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const c = mounted && resolvedTheme === "light" ? lightColors : darkColors

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Energy Production vs Consumption
          </h3>
          <p className="text-xs text-muted-foreground">{"Today's overview (kW)"}</p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={energyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c.prod} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c.prod} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c.cons} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c.cons} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: c.tick }} tickLine={false} axisLine={false} />
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
            <Legend wrapperStyle={{ fontSize: "12px", color: c.tick }} />
            <Area type="monotone" dataKey="production" stroke={c.prod} fill="url(#prodGrad)" strokeWidth={2} name="Production" />
            <Area type="monotone" dataKey="consumption" stroke={c.cons} fill="url(#consGrad)" strokeWidth={2} name="Consumption" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

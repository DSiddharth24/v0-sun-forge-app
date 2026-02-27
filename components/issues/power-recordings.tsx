"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { getRecordingsForAlert } from "@/lib/solar-data"
import { Activity } from "lucide-react"

const phaseColors: Record<string, { stroke: string; label: string }> = {
  before: { stroke: "oklch(0.65 0.12 160)", label: "Before Problem" },
  during: { stroke: "oklch(0.58 0.22 27)", label: "During Problem" },
  after: { stroke: "oklch(0.75 0.16 65)", label: "After Fix" },
}

export function PowerRecordings({ alertId }: { alertId: string }) {
  const recordings = getRecordingsForAlert(alertId)

  if (recordings.length === 0) return null

  // Merge all phases into one dataset keyed by time
  const mergedData: Record<string, Record<string, number | string>>[] = []
  const timeSet = new Set<string>()
  recordings.forEach((rec) => rec.data.forEach((d) => timeSet.add(d.time)))

  const sortedTimes = Array.from(timeSet).sort()

  const chartData = sortedTimes.map((time) => {
    const row: Record<string, number | string> = { time }
    recordings.forEach((rec) => {
      const point = rec.data.find((d) => d.time === time)
      row[rec.phase] = point ? point.output : 0
    })
    return row
  })

  const phases = recordings.map((r) => r.phase)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Power Supply Recordings</h4>
          <p className="text-xs text-muted-foreground">
            Output comparison across problem phases (kW)
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        {recordings.map((rec) => (
          <div key={rec.id} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: phaseColors[rec.phase]?.stroke }}
            />
            <div>
              <span className="text-xs font-medium text-foreground">
                {phaseColors[rec.phase]?.label}
              </span>
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                {new Date(rec.recordedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: "11px", color: "oklch(0.6 0.02 250)" }} />
            {phases.map((phase) => (
              <Line
                key={phase}
                type="monotone"
                dataKey={phase}
                stroke={phaseColors[phase]?.stroke}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                name={phaseColors[phase]?.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

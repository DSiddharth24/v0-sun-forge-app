"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
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
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  recoveryReports,
  getRecoverySummary,
  devices,
} from "@/lib/solar-data"
import type { RecoveryReport } from "@/lib/solar-data"
import {
  TrendingUp,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  User,
  Wrench,
  ArrowUpRight,
  Minus,
  BarChart3,
  IndianRupee,
} from "lucide-react"

function getDeviceName(id: string) {
  return devices.find((d) => d.id === id)?.name ?? id
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex gap-4 items-start">
      <div className={`rounded-lg p-2.5 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function useChartColors() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isLight = mounted && resolvedTheme === "light"
  return {
    grid: isLight ? "#e5e5e5" : "oklch(0.28 0.01 250)",
    tick: isLight ? "#737373" : "oklch(0.6 0.02 250)",
    tooltipBg: isLight ? "#ffffff" : "oklch(0.18 0.005 250)",
    tooltipBorder: isLight ? "#e5e5e5" : "oklch(0.28 0.01 250)",
    tooltipText: isLight ? "#171717" : "oklch(0.95 0.01 90)",
    before: isLight ? "#dc2626" : "oklch(0.58 0.22 27)",
    after: isLight ? "#16a34a" : "oklch(0.7 0.15 155)",
  }
}

function RecoveryCard({ report }: { report: RecoveryReport }) {
  const [expanded, setExpanded] = useState(false)
  const improved = report.status === "improved"
  const cc = useChartColors()

  const chartData = report.beforeData.map((d, i) => ({
    time: d.time,
    "Last 3 Days Avg": d.output,
    Today: report.afterData[i]?.output ?? 0,
  }))

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div
          className={`mt-0.5 rounded-lg p-2 ${
            improved
              ? "bg-success/15 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {improved ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {report.issueLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                improved
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {improved ? (
                <>
                  <ArrowUpRight className="h-2.5 w-2.5" />
                  Improved
                </>
              ) : (
                <>
                  <Minus className="h-2.5 w-2.5" />
                  No Significant Change
                </>
              )}
            </span>
            <Badge
              variant="secondary"
              className={`text-[10px] ${
                report.resolvedBy === "technician"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-success/15 text-success"
              }`}
            >
              {report.resolvedBy === "technician" ? (
                <>
                  <Wrench className="mr-0.5 h-2.5 w-2.5" /> Technician
                </>
              ) : (
                <>
                  <User className="mr-0.5 h-2.5 w-2.5" /> Self-fixed
                </>
              )}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getDeviceName(report.deviceId)} &middot; Resolved{" "}
            {new Date(report.resolvedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="mt-2 flex flex-wrap gap-4">
            {improved && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3" />
                +{report.percentageImprovement}%
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              {report.energyRecovered} kWh recovered
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <IndianRupee className="h-3 w-3 text-primary" />
              {report.estimatedSavings.toFixed(0)} saved
            </span>
          </div>
        </div>

        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-5">
          <div
            className={`rounded-lg border p-4 ${
              improved
                ? "border-success/30 bg-success/5"
                : "border-border bg-secondary/50"
            }`}
          >
            {improved ? (
              <>
                <p className="text-sm font-semibold text-success">
                  {"Cleaning improved output by "}
                  {report.percentageImprovement}%.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Recovered {report.energyRecovered} kWh today. Estimated
                  savings of{" "}
                  <span className="font-medium text-foreground">
                    {"Rs. "}{report.estimatedSavings.toFixed(0)}
                  </span>{" "}
                  at {"Rs. "}{report.pricePerKwh}/kWh.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-muted-foreground">
                  No significant change detected.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Output only improved by {report.percentageImprovement}%.
                  The issue may require further investigation.
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Improvement</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  improved ? "text-success" : "text-muted-foreground"
                }`}
              >
                {report.percentageImprovement}%
              </p>
              <Progress
                value={Math.min(report.percentageImprovement, 100)}
                className="mt-2 h-1.5"
              />
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Energy Recovered</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {report.energyRecovered}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  kWh
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Est. Savings</p>
              <p className="mt-1 text-lg font-bold text-primary">
                {"Rs. "}{report.estimatedSavings.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">System Status</p>
              <p
                className={`mt-1 text-sm font-bold ${
                  improved ? "text-success" : "text-muted-foreground"
                }`}
              >
                {improved ? "Improved" : "No Change"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Power Output Comparison
                </h4>
                <p className="text-xs text-muted-foreground">
                  Last 3 days average vs. today after resolution (kW)
                </p>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">
                  Last 3 Days Avg (Before)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">
                  Today (After Fix)
                </span>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={cc.grid} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: cc.tick }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: cc.tick }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: cc.tooltipBg,
                      border: `1px solid ${cc.tooltipBorder}`,
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: cc.tooltipText,
                    }}
                    formatter={(value: number) => [`${value} kW`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", color: cc.tick }} />
                  <Line
                    type="monotone"
                    dataKey="Last 3 Days Avg"
                    stroke={cc.before}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ r: 3, strokeWidth: 2 }}
                    name="Last 3 Days Avg"
                  />
                  <Line
                    type="monotone"
                    dataKey="Today"
                    stroke={cc.after}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2 }}
                    name="Today (After Fix)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecoveryPage() {
  const summary = getRecoverySummary()
  const [filter, setFilter] = useState<"all" | "improved" | "no_change">("all")

  const filtered = recoveryReports.filter((r) => {
    if (filter === "all") return true
    return r.status === (filter === "improved" ? "improved" : "no_change")
  })

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl text-balance">
            Performance Recovery Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track how resolved issues impact power output with before vs. after
            comparisons
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            label="Avg Improvement"
            value={`${Math.round(summary.avgImprovement)}%`}
            sub={`${summary.improvedCount} of ${summary.total} resolved with improvement`}
            accent="bg-success/15"
          />
          <SummaryCard
            icon={<Zap className="h-5 w-5 text-primary" />}
            label="Total Energy Recovered"
            value={`${summary.totalRecovered.toFixed(1)} kWh`}
            sub="Across all resolved issues"
            accent="bg-primary/15"
          />
          <SummaryCard
            icon={<IndianRupee className="h-5 w-5 text-primary" />}
            label="Estimated Savings"
            value={`Rs. ${summary.totalSavings.toFixed(0)}`}
            sub="At current rate of Rs. 8/kWh"
            accent="bg-primary/15"
          />
          <SummaryCard
            icon={<BarChart3 className="h-5 w-5 text-chart-2" />}
            label="Issues Resolved"
            value={`${summary.total}`}
            sub={`${summary.improvedCount} improved, ${summary.total - summary.improvedCount} no change`}
            accent="bg-chart-2/15"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              { key: "all", label: "All Reports" },
              { key: "improved", label: "Improved" },
              { key: "no_change", label: "No Change" },
            ] as const
          ).map((t) => (
            <Button
              key={t.key}
              variant={filter === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t.key)}
              className={
                filter === t.key
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }
            >
              {t.label}
              <Badge
                variant="secondary"
                className="ml-1.5 bg-secondary text-secondary-foreground"
              >
                {t.key === "all"
                  ? recoveryReports.length
                  : recoveryReports.filter((r) =>
                      t.key === "improved"
                        ? r.status === "improved"
                        : r.status === "no_change"
                    ).length}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No reports match this filter
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try selecting a different filter
              </p>
            </div>
          ) : (
            filtered.map((report) => (
              <RecoveryCard key={report.id} report={report} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}

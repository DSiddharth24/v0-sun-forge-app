"use client"

import { Zap, Sun, Gauge, AlertTriangle } from "lucide-react"
import { getSystemStats } from "@/lib/solar-data"

interface StatCardProps {
  label: string
  value: string
  unit: string
  icon: React.ReactNode
  trend?: string
  accent?: string
}

function StatCard({ label, value, unit, icon, trend, accent = "text-primary" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={accent}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {trend && (
        <p className="mt-2 text-xs text-muted-foreground">{trend}</p>
      )}
    </div>
  )
}

export function StatCards() {
  const stats = getSystemStats()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Output"
        value={stats.totalOutput}
        unit="kW"
        icon={<Zap className="h-5 w-5" />}
        trend={`of ${stats.totalCapacity} kW capacity`}
        accent="text-primary"
      />
      <StatCard
        label="Active Devices"
        value={`${stats.onlineDevices}/${stats.totalDevices}`}
        unit="online"
        icon={<Sun className="h-5 w-5" />}
        trend={`${stats.warningDevices} warning, ${stats.offlineDevices} offline`}
        accent="text-success"
      />
      <StatCard
        label="Avg Efficiency"
        value={`${stats.avgEfficiency}`}
        unit="%"
        icon={<Gauge className="h-5 w-5" />}
        trend="Across all panels"
        accent="text-chart-2"
      />
      <StatCard
        label="Active Alerts"
        value={`${stats.unresolvedAlerts}`}
        unit="unresolved"
        icon={<AlertTriangle className="h-5 w-5" />}
        trend="Requires attention"
        accent="text-destructive"
      />
    </div>
  )
}

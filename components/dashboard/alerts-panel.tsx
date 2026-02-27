"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Droplets,
  Bird,
  Wrench,
  Zap,
  Cable,
  Battery,
  Thermometer,
  CloudLightning,
  Wifi,
  HardHat,
  Hammer,
  ToggleLeft,
  BatteryCharging,
  CloudSun,
  Monitor,
  TrendingDown,
  ArrowRight,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllAlerts, devices } from "@/lib/solar-data"
import type { Alert } from "@/lib/solar-data"

function getAlertIcon(type: Alert["type"]) {
  const icons: Record<string, React.ReactNode> = {
    dust: <Droplets className="h-4 w-4" />,
    bird_poop: <Bird className="h-4 w-4" />,
    malfunction: <Wrench className="h-4 w-4" />,
    low_power_input: <TrendingDown className="h-4 w-4" />,
    inverter_fault: <Zap className="h-4 w-4" />,
    loose_wiring: <Cable className="h-4 w-4" />,
    battery_problem: <Battery className="h-4 w-4" />,
    overheating: <Thermometer className="h-4 w-4" />,
    surge_damage: <CloudLightning className="h-4 w-4" />,
    monitoring_failure: <Wifi className="h-4 w-4" />,
    improper_installation: <HardHat className="h-4 w-4" />,
    panel_damage: <Hammer className="h-4 w-4" />,
    mcb_trip: <ToggleLeft className="h-4 w-4" />,
    battery_not_charging: <BatteryCharging className="h-4 w-4" />,
    temporary_shading: <CloudSun className="h-4 w-4" />,
    inverter_display_error: <Monitor className="h-4 w-4" />,
    minor_fluctuation: <TrendingDown className="h-4 w-4" />,
  }
  return icons[type] || <AlertTriangle className="h-4 w-4" />
}

function getSeverityStyle(severity: Alert["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-destructive/15 text-destructive border-destructive/30"
    case "high":
      return "bg-chart-4/15 text-chart-4 border-chart-4/30"
    case "medium":
      return "bg-warning/15 text-warning border-warning/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

function getDeviceName(deviceId: string) {
  return devices.find((d) => d.id === deviceId)?.name || deviceId
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function AlertsPanel() {
  const alerts = getAllAlerts().filter((a) => !a.resolved)
  const techCount = alerts.filter((a) => a.category === "technician").length
  const customerCount = alerts.filter((a) => a.category === "customer").length

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-destructive/15 text-destructive">
            {techCount} tech
          </Badge>
          <Badge variant="secondary" className="bg-success/15 text-success">
            {customerCount} DIY
          </Badge>
        </div>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex gap-3 rounded-lg border p-3 ${getSeverityStyle(alert.severity)}`}
          >
            <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold capitalize">
                  {alert.type.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] opacity-70">
                  {getDeviceName(alert.deviceId)}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium ${
                    alert.category === "technician"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-success/20 text-success"
                  }`}
                >
                  {alert.category === "technician" ? (
                    <><Wrench className="h-2 w-2" /> Technician</>
                  ) : (
                    <><User className="h-2 w-2" /> DIY</>
                  )}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
              <p className="text-[10px] opacity-60">
                {formatTimestamp(alert.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/issues">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border text-muted-foreground hover:text-foreground"
          >
            View All Issues & Solutions
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

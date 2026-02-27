"use client"

import { AlertTriangle, Droplets, Bird, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAllAlerts, devices } from "@/lib/solar-data"
import type { Alert } from "@/lib/solar-data"

function getAlertIcon(type: Alert["type"]) {
  switch (type) {
    case "dust":
      return <Droplets className="h-4 w-4" />
    case "bird_poop":
      return <Bird className="h-4 w-4" />
    case "malfunction":
      return <Wrench className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
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

export function AlertsPanel() {
  const alerts = getAllAlerts().filter((a) => !a.resolved)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          <p className="text-xs text-muted-foreground">Requires attention</p>
        </div>
        <Badge variant="secondary" className="bg-destructive/15 text-destructive">
          {alerts.length} active
        </Badge>
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
                  {alert.type.replace("_", " ")}
                </span>
                <span className="text-[10px] opacity-70">
                  {getDeviceName(alert.deviceId)}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
              <p className="text-[10px] opacity-60">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

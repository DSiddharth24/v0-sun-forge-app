"use client"

import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Thermometer,
  Zap,
  Gauge,
  CalendarDays,
  Droplets,
  Bird,
  Wrench,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { SolarDevice } from "@/lib/solar-data"

function StatusIndicator({ status }: { status: SolarDevice["status"] }) {
  const config = {
    online: { color: "bg-success", label: "Online", icon: Wifi },
    warning: { color: "bg-warning", label: "Warning", icon: AlertTriangle },
    offline: { color: "bg-destructive", label: "Offline", icon: WifiOff },
  }
  const c = config[status]
  const Icon = c.icon

  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${c.color} animate-pulse`} />
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
    </div>
  )
}

function AlertBadge({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    dust: <Droplets className="h-3 w-3" />,
    bird_poop: <Bird className="h-3 w-3" />,
    malfunction: <Wrench className="h-3 w-3" />,
    low_output: <Zap className="h-3 w-3" />,
    shade: <AlertTriangle className="h-3 w-3" />,
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-warning/15 text-warning text-[10px]">
      {icons[type] || <AlertTriangle className="h-3 w-3" />}
      {type.replace("_", " ")}
    </Badge>
  )
}

export function DeviceCard({ device }: { device: SolarDevice }) {
  const efficiencyColor =
    device.efficiency >= 80
      ? "text-success"
      : device.efficiency >= 50
        ? "text-warning"
        : "text-destructive"

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{device.name}</h3>
          <p className="text-xs text-muted-foreground">{device.location}</p>
        </div>
        <StatusIndicator status={device.status} />
      </div>

      {device.alerts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {device.alerts.map((alert) => (
            <AlertBadge key={alert.id} type={alert.type} />
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Power Output</span>
            <span className="font-medium text-foreground">
              {device.voltage !== undefined && <span className="text-[10px] mr-2 opacity-50">{device.voltage}V {device.current}A</span>}
              {device.powerOutput} / {device.maxOutput} {device.maxOutput < 100 ? 'W' : 'kW'}
            </span>
          </div>
          <Progress
            value={(device.powerOutput / device.maxOutput) * 100}
            className="mt-1.5 h-1.5 bg-secondary"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Gauge className={`h-4 w-4 ${efficiencyColor}`} />
            <span className="mt-1 text-xs font-bold text-foreground">{device.efficiency}%</span>
            <span className="text-[10px] text-muted-foreground">Efficiency</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <Thermometer className="h-4 w-4 text-chart-4" />
            <span className="mt-1 text-xs font-bold text-foreground">{device.temperature}°C</span>
            <span className="text-[10px] text-muted-foreground">Temp</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary/50 p-2">
            <CalendarDays className="h-4 w-4 text-chart-3" />
            <span className="mt-1 text-xs font-bold text-foreground">
              {new Date(device.lastCleaned).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] text-muted-foreground">Cleaned</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[10px] text-muted-foreground">
          ID: {device.id}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Installed: {new Date(device.installDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  )
}

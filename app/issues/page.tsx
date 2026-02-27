"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { DiyGuide } from "@/components/issues/diy-guide"
import { PowerRecordings } from "@/components/issues/power-recordings"
import {
  getAllAlerts,
  devices,
  getProblemInfo,
  problemDatabase,
} from "@/lib/solar-data"
import type { Alert, ProblemInfo } from "@/lib/solar-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Wrench,
  User,
  ChevronDown,
  ChevronUp,
  Phone,
  Zap,
  Flame,
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
  Droplets,
  Bird,
} from "lucide-react"

function getAlertIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
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
    dust: <Droplets className="h-4 w-4" />,
    bird_poop: <Bird className="h-4 w-4" />,
    malfunction: <Wrench className="h-4 w-4" />,
  }
  return icons[type] || <AlertTriangle className="h-4 w-4" />
}

function getSeverityStyle(severity: string) {
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

function IssueCard({
  alert,
  problemInfo,
}: {
  alert: Alert
  problemInfo: ProblemInfo | undefined
}) {
  const [expanded, setExpanded] = useState(false)
  const info = problemInfo || getProblemInfo(alert.type)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`mt-0.5 rounded-lg p-2 ${getSeverityStyle(alert.severity)}`}>
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {info?.label || alert.type.replace(/_/g, " ")}
            </span>
            <Badge
              variant="secondary"
              className={`text-[10px] ${alert.category === "technician" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}
            >
              {alert.category === "technician" ? (
                <><Wrench className="mr-1 h-2.5 w-2.5" />Technician Required</>
              ) : (
                <><User className="mr-1 h-2.5 w-2.5" />Customer Fixable</>
              )}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getDeviceName(alert.deviceId)} &middot;{" "}
            {new Date(alert.timestamp).toLocaleString()}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {alert.message}
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Problem description */}
          {info && (
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-xs font-semibold text-foreground mb-1">Problem Description</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {info.description}
              </p>
            </div>
          )}

          {/* Power recordings */}
          <PowerRecordings alertId={alert.id} />

          {/* DIY Guide for customer-fixable issues */}
          {info?.category === "customer" && info.diyGuide && (
            <DiyGuide problem={info} />
          )}

          {/* Technician callout for tech-required issues */}
          {alert.category === "technician" && (
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <Phone className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-destructive">
                    Professional Service Required
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    This issue requires a certified solar technician. Do not attempt to repair
                    this yourself as it may involve high-voltage components or structural elements.
                  </p>
                </div>
                <Link href="/technicians">
                  <Button
                    size="sm"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    Find Nearby Technicians
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProblemCatalogCard({ problem }: { problem: ProblemInfo }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className={`rounded-lg p-2 ${getSeverityStyle(problem.severity)}`}>
          {getAlertIcon(problem.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{problem.label}</span>
            <Badge
              variant="secondary"
              className={`text-[10px] ${problem.category === "technician" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}
            >
              {problem.category === "technician" ? "Technician" : "DIY"}
            </Badge>
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {problem.description}
          </p>
          {problem.diyGuide && <DiyGuide problem={problem} />}
          {problem.category === "technician" && (
            <Link href="/technicians">
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                Contact Technician
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function IssuesPage() {
  const [tab, setTab] = useState<"active" | "catalog">("active")
  const alerts = getAllAlerts().filter((a) => !a.resolved)
  const techAlerts = alerts.filter((a) => a.category === "technician")
  const customerAlerts = alerts.filter((a) => a.category === "customer")

  const techProblems = problemDatabase.filter((p) => p.category === "technician")
  const customerProblems = problemDatabase.filter((p) => p.category === "customer")

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Issues & Diagnostics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View active problems, find solutions, and connect with technicians
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("active")}
            className={
              tab === "active"
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }
          >
            Active Issues
            <Badge variant="secondary" className="ml-1.5 bg-secondary text-secondary-foreground">
              {alerts.length}
            </Badge>
          </Button>
          <Button
            variant={tab === "catalog" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("catalog")}
            className={
              tab === "catalog"
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }
          >
            Problem Guide
          </Button>
        </div>

        {tab === "active" ? (
          <div className="space-y-8">
            {/* Technician-required issues */}
            {techAlerts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/15">
                    <Wrench className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      Technician Required
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      These issues need a certified professional
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-destructive/15 text-destructive"
                  >
                    {techAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {techAlerts.map((alert) => (
                    <IssueCard
                      key={alert.id}
                      alert={alert}
                      problemInfo={getProblemInfo(alert.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Customer-solvable issues */}
            {customerAlerts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                    <User className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      Customer Fixable
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Follow the guides below to resolve these yourself
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-success/15 text-success"
                  >
                    {customerAlerts.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {customerAlerts.map((alert) => (
                    <IssueCard
                      key={alert.id}
                      alert={alert}
                      problemInfo={getProblemInfo(alert.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {alerts.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Zap className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  No active issues
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  All systems are running smoothly
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Technician problems catalog */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/15">
                  <Wrench className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Problems Requiring a Technician
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Do not attempt to fix these yourself
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {techProblems.map((p) => (
                  <ProblemCatalogCard key={p.type} problem={p} />
                ))}
              </div>
            </div>

            {/* Customer-solvable problems catalog */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/15">
                  <User className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Problems You Can Fix
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Step-by-step guides for common issues
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {customerProblems.map((p) => (
                  <ProblemCatalogCard key={p.type} problem={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

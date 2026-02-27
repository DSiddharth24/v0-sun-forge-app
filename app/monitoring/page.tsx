"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Wifi,
  WifiOff,
  Zap,
  Gauge,
  Thermometer,
  Moon,
  Sun,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Signal,
  BatteryCharging,
  Power,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react"

// ─── Simulated INA219 Sensor ────────────────────────────────────────
// Simulates the microcontroller sending V & A every 10 seconds

interface SensorReading {
  timestamp: Date
  voltage: number
  current: number
  power: number
}

interface DowntimeLog {
  start: Date
  end: Date | null
  duration: string
}

function getSimulatedSunIntensity(): number {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60
  // Sine curve peaking at 12:00 noon, 0 before 6 and after 18
  if (hour < 6 || hour > 18) return 0
  return Math.sin(((hour - 6) / 12) * Math.PI)
}

function generateReading(nightMode: boolean): SensorReading {
  const sun = getSimulatedSunIntensity()
  const now = new Date()
  let voltage: number
  let current: number

  if (nightMode || sun < 0.02) {
    voltage = Math.random() * 0.5
    current = Math.random() * 0.03
  } else {
    const noise = 0.9 + Math.random() * 0.2
    voltage = sun * 36 * noise + Math.random() * 2
    current = sun * 9.5 * noise + Math.random() * 0.5
  }

  return {
    timestamp: now,
    voltage: parseFloat(voltage.toFixed(2)),
    current: parseFloat(current.toFixed(2)),
    power: parseFloat((voltage * current).toFixed(2)),
  }
}

// ─── Chart Colors Hook ──────────────────────────────────────────────

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
    primary: isLight ? "#d97706" : "oklch(0.75 0.16 65)",
    success: isLight ? "#16a34a" : "oklch(0.7 0.15 155)",
    blue: isLight ? "#2563eb" : "oklch(0.55 0.15 250)",
    warning: isLight ? "#ca8a04" : "oklch(0.8 0.15 80)",
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function getPerformanceGrade(eff: number): { grade: string; color: string; bg: string } {
  if (eff >= 90) return { grade: "A", color: "text-success", bg: "bg-success/15" }
  if (eff >= 75) return { grade: "B", color: "text-chart-2", bg: "bg-chart-2/15" }
  if (eff >= 60) return { grade: "C", color: "text-warning", bg: "bg-warning/15" }
  return { grade: "D", color: "text-destructive", bg: "bg-destructive/15" }
}

function getHealthScore(eff: number, isOnline: boolean, isNight: boolean): number {
  if (isNight) return 85 // Stable score at night
  if (!isOnline) return 0
  return Math.min(100, Math.max(0, Math.round(eff * 1.05)))
}

function getInsightMessage(eff: number, isNight: boolean, isOnline: boolean): string {
  if (!isOnline) return "Device offline. Check WiFi connection or microcontroller power supply."
  if (isNight) return "Night Mode active. No solar production expected. System is healthy."
  if (eff >= 90) return "System operating normally. Excellent performance."
  if (eff >= 75) return "System performing well. Minor efficiency losses detected."
  if (eff >= 60) return "Performance below expected -- possible dust, shading, or load issue."
  return "Significant performance degradation detected. Inspect panels or call a technician."
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

// ─── Section Components ─────────────────────────────────────────────

function StatusDot({ status }: { status: "online" | "weak" | "offline" }) {
  const styles = {
    online: "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    weak: "bg-warning shadow-[0_0_8px_rgba(234,179,8,0.5)]",
    offline: "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  }
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${styles[status]} animate-pulse`} />
  )
}

function MetricCard({ label, value, unit, icon, accent = "text-primary" }: {
  label: string; value: string; unit?: string; icon: React.ReactNode; accent?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={accent}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────

const RATED_CAPACITY = 330 // Watts (rated panel capacity)
const TICK_INTERVAL = 3000 // 3s simulation speed (represents 10s real)
const OFFLINE_THRESHOLD = 9000 // 9s = 30s real at 3x speed
const NIGHT_CHECK_TICKS = 4 // ~12s simulation = 10 min real

export default function MonitoringPage() {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [efficiencyHistory, setEfficiencyHistory] = useState<{ time: string; efficiency: number }[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"online" | "weak" | "offline">("online")
  const [lastReceived, setLastReceived] = useState<Date | null>(null)
  const [nightMode, setNightMode] = useState(false)
  const [nightEnteredAt, setNightEnteredAt] = useState<Date | null>(null)
  const [lastSolarActivity, setLastSolarActivity] = useState<Date | null>(null)
  const [totalEnergyToday, setTotalEnergyToday] = useState(0)
  const [solarActiveHours, setSolarActiveHours] = useState(0)
  const [peakPowerToday, setPeakPowerToday] = useState(0)
  const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>([])
  const [simulatePaused, setSimulatePaused] = useState(false)
  const [lowVoltTicks, setLowVoltTicks] = useState(0)
  const [liveEspData, setLiveEspData] = useState<any>(null)

  useEffect(() => {
    const fetchEspData = async () => {
      try {
        const res = await fetch('/api/devices/ESP32-001/readings')
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) setLiveEspData(data[0])
        }
      } catch (e) {}
    }
    fetchEspData()
    const interval = setInterval(fetchEspData, 5000)
    return () => clearInterval(interval)
  }, [])

  const downtimeStartRef = useRef<Date | null>(null)
  const cc = useChartColors()

  const latest = readings[readings.length - 1]
  const currentPower = latest?.power ?? 0
  const currentVoltage = latest?.voltage ?? 0
  const currentCurrent = latest?.current ?? 0

  // Expected power based on sun position and rated capacity
  const sunIntensity = getSimulatedSunIntensity()
  const expectedPower = RATED_CAPACITY * sunIntensity
  const efficiency = expectedPower > 5 ? Math.min(100, Math.round((currentPower / expectedPower) * 100)) : nightMode ? 0 : 0
  const grade = getPerformanceGrade(efficiency)
  const healthScore = getHealthScore(efficiency, connectionStatus !== "offline", nightMode)
  const insightMsg = getInsightMessage(efficiency, nightMode, connectionStatus !== "offline")

  // Tick handler
  const tick = useCallback(() => {
    if (simulatePaused) {
      // Simulate offline
      const now = new Date()
      if (!downtimeStartRef.current) downtimeStartRef.current = now
      const elapsed = now.getTime() - (lastReceived?.getTime() ?? now.getTime())
      if (elapsed > OFFLINE_THRESHOLD) {
        setConnectionStatus("offline")
      } else if (elapsed > OFFLINE_THRESHOLD / 2) {
        setConnectionStatus("weak")
      }
      return
    }

    // Restore from offline
    if (downtimeStartRef.current) {
      const end = new Date()
      setDowntimeLogs((prev) => [
        ...prev,
        { start: downtimeStartRef.current!, end, duration: formatDuration(end.getTime() - downtimeStartRef.current!.getTime()) },
      ])
      downtimeStartRef.current = null
    }
    setConnectionStatus("online")

    const reading = generateReading(nightMode)
    setLastReceived(reading.timestamp)

    setReadings((prev) => {
      const next = [...prev, reading].slice(-60)
      return next
    })

    // Energy accumulation (Wh increments based on tick interval)
    const energyIncrement = (reading.power * (TICK_INTERVAL / 1000)) / 3600
    setTotalEnergyToday((prev) => parseFloat((prev + energyIncrement).toFixed(3)))

    if (reading.power > 5) {
      setLastSolarActivity(reading.timestamp)
      setSolarActiveHours((prev) => parseFloat((prev + TICK_INTERVAL / 3600000).toFixed(2)))
    }

    if (reading.power > peakPowerToday) {
      setPeakPowerToday(reading.power)
    }

    // Efficiency history
    const timeLabel = reading.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    const eff = expectedPower > 5 ? Math.min(100, Math.round((reading.power / expectedPower) * 100)) : 0
    setEfficiencyHistory((prev) => [...prev, { time: timeLabel, efficiency: eff }].slice(-30))

    // Night mode detection
    if (reading.voltage < 1 && reading.current < 0.05) {
      setLowVoltTicks((prev) => {
        const next = prev + 1
        if (next >= NIGHT_CHECK_TICKS && !nightMode) {
          setNightMode(true)
          setNightEnteredAt(new Date())
        }
        return next
      })
    } else {
      setLowVoltTicks(0)
      if (nightMode && reading.voltage > 2 && reading.current > 0.1) {
        setNightMode(false)
        setNightEnteredAt(null)
      }
    }
  }, [simulatePaused, nightMode, lastReceived, expectedPower, peakPowerToday])

  useEffect(() => {
    const id = setInterval(tick, TICK_INTERVAL)
    return () => clearInterval(id)
  }, [tick])

  // Chart data from readings
  const liveChartData = readings.slice(-20).map((r) => ({
    time: r.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    voltage: r.voltage,
    current: r.current,
    power: r.power,
  }))

  const avgEfficiency = efficiencyHistory.length > 0
    ? Math.round(efficiencyHistory.reduce((a, e) => a + e.efficiency, 0) / efficiencyHistory.length)
    : 0

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl text-balance">
              Intelligent Solar Monitoring Engine
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time INA219 sensor data with connectivity, efficiency, and night mode intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={simulatePaused ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSimulatePaused((p) => !p)}
              className={simulatePaused ? "" : "border-border text-muted-foreground hover:text-foreground"}
            >
              {simulatePaused ? (
                <><WifiOff className="mr-1.5 h-3.5 w-3.5" /> Disconnected</>
              ) : (
                <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Live</>
              )}
            </Button>
            {nightMode && (
              <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 gap-1">
                <Moon className="h-3 w-3" /> Night Mode
              </Badge>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1: Device Connectivity Monitor                     */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Device Connectivity Monitor</h2>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <StatusDot status={connectionStatus} />
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    Device {connectionStatus === "online" ? "Online" : connectionStatus === "weak" ? "Weak Signal" : "Offline"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lastReceived
                      ? `Last received: ${lastReceived.toLocaleTimeString()}`
                      : "Waiting for first data packet..."}
                  </p>
                </div>
              </div>

              {connectionStatus !== "online" && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 max-w-sm">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check WiFi connection or microcontroller power supply if offline persists.
                  </p>
                </div>
              )}

              {connectionStatus === "offline" && latest && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <p className="text-xs font-medium text-destructive">Last Recorded Values</p>
                  <div className="mt-1 flex gap-4">
                    <span className="text-xs text-muted-foreground">V: <span className="font-semibold text-foreground">{latest.voltage}V</span></span>
                    <span className="text-xs text-muted-foreground">I: <span className="font-semibold text-foreground">{latest.current}A</span></span>
                    <span className="text-xs text-muted-foreground">P: <span className="font-semibold text-foreground">{latest.power}W</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Connection legend */}
            <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /><span className="text-[11px] text-muted-foreground">Online</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /><span className="text-[11px] text-muted-foreground">Weak Signal</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /><span className="text-[11px] text-muted-foreground">Offline</span></div>
            </div>

            {/* Downtime logs */}
            {downtimeLogs.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Downtime History</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {downtimeLogs.slice(-5).reverse().map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{log.start.toLocaleTimeString()} - {log.end?.toLocaleTimeString() ?? "ongoing"}</span>
                      <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0">
                        {log.duration}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Live Sensor Readings */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Voltage" value={nightMode ? "--" : currentVoltage.toFixed(1)} unit="V" icon={<Zap className="h-4 w-4" />} />
          <MetricCard label="Current" value={nightMode ? "--" : currentCurrent.toFixed(2)} unit="A" icon={<Activity className="h-4 w-4" />} accent="text-chart-2" />
          <MetricCard label="Power" value={nightMode ? "--" : currentPower.toFixed(1)} unit="W" icon={<Power className="h-4 w-4" />} accent="text-success" />
          <MetricCard label="Energy Today" value={totalEnergyToday < 1000 ? totalEnergyToday.toFixed(1) : (totalEnergyToday / 1000).toFixed(2)} unit={totalEnergyToday < 1000 ? "Wh" : "kWh"} icon={<BatteryCharging className="h-4 w-4" />} accent="text-warning" />
        </div>

        {/* Live Power Chart */}
        {liveChartData.length > 2 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">Live Power Output</h3>
              <p className="text-xs text-muted-foreground">Real-time sensor readings (W)</p>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={cc.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={cc.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={cc.grid} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: cc.tick }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: cc.tick }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: cc.tooltipBg, border: `1px solid ${cc.tooltipBorder}`, borderRadius: "8px", fontSize: "12px", color: cc.tooltipText }} />
                  <Area type="monotone" dataKey="power" stroke={cc.primary} fill="url(#powerGrad)" strokeWidth={2} name="Power (W)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2: System Efficiency & Health Score                */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">System Efficiency & Health Score</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Efficiency gauge */}
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-muted-foreground mb-2">Real-Time Efficiency</p>
              <div className="relative flex items-center justify-center">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-secondary" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                    className={nightMode ? "stroke-indigo-400" : efficiency >= 75 ? "stroke-success" : efficiency >= 60 ? "stroke-warning" : "stroke-destructive"}
                    strokeDasharray={`${(nightMode ? 0 : efficiency) * 3.267} 326.7`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">{nightMode ? "--" : `${efficiency}%`}</span>
                  {!nightMode && <span className={`text-xs font-semibold ${grade.color}`}>Grade {grade.grade}</span>}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed max-w-xs">{insightMsg}</p>
            </div>

            {/* Health score + grade breakdown */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">System Health Score</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl font-bold text-foreground">{healthScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={healthScore} className="mt-2 h-2" />
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Performance Grades</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { grade: "A", range: "90-100%", color: "text-success", bg: "bg-success/10" },
                    { grade: "B", range: "75-89%", color: "text-chart-2", bg: "bg-chart-2/10" },
                    { grade: "C", range: "60-74%", color: "text-warning", bg: "bg-warning/10" },
                    { grade: "D", range: "< 60%", color: "text-destructive", bg: "bg-destructive/10" },
                  ].map((g) => (
                    <div key={g.grade} className={`rounded-lg ${g.bg} px-3 py-2 flex items-center gap-2 ${!nightMode && grade.grade === g.grade ? "ring-1 ring-primary/50" : ""}`}>
                      <span className={`text-lg font-bold ${g.color}`}>{g.grade}</span>
                      <span className="text-[11px] text-muted-foreground">{g.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick metrics */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Peak Power Today</p>
                  <p className="text-xl font-bold text-foreground mt-1">{peakPowerToday.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">W</span></p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Efficiency Today</p>
                  <p className="text-xl font-bold text-foreground mt-1">{avgEfficiency}%</p>
                </div>
                <BarChart3 className="h-5 w-5 text-chart-2" />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Solar Active Hours</p>
                  <p className="text-xl font-bold text-foreground mt-1">{solarActiveHours.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">hrs</span></p>
                </div>
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Expected Power Now</p>
                  <p className="text-xl font-bold text-foreground mt-1">{expectedPower.toFixed(0)} <span className="text-xs text-muted-foreground font-normal">W</span></p>
                </div>
                <Thermometer className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>

          {/* 24-hour Efficiency Trend */}
          {efficiencyHistory.length > 2 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">Efficiency Trend</h3>
                <p className="text-xs text-muted-foreground">Real-time tracking (%)</p>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyHistory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={cc.grid} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: cc.tick }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: cc.tick }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: cc.tooltipBg, border: `1px solid ${cc.tooltipBorder}`, borderRadius: "8px", fontSize: "12px", color: cc.tooltipText }} />
                    <Line type="monotone" dataKey="efficiency" stroke={cc.success} strokeWidth={2} dot={false} name="Efficiency (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 3: Smart Night Mode Detection                     */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-foreground">Smart Night Mode Detection</h2>
          </div>

          <div className={`rounded-xl border p-5 transition-colors ${nightMode ? "border-indigo-500/30 bg-indigo-500/5" : "border-border bg-card"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-3 ${nightMode ? "bg-indigo-500/15" : "bg-primary/10"}`}>
                  {nightMode ? <Moon className="h-6 w-6 text-indigo-400" /> : <Sun className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {nightMode ? "Night Mode Active" : "Daytime Monitoring Active"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nightMode
                      ? "No Solar Production -- Normal (Night Time). Fault alerts suppressed."
                      : "Monitoring solar production. Alerts are active."}
                  </p>
                </div>
              </div>

              {nightMode && (
                <Badge variant="secondary" className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-xs shrink-0">
                  Alerts Suppressed
                </Badge>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Status</p>
                <p className={`mt-1 text-sm font-bold ${nightMode ? "text-indigo-400" : "text-success"}`}>
                  {nightMode ? "Night" : "Day"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Last Solar Activity</p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {lastSolarActivity ? lastSolarActivity.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Energy Today</p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {totalEnergyToday < 1000 ? `${totalEnergyToday.toFixed(1)} Wh` : `${(totalEnergyToday / 1000).toFixed(2)} kWh`}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Active Hours</p>
                <p className="mt-1 text-sm font-bold text-foreground">{solarActiveHours.toFixed(1)} hrs</p>
              </div>
            </div>

            {/* Night mode thresholds */}
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Detection Thresholds</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                  <TrendingDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <div className="text-[11px]">
                    <span className="text-muted-foreground">Night Entry: </span>
                    <span className="text-foreground font-medium">{"V < 1V & I < 0.05A for 10 min"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="text-[11px]">
                    <span className="text-muted-foreground">Night Exit: </span>
                    <span className="text-foreground font-medium">{"V > 2V & I > 0.1A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {nightMode && nightEnteredAt && (
              <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400">
                <Clock className="h-3 w-3" />
                Night mode activated at {nightEnteredAt.toLocaleTimeString()}
              </div>
            )}
          </div>
        </section>

        {/* Live Hardware Telemetry (Supabase) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Live Hardware Telemetry (Supabase)</h2>
            </div>
            {liveEspData && (
               <Badge variant="outline" className="border-success text-success bg-success/10">ESP32 Connected</Badge>
            )}
          </div>
          
          <div className="rounded-xl border border-border bg-card p-5">
            {liveEspData ? (
               <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                 <div className="rounded-lg border border-border border-dashed bg-secondary/20 p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Voltage (INA219)</p>
                   <p className="text-xl font-bold text-foreground">{liveEspData.voltage} <span className="text-sm font-normal">V</span></p>
                 </div>
                 <div className="rounded-lg border border-border border-dashed bg-secondary/20 p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Current (Est.)</p>
                   <p className="text-xl font-bold text-foreground">{liveEspData.current_estimated} <span className="text-sm font-normal">A</span></p>
                 </div>
                 <div className="rounded-lg border border-border border-dashed bg-secondary/20 p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Power Output</p>
                   <p className="text-xl font-bold text-success">{liveEspData.power_watts} <span className="text-sm font-normal">W</span></p>
                 </div>
                 <div className="rounded-lg border border-border border-dashed bg-secondary/20 p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                   <p className="text-xl font-bold text-primary">{liveEspData.efficiency} <span className="text-sm font-normal">%</span></p>
                 </div>
               </div>
            ) : (
               <div className="text-center py-6">
                 <span className="inline-block h-2 w-2 rounded-full bg-warning animate-pulse mb-3" />
                 <p className="text-sm text-muted-foreground">Waiting for ESP32 hardware connection...</p>
                 <p className="text-xs mt-1 text-muted-foreground opacity-70">Send data to /api/iot-ingest to see it here</p>
               </div>
            )}
          </div>
        </section>

        {/* System Benefits */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">System Benefits</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Prevent false fault alerts at night",
              "Intelligent differentiation between faults and normal zero output",
              "Real-time connectivity awareness with downtime logging",
              "Performance-based efficiency monitoring with health scores",
              "Automatic night/day mode transitions",
              "Improved overall reliability and user confidence",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

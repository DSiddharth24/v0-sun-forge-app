"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { DeviceCard } from "@/components/devices/device-card"
import { devices, type SolarDevice } from "@/lib/solar-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DevicesPage() {
  const [filter, setFilter] = useState<"all" | "online" | "warning" | "offline">("all")
  const [search, setSearch] = useState("")
  const [allDevices, setAllDevices] = useState<SolarDevice[]>(devices)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupabaseDevices = async () => {
      try {
        const response = await fetch('/api/devices')
        if (response.ok) {
          const dbDevices = await response.json()
          const mappedDevices: SolarDevice[] = dbDevices.map((d: any) => ({
            id: d.device_id,
            name: d.name,
            location: d.location,
            status: d.status,
            powerOutput: d.latest_reading?.power_watts || 0,
            maxOutput: 50,
            efficiency: d.latest_reading?.efficiency || 0,
            temperature: 30,
            lastCleaned: new Date().toISOString(),
            installDate: d.created_at,
            alerts: [],
            voltage: d.latest_reading?.voltage,
            current: d.latest_reading?.current_estimated
          }))
          const liveDeviceIds = new Set(mappedDevices.map((d: any) => d.id))
          const filteredDummy = devices.filter((d: any) => !liveDeviceIds.has(d.id))
          setAllDevices([...filteredDummy, ...mappedDevices])
        }
      } catch (err) { }
      finally { setLoading(false) }
    }
    fetchSupabaseDevices()
    const interval = setInterval(fetchSupabaseDevices, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredDevices = allDevices.filter((d) => {
    const matchesFilter = filter === "all" || d.status === filter
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const onlineCount = allDevices.filter((d) => d.status === "online").length
  const warningCount = allDevices.filter((d) => d.status === "warning").length
  const offlineCount = allDevices.filter((d) => d.status === "offline").length

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Devices
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor your connected solar panels
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Connect Device
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Connect New Device</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add a new solar panel or inverter to your Sun Forge network.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Device Name</label>
                  <Input placeholder="e.g. Rooftop Array G" className="bg-secondary border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input placeholder="e.g. Building 4 - East Wing" className="bg-secondary border-border text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Device ID / Serial</label>
                  <Input placeholder="e.g. SF-007" className="bg-secondary border-border text-foreground" />
                </div>
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                  <Wifi className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ensure the device is powered on and within Wi-Fi range to pair.
                  </p>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Scan & Connect
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}
            >
              All
              <Badge variant="secondary" className="ml-1.5 bg-secondary text-secondary-foreground">{allDevices.length}</Badge>
            </Button>
            <Button
              variant={filter === "online" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("online")}
              className={filter === "online" ? "bg-success text-success-foreground" : "border-border text-muted-foreground hover:text-foreground"}
            >
              <Wifi className="mr-1 h-3 w-3" />
              Online
              <Badge variant="secondary" className="ml-1.5 bg-secondary text-secondary-foreground">{onlineCount}</Badge>
            </Button>
            <Button
              variant={filter === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("warning")}
              className={filter === "warning" ? "bg-warning text-warning-foreground" : "border-border text-muted-foreground hover:text-foreground"}
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Warning
              <Badge variant="secondary" className="ml-1.5 bg-secondary text-secondary-foreground">{warningCount}</Badge>
            </Button>
            <Button
              variant={filter === "offline" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("offline")}
              className={filter === "offline" ? "bg-destructive text-foreground" : "border-border text-muted-foreground hover:text-foreground"}
            >
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
              <Badge variant="secondary" className="ml-1.5 bg-secondary text-secondary-foreground">{offlineCount}</Badge>
            </Button>
          </div>
        </div>

        {/* Device Grid */}
        {filteredDevices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <WifiOff className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No devices found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

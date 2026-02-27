"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Cpu,
  Info,
  Bell,
  Sun,
  Menu,
  X,
  AlertTriangle,
  Droplets,
  Bird,
  ShieldAlert,
  Wrench as WrenchIcon,
  User,
  Thermometer,
  Zap,
  Cable,
  Battery,
  CloudLightning,
  Wifi,
  HardHat,
  Hammer,
  ToggleLeft,
  BatteryCharging,
  CloudSun,
  Monitor,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getAllAlerts } from "@/lib/solar-data"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/issues", label: "Issues", icon: ShieldAlert },
  { href: "/technicians", label: "Technicians", icon: WrenchIcon },
  { href: "/about", label: "About", icon: Info },
]

function AlertIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    dust: <Droplets className="h-4 w-4 text-warning" />,
    bird_poop: <Bird className="h-4 w-4 text-chart-4" />,
    low_power_input: <TrendingDown className="h-4 w-4 text-destructive" />,
    inverter_fault: <Zap className="h-4 w-4 text-destructive" />,
    loose_wiring: <Cable className="h-4 w-4 text-destructive" />,
    battery_problem: <Battery className="h-4 w-4 text-destructive" />,
    overheating: <Thermometer className="h-4 w-4 text-destructive" />,
    surge_damage: <CloudLightning className="h-4 w-4 text-destructive" />,
    monitoring_failure: <Wifi className="h-4 w-4 text-destructive" />,
    improper_installation: <HardHat className="h-4 w-4 text-destructive" />,
    panel_damage: <Hammer className="h-4 w-4 text-destructive" />,
    mcb_trip: <ToggleLeft className="h-4 w-4 text-warning" />,
    battery_not_charging: <BatteryCharging className="h-4 w-4 text-warning" />,
    temporary_shading: <CloudSun className="h-4 w-4 text-warning" />,
    inverter_display_error: <Monitor className="h-4 w-4 text-warning" />,
    minor_fluctuation: <TrendingDown className="h-4 w-4 text-warning" />,
  }
  return icons[type] || <AlertTriangle className="h-4 w-4 text-destructive" />
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning/20 text-warning",
    high: "bg-chart-4/20 text-chart-4",
    critical: "bg-destructive/20 text-destructive",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[severity] || variants.low
      )}
    >
      {severity}
    </span>
  )
}

function NotificationPanel() {
  const alerts = getAllAlerts()
  const unresolved = alerts.filter((a) => !a.resolved)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unresolved.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-foreground">
              {unresolved.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card border-border" align="end">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Alerts</h3>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {unresolved.length} active
          </Badge>
        </div>
        <ScrollArea className="max-h-80">
          {unresolved.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No active alerts
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unresolved.map((alert) => (
                <div key={alert.id} className="flex gap-3 px-4 py-3">
                  <div className="mt-0.5">
                    <AlertIcon type={alert.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium capitalize text-foreground">
                        {alert.type.replace(/_/g, " ")}
                      </span>
                      <SeverityBadge severity={alert.severity} />
                      {"category" in alert && (
                        <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          (alert as { category: string }).category === "technician"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-success/15 text-success"
                        }`}>
                          {(alert as { category: string }).category === "technician" ? (
                            <><WrenchIcon className="h-2.5 w-2.5" /> Tech</>
                          ) : (
                            <><User className="h-2.5 w-2.5" /> DIY</>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {alert.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Sun Forge
          </span>
        </div>
        <NavContent />
        <div className="mt-auto border-t border-border px-4 py-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-3">
            <p className="text-xs font-medium text-primary">System Status</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              All core systems operational. Last sync 2 min ago.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-card border-border p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex items-center gap-2.5 border-b border-border px-6 py-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Sun className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Sun Forge
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto text-muted-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <NavContent onLinkClick={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="md:hidden flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Sun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">Sun Forge</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

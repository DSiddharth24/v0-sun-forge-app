import { AppShell } from "@/components/app-shell"
import { StatCards } from "@/components/dashboard/stat-cards"
import { EnergyChart } from "@/components/dashboard/energy-chart"
import { WeeklyChart } from "@/components/dashboard/weekly-chart"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your decentralised solar system in real time
          </p>
        </div>

        <StatCards />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EnergyChart />
          <WeeklyChart />
        </div>

        <AlertsPanel />
      </div>
    </AppShell>
  )
}

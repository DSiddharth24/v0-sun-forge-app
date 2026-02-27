import { AppShell } from "@/components/app-shell"
import {
  Sun,
  Shield,
  Zap,
  Eye,
  Bell,
  Cpu,
  Droplets,
  Bird,
  Wrench,
  Globe,
} from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description:
      "Track energy production, consumption, and efficiency across all your solar installations in real time with comprehensive dashboards.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Receive instant alerts when dust, bird droppings, shade, or malfunctions are detected on your solar panels, preventing energy loss.",
  },
  {
    icon: Cpu,
    title: "Device Management",
    description:
      "Connect, configure, and manage all your solar devices from a single platform. Track health, temperature, and performance metrics.",
  },
  {
    icon: Shield,
    title: "Proactive Maintenance",
    description:
      "AI-powered diagnostics predict maintenance needs before failures occur, extending the lifespan of your solar investment.",
  },
  {
    icon: Zap,
    title: "Energy Optimisation",
    description:
      "Intelligent algorithms optimise energy distribution across your decentralised network, maximising output and reducing waste.",
  },
  {
    icon: Globe,
    title: "Decentralised Support",
    description:
      "Purpose-built for distributed solar installations. Manage panels across multiple buildings, locations, and configurations.",
  },
]

const alertTypes = [
  {
    icon: Droplets,
    title: "Dust Detection",
    description:
      "Sensors detect dust accumulation on panel surfaces. The system quantifies output reduction and recommends cleaning schedules based on local conditions.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Bird,
    title: "Bird Droppings Detection",
    description:
      "Computer vision and output pattern analysis identify localised shading from bird droppings. Alerts include affected panel sections and severity assessment.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
  {
    icon: Wrench,
    title: "Malfunction Alerts",
    description:
      "Continuous inverter and wiring diagnostics detect hardware failures, voltage anomalies, and connection issues. Technician dispatch is automated for critical events.",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
]

export default function AboutPage() {
  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-10">
        {/* Hero */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sun className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
                Sun Forge
              </h1>
              <p className="text-sm text-primary font-medium">
                Solar Panel Monitoring & Support
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Sun Forge is a digital service and support platform designed for decentralised solar
            systems. We provide real-time monitoring, intelligent alerts, and comprehensive
            device management to ensure your solar installations operate at peak efficiency.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Our mission is to bridge the gap between solar hardware and digital intelligence,
            giving operators full visibility and control over their distributed energy assets.
          </p>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-foreground">Platform Features</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to manage decentralised solar installations
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Types */}
        <div>
          <h2 className="text-lg font-bold text-foreground">Detection & Alert System</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated detection keeps your panels clean and operational
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {alertTypes.map((alert) => (
              <div
                key={alert.title}
                className={`rounded-xl border ${alert.border} ${alert.bg} p-5`}
              >
                <alert.icon className={`h-8 w-8 ${alert.color}`} />
                <h3 className={`mt-3 text-sm font-semibold ${alert.color}`}>{alert.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
          <h2 className="text-lg font-bold text-foreground">How It Works</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "Connect", desc: "Pair your solar devices and inverters to the Sun Forge network via Wi-Fi or cellular." },
              { step: "02", title: "Monitor", desc: "Real-time dashboards display energy output, efficiency, temperature, and device health." },
              { step: "03", title: "Detect", desc: "Sensors and AI analyse panel conditions to detect dust, bird droppings, and faults." },
              { step: "04", title: "Act", desc: "Receive alerts with actionable recommendations. Schedule cleaning or dispatch technicians." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-border pt-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            Sun Forge v1.0 &middot; Built for decentralised solar systems
          </p>
        </div>
      </div>
    </AppShell>
  )
}

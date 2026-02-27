export interface SolarDevice {
  id: string
  name: string
  location: string
  status: "online" | "warning" | "offline"
  powerOutput: number
  maxOutput: number
  efficiency: number
  lastCleaned: string
  alerts: Alert[]
  temperature: number
  installDate: string
}

export interface Alert {
  id: string
  deviceId: string
  type: "dust" | "bird_poop" | "shade" | "malfunction" | "low_output"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: string
  resolved: boolean
}

export interface EnergyData {
  time: string
  production: number
  consumption: number
}

export const devices: SolarDevice[] = [
  {
    id: "sf-001",
    name: "Rooftop Array A",
    location: "Building 1 - North Wing",
    status: "online",
    powerOutput: 4.8,
    maxOutput: 5.5,
    efficiency: 87,
    lastCleaned: "2026-02-20",
    temperature: 42,
    installDate: "2024-06-15",
    alerts: [],
  },
  {
    id: "sf-002",
    name: "Rooftop Array B",
    location: "Building 1 - South Wing",
    status: "warning",
    powerOutput: 3.1,
    maxOutput: 5.5,
    efficiency: 56,
    lastCleaned: "2026-01-15",
    temperature: 38,
    installDate: "2024-06-15",
    alerts: [
      {
        id: "a-001",
        deviceId: "sf-002",
        type: "dust",
        severity: "high",
        message: "Heavy dust accumulation detected. Output reduced by 44%. Cleaning recommended.",
        timestamp: "2026-02-27T08:30:00Z",
        resolved: false,
      },
    ],
  },
  {
    id: "sf-003",
    name: "Ground Mount C",
    location: "Parking Lot - East",
    status: "warning",
    powerOutput: 8.2,
    maxOutput: 12.0,
    efficiency: 68,
    lastCleaned: "2026-02-10",
    temperature: 45,
    installDate: "2024-09-01",
    alerts: [
      {
        id: "a-002",
        deviceId: "sf-003",
        type: "bird_poop",
        severity: "medium",
        message: "Bird droppings detected on 3 panels. Partial shading causing reduced output.",
        timestamp: "2026-02-27T06:15:00Z",
        resolved: false,
      },
    ],
  },
  {
    id: "sf-004",
    name: "Carport Array D",
    location: "Parking Structure B",
    status: "online",
    powerOutput: 6.7,
    maxOutput: 7.5,
    efficiency: 89,
    lastCleaned: "2026-02-25",
    temperature: 40,
    installDate: "2025-01-10",
    alerts: [],
  },
  {
    id: "sf-005",
    name: "Facade Panels E",
    location: "Building 2 - West Wall",
    status: "offline",
    powerOutput: 0,
    maxOutput: 3.0,
    efficiency: 0,
    lastCleaned: "2026-02-18",
    temperature: 22,
    installDate: "2025-03-20",
    alerts: [
      {
        id: "a-003",
        deviceId: "sf-005",
        type: "malfunction",
        severity: "critical",
        message: "Inverter malfunction detected. Device offline. Technician dispatch required.",
        timestamp: "2026-02-27T02:45:00Z",
        resolved: false,
      },
    ],
  },
  {
    id: "sf-006",
    name: "Rooftop Array F",
    location: "Building 3 - Main Roof",
    status: "warning",
    powerOutput: 9.4,
    maxOutput: 11.0,
    efficiency: 85,
    lastCleaned: "2026-02-22",
    temperature: 44,
    installDate: "2024-11-05",
    alerts: [
      {
        id: "a-004",
        deviceId: "sf-006",
        type: "dust",
        severity: "low",
        message: "Light dust detected on panel edges. Monitor for next 48 hours.",
        timestamp: "2026-02-27T10:00:00Z",
        resolved: false,
      },
    ],
  },
]

export const energyData: EnergyData[] = [
  { time: "06:00", production: 2.1, consumption: 4.5 },
  { time: "07:00", production: 5.8, consumption: 6.2 },
  { time: "08:00", production: 12.4, consumption: 8.1 },
  { time: "09:00", production: 18.6, consumption: 9.4 },
  { time: "10:00", production: 24.2, consumption: 10.8 },
  { time: "11:00", production: 28.5, consumption: 11.2 },
  { time: "12:00", production: 32.1, consumption: 12.5 },
  { time: "13:00", production: 30.8, consumption: 11.8 },
  { time: "14:00", production: 27.4, consumption: 10.6 },
  { time: "15:00", production: 22.1, consumption: 9.8 },
  { time: "16:00", production: 15.6, consumption: 8.4 },
  { time: "17:00", production: 8.2, consumption: 7.6 },
  { time: "18:00", production: 3.4, consumption: 6.8 },
]

export const weeklyData = [
  { day: "Mon", output: 142 },
  { day: "Tue", output: 158 },
  { day: "Wed", output: 135 },
  { day: "Thu", output: 167 },
  { day: "Fri", output: 148 },
  { day: "Sat", output: 172 },
  { day: "Sun", output: 155 },
]

export function getAllAlerts(): Alert[] {
  return devices.flatMap((d) => d.alerts).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getSystemStats() {
  const totalOutput = devices.reduce((acc, d) => acc + d.powerOutput, 0)
  const totalCapacity = devices.reduce((acc, d) => acc + d.maxOutput, 0)
  const avgEfficiency = devices.reduce((acc, d) => acc + d.efficiency, 0) / devices.length
  const onlineDevices = devices.filter((d) => d.status === "online").length
  const warningDevices = devices.filter((d) => d.status === "warning").length
  const offlineDevices = devices.filter((d) => d.status === "offline").length
  const unresolvedAlerts = getAllAlerts().filter((a) => !a.resolved).length

  return {
    totalOutput: totalOutput.toFixed(1),
    totalCapacity: totalCapacity.toFixed(1),
    avgEfficiency: Math.round(avgEfficiency),
    onlineDevices,
    warningDevices,
    offlineDevices,
    totalDevices: devices.length,
    unresolvedAlerts,
  }
}

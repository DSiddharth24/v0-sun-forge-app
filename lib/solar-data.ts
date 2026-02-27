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
  type: AlertType
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: string
  resolved: boolean
  category: "customer" | "technician"
}

export type AlertType =
  | "dust"
  | "bird_poop"
  | "shade"
  | "malfunction"
  | "low_output"
  | "low_power_input"
  | "inverter_fault"
  | "loose_wiring"
  | "battery_problem"
  | "overheating"
  | "surge_damage"
  | "monitoring_failure"
  | "improper_installation"
  | "panel_damage"
  | "mcb_trip"
  | "battery_not_charging"
  | "temporary_shading"
  | "inverter_display_error"
  | "minor_fluctuation"

export interface Technician {
  id: string
  name: string
  specialisation: string
  phone: string
  email: string
  location: string
  distance: string
  rating: number
  available: boolean
  photo: string
}

export interface PowerRecording {
  id: string
  deviceId: string
  alertId: string
  phase: "before" | "during" | "after"
  label: string
  data: { time: string; output: number }[]
  recordedAt: string
}

export interface ProblemInfo {
  type: AlertType
  label: string
  category: "customer" | "technician"
  description: string
  severity: "low" | "medium" | "high" | "critical"
  diyGuide?: {
    steps: string[]
    tools: string[]
    estimatedTime: string
    safetyNote: string
  }
}

export interface EnergyData {
  time: string
  production: number
  consumption: number
}

// Problem classification database
export const problemDatabase: ProblemInfo[] = [
  // Technician-only problems
  {
    type: "low_power_input",
    label: "Low Power Input",
    category: "technician",
    severity: "high",
    description: "The solar panels are generating significantly less power than expected despite clear conditions. This may indicate degraded cells, micro-cracks, or internal wiring issues that require professional testing equipment."
  },
  {
    type: "inverter_fault",
    label: "Inverter Fault",
    category: "technician",
    severity: "critical",
    description: "The inverter has reported a fault code or has stopped converting DC to AC power. Inverter repairs involve high-voltage components and must only be handled by certified technicians."
  },
  {
    type: "loose_wiring",
    label: "Loose or Damaged Wiring",
    category: "technician",
    severity: "critical",
    description: "Internal wiring connections have become loose or damaged, potentially causing arcing or fire hazards. Do NOT attempt to fix wiring yourself - contact a licensed solar technician immediately."
  },
  {
    type: "battery_problem",
    label: "Battery System Problem",
    category: "technician",
    severity: "high",
    description: "The battery storage system is showing abnormal charge/discharge patterns, swelling, or voltage irregularities. Battery issues can be dangerous and require certified handling."
  },
  {
    type: "overheating",
    label: "Overheating Components",
    category: "technician",
    severity: "critical",
    description: "Thermal sensors have detected temperatures exceeding safe operating limits in inverters, junction boxes, or wiring. Overheating can cause fires and equipment failure - requires immediate technician inspection."
  },
  {
    type: "surge_damage",
    label: "Surge & Lightning Damage",
    category: "technician",
    severity: "critical",
    description: "Lightning strike or power surge has potentially damaged system components. Surge protectors, inverters, and wiring must be inspected and tested by a qualified technician before the system is re-energised."
  },
  {
    type: "monitoring_failure",
    label: "Monitoring System Failure",
    category: "technician",
    severity: "high",
    description: "The monitoring hardware or communication module has stopped reporting data. This could indicate a firmware issue, hardware failure, or communication link problem requiring on-site diagnostics."
  },
  {
    type: "improper_installation",
    label: "Improper Installation Issue",
    category: "technician",
    severity: "high",
    description: "Panels, mounting structures, or electrical connections show signs of improper installation including incorrect tilt angles, inadequate weatherproofing, or non-compliant wiring. Professional re-installation required."
  },
  {
    type: "panel_damage",
    label: "Panel Physical Damage",
    category: "technician",
    severity: "critical",
    description: "Physical damage detected on solar panels including cracks, delamination, hot spots, or broken glass. Damaged panels can produce dangerous voltages and must be replaced by a technician."
  },
  // Customer-solvable problems
  {
    type: "mcb_trip",
    label: "Loose External Switch / MCB Trip",
    category: "customer",
    severity: "medium",
    description: "The miniature circuit breaker (MCB) or external disconnect switch has tripped, cutting power flow from your solar system. This is usually caused by a temporary overload and can be safely reset.",
    diyGuide: {
      steps: [
        "Locate the MCB / external disconnect switch near your inverter or distribution board.",
        "Check if the switch lever is in the OFF or TRIPPED (middle) position.",
        "Wait 30 seconds, then firmly push the lever to the ON position.",
        "Check your Sun Forge app to see if power generation resumes.",
        "If the MCB trips again within an hour, do NOT reset it again - contact a technician."
      ],
      tools: ["None required"],
      estimatedTime: "2-5 minutes",
      safetyNote: "Ensure your hands are dry. Do not repeatedly reset a tripping MCB as this may indicate a deeper electrical issue."
    }
  },
  {
    type: "battery_not_charging",
    label: "Battery Not Charging",
    category: "customer",
    severity: "medium",
    description: "The battery is not accepting charge from the solar panels. This may be caused by a tripped breaker, loose battery terminal connections, or the battery mode being set incorrectly.",
    diyGuide: {
      steps: [
        "Check the battery disconnect switch and ensure it is in the ON position.",
        "Verify the battery mode on your inverter display is set to 'Auto' or 'Charge'.",
        "Inspect the visible battery terminals for any obvious looseness (do NOT touch with bare hands).",
        "Power cycle the inverter: turn it OFF, wait 60 seconds, then turn it back ON.",
        "Monitor the Sun Forge app for 15 minutes to see if charging resumes.",
        "If still not charging after these steps, contact a technician."
      ],
      tools: ["None required"],
      estimatedTime: "5-10 minutes",
      safetyNote: "Never touch battery terminals with bare hands. If you notice any swelling, leaking, or unusual odour from the battery, do NOT touch it - evacuate and call a technician."
    }
  },
  {
    type: "temporary_shading",
    label: "Temporary Shading",
    category: "customer",
    severity: "low",
    description: "Output has dropped due to temporary shading from nearby objects, seasonal tree growth, or new constructions. Identifying and removing the shade source can restore full output.",
    diyGuide: {
      steps: [
        "Open the Sun Forge app and note which panels show reduced output.",
        "Physically inspect the affected panels from ground level.",
        "Identify the shade source: overhanging branches, new structures, temporary objects.",
        "If tree branches, trim them back to at least 2 metres from the panels.",
        "Remove any temporary objects (equipment, clotheslines, etc.) causing shadows.",
        "Monitor output in the app for the next 2 hours to confirm improvement."
      ],
      tools: ["Pruning shears (if tree branches)", "Ladder (if safe access needed)"],
      estimatedTime: "15-60 minutes",
      safetyNote: "Never climb onto the roof to inspect panels yourself. Only trim branches that are safely accessible from the ground or a stable ladder."
    }
  },
  {
    type: "inverter_display_error",
    label: "Inverter Display Error",
    category: "customer",
    severity: "low",
    description: "The inverter display is showing garbled text, is blank, or stuck on an error screen. This is usually a software glitch that can be fixed with a simple restart.",
    diyGuide: {
      steps: [
        "Note down any error code shown on the display (take a photo if possible).",
        "Locate the inverter's AC disconnect switch and turn it OFF.",
        "Locate the DC isolator switch (usually on the side) and turn it OFF.",
        "Wait 2 full minutes for all capacitors to discharge.",
        "Turn the DC isolator back ON first, then the AC disconnect.",
        "Wait for the inverter to boot up (1-3 minutes).",
        "If the error persists, note the error code and contact a technician."
      ],
      tools: ["Phone camera (to photograph error codes)"],
      estimatedTime: "5-10 minutes",
      safetyNote: "Always turn OFF AC before DC when shutting down, and turn ON DC before AC when starting up. Follow your inverter manual's sequence."
    }
  },
  {
    type: "minor_fluctuation",
    label: "Minor Power Fluctuation",
    category: "customer",
    severity: "low",
    description: "You are seeing small, intermittent drops in power output. This can be caused by passing clouds, dust build-up, or loose external connections that are safe to check.",
    diyGuide: {
      steps: [
        "Check the weather - passing clouds cause normal, temporary drops.",
        "Inspect panels visually for any new dust accumulation or debris.",
        "Check that all external switches and breakers are firmly in the ON position.",
        "Ensure no new objects are casting intermittent shadows on panels.",
        "Review the power recording graphs in Sun Forge to see if the pattern is weather-related.",
        "If fluctuations persist in clear weather, schedule a technician visit."
      ],
      tools: ["None required"],
      estimatedTime: "5-15 minutes",
      safetyNote: "Do not open any electrical enclosures. Only inspect externally visible components."
    }
  },
  {
    type: "dust",
    label: "Dust & Dirt on Panels",
    category: "customer",
    severity: "medium",
    description: "Dust and dirt accumulation is reducing the panels' ability to absorb sunlight, lowering energy output. Regular cleaning can restore performance.",
    diyGuide: {
      steps: [
        "Choose early morning or late evening when panels are cool.",
        "Use a garden hose to gently spray water across the panels from ground level.",
        "For stubborn grime, use a soft brush on an extension pole with soapy water (mild dish soap).",
        "Rinse thoroughly with clean water to avoid soap residue.",
        "Never use abrasive materials, pressure washers, or harsh chemicals.",
        "Check the Sun Forge app the next day to confirm improved output."
      ],
      tools: ["Garden hose with spray nozzle", "Soft brush on extension pole", "Mild dish soap", "Bucket of clean water"],
      estimatedTime: "20-40 minutes",
      safetyNote: "Never walk on solar panels. Never clean panels when they are hot (midday) as cold water on hot glass can cause thermal shock and cracking."
    }
  },
  {
    type: "bird_poop",
    label: "Bird Droppings on Panels",
    category: "customer",
    severity: "medium",
    description: "Bird droppings create hot spots and localized shading on panels, significantly reducing output from affected cells. Prompt cleaning prevents long-term damage.",
    diyGuide: {
      steps: [
        "Identify affected panels using the Sun Forge app's panel-level output data.",
        "Wait until panels are cool (early morning is best).",
        "Soak the droppings with warm water from a hose or spray bottle for 5 minutes to soften.",
        "Gently wipe away with a soft cloth or sponge on an extension pole.",
        "Rinse the area thoroughly with clean water.",
        "Consider installing bird deterrent spikes or wire mesh to prevent recurrence.",
        "Monitor output in the app to confirm improvement."
      ],
      tools: ["Garden hose or spray bottle", "Soft cloth or sponge on extension pole", "Warm water", "Bird deterrent spikes (optional, for prevention)"],
      estimatedTime: "15-30 minutes",
      safetyNote: "Bird droppings can carry disease. Wear gloves and wash hands thoroughly after cleaning. Never lean on or apply pressure to panels."
    }
  }
]

export const technicians: Technician[] = [
  {
    id: "tech-001",
    name: "Rajesh Kumar",
    specialisation: "Inverter & Wiring",
    phone: "+91 98765 43210",
    email: "rajesh.solar@email.com",
    location: "Sector 14, Gurugram",
    distance: "2.3 km",
    rating: 4.8,
    available: true,
    photo: "RK"
  },
  {
    id: "tech-002",
    name: "Priya Sharma",
    specialisation: "Battery Systems & Storage",
    phone: "+91 98765 43211",
    email: "priya.solartec@email.com",
    location: "MG Road, Gurugram",
    distance: "3.1 km",
    rating: 4.9,
    available: true,
    photo: "PS"
  },
  {
    id: "tech-003",
    name: "Amit Verma",
    specialisation: "Panel Installation & Repair",
    phone: "+91 98765 43212",
    email: "amit.solarfix@email.com",
    location: "DLF Phase 3, Gurugram",
    distance: "4.5 km",
    rating: 4.7,
    available: false,
    photo: "AV"
  },
  {
    id: "tech-004",
    name: "Sunita Devi",
    specialisation: "Surge Protection & Lightning",
    phone: "+91 98765 43213",
    email: "sunita.elecpro@email.com",
    location: "Sohna Road, Gurugram",
    distance: "5.2 km",
    rating: 4.6,
    available: true,
    photo: "SD"
  },
  {
    id: "tech-005",
    name: "Vikram Singh",
    specialisation: "Monitoring Systems & IoT",
    phone: "+91 98765 43214",
    email: "vikram.techsolar@email.com",
    location: "Sector 22, Gurugram",
    distance: "3.8 km",
    rating: 4.5,
    available: true,
    photo: "VS"
  }
]

export const powerRecordings: PowerRecording[] = [
  {
    id: "rec-001",
    deviceId: "sf-002",
    alertId: "a-001",
    phase: "before",
    label: "Before Dust Accumulation",
    data: [
      { time: "06:00", output: 1.2 },
      { time: "08:00", output: 3.8 },
      { time: "10:00", output: 5.2 },
      { time: "12:00", output: 5.5 },
      { time: "14:00", output: 5.1 },
      { time: "16:00", output: 3.4 },
      { time: "18:00", output: 1.0 },
    ],
    recordedAt: "2026-02-15T00:00:00Z"
  },
  {
    id: "rec-002",
    deviceId: "sf-002",
    alertId: "a-001",
    phase: "during",
    label: "During Problem (Current)",
    data: [
      { time: "06:00", output: 0.6 },
      { time: "08:00", output: 2.0 },
      { time: "10:00", output: 2.9 },
      { time: "12:00", output: 3.1 },
      { time: "14:00", output: 2.8 },
      { time: "16:00", output: 1.8 },
      { time: "18:00", output: 0.4 },
    ],
    recordedAt: "2026-02-27T00:00:00Z"
  },
  {
    id: "rec-003",
    deviceId: "sf-003",
    alertId: "a-002",
    phase: "before",
    label: "Before Bird Droppings",
    data: [
      { time: "06:00", output: 2.4 },
      { time: "08:00", output: 7.8 },
      { time: "10:00", output: 11.2 },
      { time: "12:00", output: 12.0 },
      { time: "14:00", output: 10.8 },
      { time: "16:00", output: 7.1 },
      { time: "18:00", output: 2.0 },
    ],
    recordedAt: "2026-02-20T00:00:00Z"
  },
  {
    id: "rec-004",
    deviceId: "sf-003",
    alertId: "a-002",
    phase: "during",
    label: "During Problem (Current)",
    data: [
      { time: "06:00", output: 1.6 },
      { time: "08:00", output: 5.2 },
      { time: "10:00", output: 7.8 },
      { time: "12:00", output: 8.2 },
      { time: "14:00", output: 7.4 },
      { time: "16:00", output: 4.8 },
      { time: "18:00", output: 1.2 },
    ],
    recordedAt: "2026-02-27T00:00:00Z"
  },
  {
    id: "rec-005",
    deviceId: "sf-005",
    alertId: "a-003",
    phase: "before",
    label: "Before Inverter Fault",
    data: [
      { time: "06:00", output: 0.6 },
      { time: "08:00", output: 1.8 },
      { time: "10:00", output: 2.7 },
      { time: "12:00", output: 3.0 },
      { time: "14:00", output: 2.6 },
      { time: "16:00", output: 1.5 },
      { time: "18:00", output: 0.3 },
    ],
    recordedAt: "2026-02-25T00:00:00Z"
  },
  {
    id: "rec-006",
    deviceId: "sf-005",
    alertId: "a-003",
    phase: "during",
    label: "During Problem (Current)",
    data: [
      { time: "06:00", output: 0 },
      { time: "08:00", output: 0 },
      { time: "10:00", output: 0 },
      { time: "12:00", output: 0 },
      { time: "14:00", output: 0 },
      { time: "16:00", output: 0 },
      { time: "18:00", output: 0 },
    ],
    recordedAt: "2026-02-27T00:00:00Z"
  },
  // Resolved example with all 3 phases
  {
    id: "rec-007",
    deviceId: "sf-004",
    alertId: "a-resolved-001",
    phase: "before",
    label: "Before MCB Trip",
    data: [
      { time: "06:00", output: 1.5 },
      { time: "08:00", output: 4.8 },
      { time: "10:00", output: 6.9 },
      { time: "12:00", output: 7.5 },
      { time: "14:00", output: 7.0 },
      { time: "16:00", output: 4.5 },
      { time: "18:00", output: 1.2 },
    ],
    recordedAt: "2026-02-22T00:00:00Z"
  },
  {
    id: "rec-008",
    deviceId: "sf-004",
    alertId: "a-resolved-001",
    phase: "during",
    label: "During MCB Trip",
    data: [
      { time: "06:00", output: 0 },
      { time: "08:00", output: 0 },
      { time: "10:00", output: 0 },
      { time: "12:00", output: 0 },
      { time: "14:00", output: 0 },
      { time: "16:00", output: 0 },
      { time: "18:00", output: 0 },
    ],
    recordedAt: "2026-02-23T00:00:00Z"
  },
  {
    id: "rec-009",
    deviceId: "sf-004",
    alertId: "a-resolved-001",
    phase: "after",
    label: "After Fix (Resolved)",
    data: [
      { time: "06:00", output: 1.4 },
      { time: "08:00", output: 4.6 },
      { time: "10:00", output: 6.8 },
      { time: "12:00", output: 7.4 },
      { time: "14:00", output: 6.9 },
      { time: "16:00", output: 4.4 },
      { time: "18:00", output: 1.1 },
    ],
    recordedAt: "2026-02-24T00:00:00Z"
  }
]

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
        category: "customer",
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
        category: "customer",
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
        type: "inverter_fault",
        severity: "critical",
        message: "Inverter malfunction detected. Device offline. Technician dispatch required.",
        timestamp: "2026-02-27T02:45:00Z",
        resolved: false,
        category: "technician",
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
        category: "customer",
      },
    ],
  },
  {
    id: "sf-007",
    name: "Ground Mount G",
    location: "Building 4 - East Garden",
    status: "warning",
    powerOutput: 2.1,
    maxOutput: 6.0,
    efficiency: 35,
    lastCleaned: "2026-02-24",
    temperature: 78,
    installDate: "2025-06-10",
    alerts: [
      {
        id: "a-005",
        deviceId: "sf-007",
        type: "overheating",
        severity: "critical",
        message: "Junction box temperature at 78\u00b0C - exceeds safe limit of 65\u00b0C. Immediate technician inspection required.",
        timestamp: "2026-02-27T11:20:00Z",
        resolved: false,
        category: "technician",
      },
    ],
  },
  {
    id: "sf-008",
    name: "Rooftop Array H",
    location: "Building 5 - Main Roof",
    status: "warning",
    powerOutput: 3.8,
    maxOutput: 5.0,
    efficiency: 76,
    lastCleaned: "2026-02-26",
    temperature: 41,
    installDate: "2025-02-18",
    alerts: [
      {
        id: "a-006",
        deviceId: "sf-008",
        type: "minor_fluctuation",
        severity: "low",
        message: "Intermittent power drops of 15-20% detected over the last 3 hours. Check external switches and shading.",
        timestamp: "2026-02-27T09:45:00Z",
        resolved: false,
        category: "customer",
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

export function getProblemInfo(type: AlertType): ProblemInfo | undefined {
  return problemDatabase.find((p) => p.type === type)
}

export function getRecordingsForAlert(alertId: string): PowerRecording[] {
  return powerRecordings.filter((r) => r.alertId === alertId).sort((a, b) => {
    const order = { before: 0, during: 1, after: 2 }
    return order[a.phase] - order[b.phase]
  })
}

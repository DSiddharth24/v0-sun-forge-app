"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Camera,
  Upload,
  ScanEye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCcw,
  Wrench,
  Droplets,
  Eye,
  Trash2,
  ShieldAlert,
  Sparkles,
  Info,
  Video,
  VideoOff,
  Download,
  Lightbulb,
  TrendingDown,
  Zap,
  FileWarning,
} from "lucide-react"

/* ── Types ── */
interface IssueRegion { x: number; y: number; width: number; height: number }

interface DetectedIssue {
  issueType: string
  severityLevel: string
  dustLevel: string | null
  recommendedAction: string
  confidenceScore: number
  description: string
  solution: string
  estimatedImpact: string
  region: IssueRegion
}

interface InspectionResult {
  overallCondition: string
  overallConfidence: number
  summary: string
  estimatedEfficiencyLoss: number
  maintenancePriority: string
  issues: DetectedIssue[]
}

/* ── Config maps ── */
const issueLabels: Record<string, string> = {
  dust_accumulation: "Dust Accumulation",
  glass_cracks: "Glass Cracks",
  bird_droppings: "Bird Droppings",
  shading: "Shading Area",
  physical_damage: "Physical Damage",
  discoloration: "Discoloration",
  hotspot: "Hotspot",
  delamination: "Delamination",
  moisture_ingress: "Moisture Ingress",
  wiring_visible: "Wiring Issue",
  corrosion: "Corrosion",
  snail_trail: "Snail Trail",
  no_issue: "No Issue Detected",
}

const actionLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  no_action: { label: "No Action", color: "bg-success/15 text-success", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  monitor: { label: "Monitor", color: "bg-chart-3/15 text-chart-3", icon: <Eye className="h-3.5 w-3.5" /> },
  clean: { label: "Clean Panel", color: "bg-warning/15 text-warning", icon: <Droplets className="h-3.5 w-3.5" /> },
  call_technician: { label: "Call Technician", color: "bg-destructive/15 text-destructive", icon: <Wrench className="h-3.5 w-3.5" /> },
}

const severityColors: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  none: { label: "None", color: "bg-muted text-muted-foreground" },
  low: { label: "Low Priority", color: "bg-success/15 text-success" },
  medium: { label: "Medium Priority", color: "bg-warning/15 text-warning" },
  high: { label: "High Priority", color: "bg-chart-4/15 text-chart-4" },
  urgent: { label: "Urgent", color: "bg-destructive/15 text-destructive" },
}

const conditionConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  good: { color: "text-success", bgColor: "bg-success/10 border-success/20", label: "Good Condition" },
  fair: { color: "text-chart-2", bgColor: "bg-chart-2/10 border-chart-2/20", label: "Fair Condition" },
  poor: { color: "text-warning", bgColor: "bg-warning/10 border-warning/20", label: "Poor Condition" },
  critical: { color: "text-destructive", bgColor: "bg-destructive/10 border-destructive/20", label: "Critical" },
}

const markerColors: Record<string, string> = {
  dust_accumulation: "rgba(234, 179, 8, 0.35)",
  glass_cracks: "rgba(239, 68, 68, 0.45)",
  bird_droppings: "rgba(249, 115, 22, 0.35)",
  shading: "rgba(99, 102, 241, 0.30)",
  physical_damage: "rgba(239, 68, 68, 0.45)",
  discoloration: "rgba(234, 179, 8, 0.30)",
  hotspot: "rgba(239, 68, 68, 0.50)",
  delamination: "rgba(249, 115, 22, 0.40)",
  moisture_ingress: "rgba(96, 165, 250, 0.35)",
  wiring_visible: "rgba(239, 68, 68, 0.40)",
  corrosion: "rgba(234, 179, 8, 0.40)",
  snail_trail: "rgba(168, 162, 158, 0.40)",
  no_issue: "transparent",
}

const markerBorders: Record<string, string> = {
  dust_accumulation: "rgba(234, 179, 8, 0.8)",
  glass_cracks: "rgba(239, 68, 68, 0.9)",
  bird_droppings: "rgba(249, 115, 22, 0.8)",
  shading: "rgba(99, 102, 241, 0.7)",
  physical_damage: "rgba(239, 68, 68, 0.9)",
  discoloration: "rgba(234, 179, 8, 0.7)",
  hotspot: "rgba(239, 68, 68, 1)",
  delamination: "rgba(249, 115, 22, 0.9)",
  moisture_ingress: "rgba(96, 165, 250, 0.8)",
  wiring_visible: "rgba(239, 68, 68, 0.8)",
  corrosion: "rgba(234, 179, 8, 0.8)",
  snail_trail: "rgba(168, 162, 158, 0.8)",
  no_issue: "transparent",
}

/* ── Sub-components ── */

function ImageWithOverlays({
  src, issues, highlightedIndex, onHover,
}: {
  src: string; issues: DetectedIssue[]; highlightedIndex: number | null; onHover: (i: number | null) => void
}) {
  const realIssues = issues.filter((i) => i.issueType !== "no_issue")
  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
      <img src={src} alt="Uploaded solar panel for AI inspection" className="w-full h-auto block" crossOrigin="anonymous" />
      {realIssues.map((issue, idx) => {
        const hl = highlightedIndex === idx
        return (
          <div
            key={idx}
            className="absolute cursor-pointer transition-all duration-200"
            style={{
              left: `${issue.region.x}%`, top: `${issue.region.y}%`,
              width: `${issue.region.width}%`, height: `${issue.region.height}%`,
              backgroundColor: markerColors[issue.issueType] || "rgba(239,68,68,0.35)",
              border: `2px solid ${markerBorders[issue.issueType] || "rgba(239,68,68,0.9)"}`,
              borderRadius: "4px",
              opacity: highlightedIndex === null || hl ? 1 : 0.3,
              transform: hl ? "scale(1.02)" : "scale(1)",
              zIndex: hl ? 10 : 1,
              boxShadow: hl ? `0 0 12px ${markerBorders[issue.issueType] || "rgba(239,68,68,0.6)"}` : "none",
            }}
            onMouseEnter={() => onHover(idx)}
            onMouseLeave={() => onHover(null)}
          >
            <div
              className="absolute -top-6 left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: markerBorders[issue.issueType] || "rgba(239,68,68,0.9)", color: "#fff" }}
            >
              {issueLabels[issue.issueType] || issue.issueType}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function IssueCard({
  issue, index, isHighlighted, onHover,
}: {
  issue: DetectedIssue; index: number; isHighlighted: boolean; onHover: (i: number | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const action = actionLabels[issue.recommendedAction] || actionLabels.monitor
  const isNoIssue = issue.issueType === "no_issue"

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isHighlighted ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card"
      }`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isNoIssue ? (
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {issueLabels[issue.issueType] || issue.issueType}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{issue.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-foreground">{issue.confidenceScore}%</div>
            <div className="text-[10px] text-muted-foreground">confidence</div>
          </div>
        </div>

        {/* Badges row */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${severityColors[issue.severityLevel] || severityColors.low}`}>
            {issue.severityLevel.charAt(0).toUpperCase() + issue.severityLevel.slice(1)} Severity
          </span>
          {issue.dustLevel && issue.dustLevel !== "none" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
              <Droplets className="h-3 w-3" />
              {issue.dustLevel.charAt(0).toUpperCase() + issue.dustLevel.slice(1)} Dust
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${action.color}`}>
            {action.icon} {action.label}
          </span>
          {!isNoIssue && (
            <span className="inline-flex items-center gap-1 rounded-md bg-chart-4/10 px-2 py-0.5 text-[11px] font-medium text-chart-4">
              <TrendingDown className="h-3 w-3" />
              {issue.estimatedImpact}
            </span>
          )}
        </div>
      </button>

      {/* Expanded: solution & impact */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">Solution & Recommendation</span>
            </div>
            <p className="text-xs leading-relaxed text-foreground">{issue.solution}</p>
          </div>
          {!isNoIssue && (
            <div className="rounded-lg bg-destructive/5 border border-destructive/15 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-4 w-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">Power Impact</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground">{issue.estimatedImpact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Camera viewfinder ── */

function CameraCapture({ onCapture, onClose }: { onCapture: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        })
        if (!active) { mediaStream.getTracks().forEach((t) => t.stop()); return }
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch {
        setCameraError("Camera access denied or unavailable. Please allow camera permission or use file upload instead.")
      }
    }
    startCamera()
    return () => {
      active = false
      stream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capture = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    // Use actual video dimensions for high quality capture
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    // Compress slightly to stay under size limits while keeping quality
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    stream?.getTracks().forEach((t) => t.stop())
    onCapture(dataUrl)
  }

  const handleClose = () => {
    stream?.getTracks().forEach((t) => t.stop())
    onClose()
  }

  return (
    <div className="space-y-3">
      {cameraError ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <VideoOff className="h-10 w-10 text-destructive" />
          <p className="text-sm text-foreground font-medium">Camera Unavailable</p>
          <p className="text-xs text-muted-foreground max-w-sm">{cameraError}</p>
          <Button variant="outline" onClick={handleClose} className="border-border text-foreground">
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="relative rounded-xl overflow-hidden border border-border bg-secondary">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto block min-h-[240px]"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-dashed border-primary/40 rounded-lg" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur rounded-md px-3 py-1">
                <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Live Camera - Position panel in frame
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={capture} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11">
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>
            <Button variant="outline" onClick={handleClose} className="border-border text-foreground hover:bg-secondary">
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Main page ── */

export default function InspectionPage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIssue, setHighlightedIssue] = useState<number | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeImage = useCallback((dataUrl: string, maxDim: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        if (img.width <= maxDim && img.height <= maxDim) { resolve(dataUrl); return }
        const scale = Math.min(maxDim / img.width, maxDim / img.height)
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext("2d")
        if (!ctx) { resolve(dataUrl); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG, etc.)"); return }
    if (file.size > 20 * 1024 * 1024) { setError("Image must be smaller than 20MB"); return }
    setError(null); setResult(null); setFileName(file.name); setShowCamera(false)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const raw = e.target?.result as string
      // Resize large images to keep under API limits
      const optimized = await resizeImage(raw, 2048)
      setImage(optimized)
    }
    reader.readAsDataURL(file)
  }, [resizeImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleCameraCapture = (dataUrl: string) => {
    setImage(dataUrl); setFileName("camera-capture.jpg"); setShowCamera(false)
    setError(null); setResult(null)
  }

  const handleAnalyze = async () => {
    if (!image) return
    setAnalyzing(true); setError(null); setResult(null); setAnalyzeProgress(0)

    // Animate progress
    const interval = setInterval(() => {
      setAnalyzeProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90 }
        return p + Math.random() * 8 + 2
      })
    }, 500)

    try {
      const res = await fetch("/api/inspect-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Analysis failed. Please try a different photo.")
      if (!data.result) throw new Error("No analysis results returned. Try uploading a clearer image of a solar panel.")
      clearInterval(interval); setAnalyzeProgress(100)
      await new Promise((r) => setTimeout(r, 300))
      setResult(data.result)
    } catch (err) {
      clearInterval(interval)
      const msg = err instanceof Error ? err.message : "Unknown error"
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Network error. Please check your internet connection and try again.")
      } else {
        setError(msg)
      }
    } finally {
      setAnalyzing(false); setAnalyzeProgress(0)
    }
  }

  const handleReset = () => {
    setImage(null); setFileName(""); setResult(null); setError(null)
    setHighlightedIssue(null); setShowCamera(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDownloadReport = () => {
    if (!result) return
    const lines = [
      "SUN FORGE - AI Visual Panel Inspection Report",
      "=".repeat(50),
      `Date: ${new Date().toISOString().split("T")[0]}`,
      `Overall Condition: ${conditionConfig[result.overallCondition]?.label || result.overallCondition}`,
      `Overall Confidence: ${result.overallConfidence}%`,
      `Estimated Efficiency Loss: ${result.estimatedEfficiencyLoss}%`,
      `Maintenance Priority: ${result.maintenancePriority}`,
      "",
      "SUMMARY:",
      result.summary,
      "",
      "DETECTED ISSUES:",
      "-".repeat(40),
    ]
    result.issues.forEach((issue, i) => {
      lines.push(
        `\n${i + 1}. ${issueLabels[issue.issueType] || issue.issueType}`,
        `   Severity: ${issue.severityLevel}`,
        `   Confidence: ${issue.confidenceScore}%`,
        `   Action: ${actionLabels[issue.recommendedAction]?.label || issue.recommendedAction}`,
        `   Impact: ${issue.estimatedImpact}`,
        `   Description: ${issue.description}`,
        `   Solution: ${issue.solution}`,
      )
    })
    lines.push("", "-".repeat(40), "AI diagnosis is based on image analysis. Confirm visually before taking action.")
    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "sun-forge-inspection-report.txt"; a.click()
    URL.revokeObjectURL(url)
  }

  const realIssues = result?.issues.filter((i) => i.issueType !== "no_issue") || []
  const condition = result ? conditionConfig[result.overallCondition] || conditionConfig.fair : null
  const priority = result ? priorityConfig[result.maintenancePriority] || priorityConfig.low : null

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <ScanEye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              AI Visual Panel Inspection
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload or capture a photo for instant AI-powered diagnostics with solutions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left: Upload / Camera / Image (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {!image && !showCamera ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/20"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">Upload or Capture Panel Photo</h3>
                <p className="mt-1 text-xs text-muted-foreground">Drag & drop, browse files, or use your device camera. JPG/PNG up to 20MB.</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => fileInputRef.current?.click()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Upload className="mr-2 h-4 w-4" /> Browse Files
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-secondary" onClick={() => setShowCamera(true)}>
                    <Video className="mr-2 h-4 w-4" /> Open Camera
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary"
                    onClick={() => {
                      const input = fileInputRef.current
                      if (input) { input.setAttribute("capture", "environment"); input.click(); input.removeAttribute("capture") }
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" /> Quick Snap
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
            ) : showCamera && !image ? (
              <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
            ) : image ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Camera className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{fileName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {result && (
                      <Button variant="ghost" size="sm" onClick={handleDownloadReport} className="text-muted-foreground hover:text-foreground">
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Report
                      </Button>
                    )}
                    {!analyzing && (
                      <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
                      </Button>
                    )}
                  </div>
                </div>

                {result ? (
                  <ImageWithOverlays src={image} issues={result.issues} highlightedIndex={highlightedIssue} onHover={setHighlightedIssue} />
                ) : (
                  <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                    <img src={image} alt="Uploaded solar panel" className="w-full h-auto block" />
                  </div>
                )}

                {!result && (
                  <Button onClick={handleAnalyze} disabled={analyzing} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                    {analyzing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Panel...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Run AI Inspection</>
                    )}
                  </Button>
                )}

                {result && (
                  <Button variant="outline" onClick={handleReset} className="w-full border-border text-foreground hover:bg-secondary">
                    <RotateCcw className="mr-2 h-4 w-4" /> Inspect Another Panel
                  </Button>
                )}
              </div>
            ) : null}

            {/* Progress bar during analysis */}
            {analyzing && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">AI Analysis in Progress</p>
                    <p className="text-xs text-muted-foreground">Scanning for all solar panel defects...</p>
                  </div>
                </div>
                <Progress value={analyzeProgress} className="h-2 bg-secondary" />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Detecting dust & dirt",
                    "Checking for cracks",
                    "Scanning bird droppings",
                    "Analyzing shading areas",
                    "Inspecting for hotspots",
                    "Checking wiring & frame",
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                      <span className="text-[11px] text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{error}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-card/50 border border-border p-3">
                  <p className="text-[11px] font-semibold text-foreground mb-1.5">Troubleshooting Tips:</p>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Ensure the photo clearly shows a solar panel</li>
                    <li>Use a well-lit image (avoid very dark or overexposed photos)</li>
                    <li>Keep the image under 5MB for best results</li>
                    <li>Try taking the photo from directly above or at a slight angle</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleAnalyze}>
                    <RotateCcw className="mr-1.5 h-3 w-3" /> Retry Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary" onClick={handleReset}>
                    <Upload className="mr-1.5 h-3 w-3" /> Upload Different Photo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {!result && !analyzing && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center h-full min-h-[300px]">
                <ScanEye className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Upload a panel photo to start</p>
                <p className="mt-1 text-xs text-muted-foreground/70">AI will identify problems and provide step-by-step solutions</p>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center h-full min-h-[300px]">
                <div className="relative">
                  <ScanEye className="h-12 w-12 text-primary" />
                  <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-primary" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">Processing Image...</p>
                <p className="mt-1 text-xs text-muted-foreground">Analyzing with AI vision model</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Overall condition */}
                {condition && (
                  <div className={`rounded-xl border p-5 ${condition.bgColor}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        {result.overallCondition === "good" ? (
                          <CheckCircle className={`h-6 w-6 ${condition.color}`} />
                        ) : (
                          <AlertTriangle className={`h-6 w-6 ${condition.color}`} />
                        )}
                        <div>
                          <h3 className={`text-base font-bold ${condition.color}`}>{condition.label}</h3>
                          <p className="text-xs text-muted-foreground">Confidence: {result.overallConfidence}%</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {realIssues.length} {realIssues.length === 1 ? "issue" : "issues"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-foreground/80">{result.summary}</p>
                    <div className="mt-3"><Progress value={result.overallConfidence} className="h-1.5 bg-secondary" /></div>
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <TrendingDown className="h-5 w-5 text-destructive mx-auto" />
                    <p className="mt-1 text-lg font-bold text-foreground">{result.estimatedEfficiencyLoss}%</p>
                    <p className="text-[10px] text-muted-foreground">Efficiency Loss</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center">
                    <FileWarning className="h-5 w-5 text-warning mx-auto" />
                    {priority && (
                      <p className={`mt-1 text-sm font-bold ${priority.color.split(" ")[1]}`}>{priority.label}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">Maintenance</p>
                  </div>
                </div>

                {/* Issues list */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Detected Issues
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(tap to see solution)</span>
                  </h3>
                  <div className="space-y-3">
                    {result.issues.map((issue, idx) => {
                      const realIndex = issue.issueType !== "no_issue" ? realIssues.indexOf(issue) : -1
                      return (
                        <IssueCard
                          key={idx}
                          issue={issue}
                          index={realIndex}
                          isHighlighted={highlightedIssue === realIndex && realIndex !== -1}
                          onHover={(i) => setHighlightedIssue(i !== null && i >= 0 ? i : null)}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Safety disclaimer */}
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-warning">Safety Disclaimer</p>
            <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">
              AI diagnosis is based on image analysis. Confirm visually before taking action.
              For critical issues such as cracks, hotspots, or physical damage, always consult a
              certified solar technician before attempting any repairs. AI confidence scores are
              estimates and should not replace professional inspection.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

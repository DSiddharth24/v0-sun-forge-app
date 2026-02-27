"use client"

import { useState, useRef, useCallback } from "react"
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
} from "lucide-react"

interface IssueRegion {
  x: number
  y: number
  width: number
  height: number
}

interface DetectedIssue {
  issueType: string
  severityLevel: string
  dustLevel: string | null
  recommendedAction: string
  confidenceScore: number
  description: string
  region: IssueRegion
}

interface InspectionResult {
  overallCondition: string
  overallConfidence: number
  summary: string
  issues: DetectedIssue[]
}

const issueLabels: Record<string, string> = {
  dust_accumulation: "Dust Accumulation",
  glass_cracks: "Glass Cracks",
  bird_droppings: "Bird Droppings",
  shading: "Shading Area",
  physical_damage: "Physical Damage",
  discoloration: "Discoloration",
  hotspot: "Hotspot",
  delamination: "Delamination",
  no_issue: "No Issue Detected",
}

const actionLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  no_action: { label: "No Action Needed", color: "bg-success/15 text-success", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  monitor: { label: "Monitor Closely", color: "bg-chart-3/15 text-chart-3", icon: <Eye className="h-3.5 w-3.5" /> },
  clean: { label: "Clean Panel", color: "bg-warning/15 text-warning", icon: <Droplets className="h-3.5 w-3.5" /> },
  call_technician: { label: "Call Technician", color: "bg-destructive/15 text-destructive", icon: <Wrench className="h-3.5 w-3.5" /> },
}

const severityColors: Record<string, string> = {
  none: "bg-muted text-muted-foreground",
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
}

const conditionConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  good: { color: "text-success", bgColor: "bg-success/10 border-success/20", label: "Good Condition" },
  fair: { color: "text-chart-2", bgColor: "bg-chart-2/10 border-chart-2/20", label: "Fair Condition" },
  poor: { color: "text-warning", bgColor: "bg-warning/10 border-warning/20", label: "Poor Condition" },
  critical: { color: "text-destructive", bgColor: "bg-destructive/10 border-destructive/20", label: "Critical Condition" },
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
  no_issue: "transparent",
}

function ImageWithOverlays({
  src,
  issues,
  highlightedIndex,
  onHover,
}: {
  src: string
  issues: DetectedIssue[]
  highlightedIndex: number | null
  onHover: (index: number | null) => void
}) {
  const realIssues = issues.filter((i) => i.issueType !== "no_issue")

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
      <img
        src={src}
        alt="Uploaded solar panel for AI inspection"
        className="w-full h-auto block"
        crossOrigin="anonymous"
      />
      {/* Overlay markers */}
      {realIssues.map((issue, idx) => {
        const isHighlighted = highlightedIndex === idx
        return (
          <div
            key={idx}
            className="absolute cursor-pointer transition-all duration-200"
            style={{
              left: `${issue.region.x}%`,
              top: `${issue.region.y}%`,
              width: `${issue.region.width}%`,
              height: `${issue.region.height}%`,
              backgroundColor: markerColors[issue.issueType] || "rgba(239, 68, 68, 0.35)",
              border: `2px solid ${markerBorders[issue.issueType] || "rgba(239, 68, 68, 0.9)"}`,
              borderRadius: "4px",
              opacity: highlightedIndex === null || isHighlighted ? 1 : 0.3,
              transform: isHighlighted ? "scale(1.02)" : "scale(1)",
              zIndex: isHighlighted ? 10 : 1,
              boxShadow: isHighlighted
                ? `0 0 12px ${markerBorders[issue.issueType] || "rgba(239, 68, 68, 0.6)"}`
                : "none",
            }}
            onMouseEnter={() => onHover(idx)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Label */}
            <div
              className="absolute -top-6 left-0 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: markerBorders[issue.issueType] || "rgba(239, 68, 68, 0.9)",
                color: "#fff",
              }}
            >
              {issueLabels[issue.issueType] || issue.issueType}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function IssueResultCard({
  issue,
  index,
  isHighlighted,
  onHover,
}: {
  issue: DetectedIssue
  index: number
  isHighlighted: boolean
  onHover: (index: number | null) => void
}) {
  const action = actionLabels[issue.recommendedAction] || actionLabels.monitor
  const isNoIssue = issue.issueType === "no_issue"

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        isHighlighted
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-card"
      }`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
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
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {issue.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-foreground">{issue.confidenceScore}%</div>
          <div className="text-[10px] text-muted-foreground">confidence</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Severity */}
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${
            severityColors[issue.severityLevel] || severityColors.low
          }`}
        >
          {issue.severityLevel.charAt(0).toUpperCase() + issue.severityLevel.slice(1)} Severity
        </span>

        {/* Dust level */}
        {issue.dustLevel && issue.dustLevel !== "none" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
            <Droplets className="h-3 w-3" />
            {issue.dustLevel.charAt(0).toUpperCase() + issue.dustLevel.slice(1)} Dust
          </span>
        )}

        {/* Action */}
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${action.color}`}
        >
          {action.icon}
          {action.label}
        </span>
      </div>
    </div>
  )
}

export default function InspectionPage() {
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIssue, setHighlightedIssue] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB")
      return
    }
    setError(null)
    setResult(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleAnalyze = async () => {
    if (!image) return
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/inspect-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed")
      }
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setFileName("")
    setResult(null)
    setError(null)
    setHighlightedIssue(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const realIssues = result?.issues.filter((i) => i.issueType !== "no_issue") || []
  const condition = result ? conditionConfig[result.overallCondition] || conditionConfig.fair : null

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ScanEye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                AI Visual Panel Inspection
              </h1>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your solar panel for instant AI-powered diagnostics
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Upload + Image */}
          <div className="space-y-4">
            {!image ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/20"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  Upload or Capture Panel Photo
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag & drop or click to browse. Supports JPG, PNG up to 10MB.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary"
                    onClick={() => {
                      const input = fileInputRef.current
                      if (input) {
                        input.setAttribute("capture", "environment")
                        input.click()
                        input.removeAttribute("capture")
                      }
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Camera className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!analyzing && (
                      <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {result ? (
                  <ImageWithOverlays
                    src={image}
                    issues={result.issues}
                    highlightedIndex={highlightedIssue}
                    onHover={setHighlightedIssue}
                  />
                ) : (
                  <div className="rounded-xl overflow-hidden border border-border bg-secondary/30">
                    <img
                      src={image}
                      alt="Uploaded solar panel"
                      className="w-full h-auto block"
                    />
                  </div>
                )}

                {/* Action buttons */}
                {!result && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Panel...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Run AI Inspection
                      </>
                    )}
                  </Button>
                )}

                {result && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full border-border text-foreground hover:bg-secondary"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Inspect Another Panel
                  </Button>
                )}
              </div>
            )}

            {/* Analyzing state */}
            {analyzing && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">AI Analysis in Progress</p>
                    <p className="text-xs text-muted-foreground">
                      Detecting dust, cracks, droppings, shading, and damage...
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {["Scanning for dust accumulation", "Checking for glass cracks", "Detecting bird droppings", "Analyzing shading areas", "Checking for physical damage"].map(
                    (step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                        <span className="text-xs text-muted-foreground">{step}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleAnalyze}
                  >
                    <RotateCcw className="mr-1.5 h-3 w-3" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {!result && !analyzing && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center h-full min-h-[300px]">
                <ScanEye className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  Upload a panel photo to start inspection
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  AI will detect dust, cracks, droppings, shading, and physical damage
                </p>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center h-full min-h-[300px]">
                <div className="relative">
                  <ScanEye className="h-12 w-12 text-primary" />
                  <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-primary" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">Processing Image...</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This may take a few seconds
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Overall condition card */}
                {condition && (
                  <div className={`rounded-xl border p-5 ${condition.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {result.overallCondition === "good" ? (
                          <CheckCircle className={`h-6 w-6 ${condition.color}`} />
                        ) : (
                          <AlertTriangle className={`h-6 w-6 ${condition.color}`} />
                        )}
                        <div>
                          <h3 className={`text-base font-bold ${condition.color}`}>
                            {condition.label}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Overall confidence: {result.overallConfidence}%
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {realIssues.length} {realIssues.length === 1 ? "issue" : "issues"} found
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {result.summary}
                    </p>
                    <div className="mt-3">
                      <Progress
                        value={result.overallConfidence}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  </div>
                )}

                {/* Individual issues */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Detected Issues</h3>
                  <div className="space-y-3">
                    {result.issues.map((issue, idx) => {
                      const realIndex = issue.issueType !== "no_issue"
                        ? realIssues.indexOf(issue)
                        : -1
                      return (
                        <IssueResultCard
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

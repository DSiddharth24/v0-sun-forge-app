"use client"

import { CheckCircle2, Clock, ShieldAlert, Wrench } from "lucide-react"
import type { ProblemInfo } from "@/lib/solar-data"

export function DiyGuide({ problem }: { problem: ProblemInfo }) {
  if (!problem.diyGuide) return null

  const guide = problem.diyGuide

  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <h4 className="text-sm font-semibold text-success">
          You Can Fix This Yourself
        </h4>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{guide.estimatedTime}</span>
        </div>
        {guide.tools.length > 0 && guide.tools[0] !== "None required" && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" />
            <span>{guide.tools.length} tool{guide.tools.length > 1 ? "s" : ""} needed</span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-foreground">Step-by-step guide:</p>
        <ol className="space-y-2">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-[10px] font-bold text-success">
                {i + 1}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tools */}
      {guide.tools.length > 0 && guide.tools[0] !== "None required" && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Tools needed:</p>
          <ul className="flex flex-wrap gap-2">
            {guide.tools.map((tool, i) => (
              <li
                key={i}
                className="rounded-md bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety */}
      <div className="flex gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
        <ShieldAlert className="h-4 w-4 shrink-0 text-warning mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-warning">Safety Warning</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{guide.safetyNote}</p>
        </div>
      </div>
    </div>
  )
}

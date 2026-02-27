import { generateText, Output } from "ai"
import { z } from "zod"

const panelIssueSchema = z.object({
  issueType: z.string().describe("One of: dust_accumulation, glass_cracks, bird_droppings, shading, physical_damage, discoloration, hotspot, delamination, moisture_ingress, wiring_visible, corrosion, snail_trail, no_issue"),
  severityLevel: z.string().describe("One of: none, low, medium, high"),
  dustLevel: z.string().nullable().describe("One of: none, low, medium, heavy - or null if not dust-related"),
  recommendedAction: z.string().describe("One of: no_action, monitor, clean, call_technician"),
  confidenceScore: z.number().describe("Confidence 0-100"),
  description: z.string().describe("1-2 sentence plain language description"),
  solution: z.string().describe("Step-by-step solution in 2-4 sentences"),
  estimatedImpact: z.string().describe("Estimated power output impact"),
  region: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).describe("Bounding box as percentages 0-100 of image dimensions"),
})

const inspectionResultSchema = z.object({
  overallCondition: z.string().describe("One of: good, fair, poor, critical"),
  overallConfidence: z.number().describe("Overall confidence 0-100"),
  summary: z.string().describe("3-5 sentence overall summary"),
  estimatedEfficiencyLoss: z.number().describe("Estimated efficiency loss percentage 0-100"),
  maintenancePriority: z.string().describe("One of: none, low, medium, high, urgent"),
  issues: z.array(panelIssueSchema).describe("All detected issues, at least 1 entry"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const imageData: string | undefined = body.image

    if (!imageData || typeof imageData !== "string") {
      return Response.json(
        { error: "No image provided. Please upload or capture a photo of a solar panel." },
        { status: 400 },
      )
    }

    // Extract base64 and mime type from data URL
    let base64: string
    let mimeType = "image/jpeg"

    if (imageData.startsWith("data:")) {
      const commaIndex = imageData.indexOf(",")
      if (commaIndex === -1) {
        return Response.json({ error: "Invalid image format." }, { status: 400 })
      }
      const header = imageData.substring(0, commaIndex)
      const typeMatch = header.match(/data:(image\/[a-zA-Z+]+);/)
      if (typeMatch) mimeType = typeMatch[1]
      base64 = imageData.substring(commaIndex + 1)
    } else {
      base64 = imageData
    }

    if (base64.length < 100) {
      return Response.json(
        { error: "Image appears to be empty or corrupted. Please upload a valid photo." },
        { status: 400 },
      )
    }

    console.log("[v0] Panel inspection starting. Image base64 length:", base64.length, "mime:", mimeType)

    const { output } = await generateText({
      model: "google/gemini-2.0-flash-001",
      output: Output.object({ schema: inspectionResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a solar panel inspection expert. Analyze this image of a solar panel and identify ALL visible problems.

The image may be low resolution (360p) - still analyze it thoroughly. For blurry images, use color patterns, brightness distribution, and visible textures to make assessments. Lower your confidence score for unclear detections but still report them.

Look for these issues:
1. DUST & DIRT - haze, dirt film, sand covering cells. Rate dust level: low/medium/heavy
2. GLASS CRACKS - fractures, spider web cracks, impact marks
3. BIRD DROPPINGS - white/grey spots, dried deposits
4. SHADING - shadows from trees, buildings, wires
5. PHYSICAL DAMAGE - dents, broken glass, frame damage
6. DISCOLORATION - browning, yellowed cells, uneven color
7. HOTSPOTS - dark burnt marks from overheating
8. DELAMINATION - bubbling, peeling layers, air pockets
9. MOISTURE INGRESS - foggy patches, condensation inside
10. WIRING ISSUES - exposed wires, damaged junction box
11. CORROSION - rust on frame, oxidized connectors
12. SNAIL TRAILS - silvery brown lines along cell edges

For each issue:
- Set region as percentage coordinates (x, y, width, height from 0-100)
- Write description a homeowner can understand
- Give step-by-step solution with safety notes
- Estimate power impact (e.g. "5-10% power loss")

If panel looks clean, return one "no_issue" entry with confidence score and maintenance tips in the solution field.
If the image is not a solar panel, describe what you see and note it in the summary.

IMPORTANT: Always return at least 1 issue in the issues array.`,
            },
            {
              type: "image",
              image: base64,
              mimeType: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            },
          ],
        },
      ],
    })

    console.log("[v0] Panel inspection complete. Output:", output ? "received" : "null")

    if (!output) {
      return Response.json(
        { error: "AI could not produce a structured report. Please try a different photo or angle." },
        { status: 422 },
      )
    }

    return Response.json({ result: output })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Panel inspection error:", msg)

    if (msg.includes("rate") || msg.includes("quota") || msg.includes("429")) {
      return Response.json(
        { error: "AI service is temporarily busy. Please wait a moment and try again." },
        { status: 429 },
      )
    }
    if (msg.includes("too large") || msg.includes("payload") || msg.includes("413")) {
      return Response.json(
        { error: "Image is too large for analysis. Please use a smaller photo." },
        { status: 413 },
      )
    }
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      return Response.json(
        { error: "Analysis timed out. Please try again." },
        { status: 504 },
      )
    }

    return Response.json(
      { error: `Analysis failed: ${msg.slice(0, 200)}. Please try again with a clear photo of your solar panel.` },
      { status: 500 },
    )
  }
}

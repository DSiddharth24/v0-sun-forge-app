import { generateText, Output } from "ai"
import { z } from "zod"

const panelIssueSchema = z.object({
  issueType: z
    .enum([
      "dust_accumulation",
      "glass_cracks",
      "bird_droppings",
      "shading",
      "physical_damage",
      "discoloration",
      "hotspot",
      "delamination",
      "moisture_ingress",
      "wiring_visible",
      "corrosion",
      "snail_trail",
      "no_issue",
    ])
    .describe("The type of issue detected on the panel"),
  severityLevel: z
    .enum(["none", "low", "medium", "high"])
    .describe("Severity of the issue"),
  dustLevel: z
    .enum(["none", "low", "medium", "heavy"])
    .nullable()
    .describe("Dust accumulation level, null if not dust-related"),
  recommendedAction: z
    .enum(["no_action", "monitor", "clean", "call_technician"])
    .describe("What action should be taken"),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence score of the detection 0-100"),
  description: z.string().describe("1-2 sentence description of finding"),
  solution: z
    .string()
    .describe("Detailed 2-4 sentence step-by-step solution"),
  estimatedImpact: z
    .string()
    .describe("Estimated impact on power output e.g. 5-10% power loss"),
  region: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(5).max(100),
    height: z.number().min(5).max(100),
  }),
})

const inspectionResultSchema = z.object({
  overallCondition: z.enum(["good", "fair", "poor", "critical"]),
  overallConfidence: z.number().min(0).max(100),
  summary: z.string().describe("3-5 sentence summary of findings"),
  estimatedEfficiencyLoss: z.number().min(0).max(100),
  maintenancePriority: z.enum(["none", "low", "medium", "high", "urgent"]),
  issues: z
    .array(panelIssueSchema)
    .describe("All detected issues, minimum one entry"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const imageData = body.image

    if (!imageData || typeof imageData !== "string") {
      return Response.json(
        { error: "No image provided. Please upload or capture a photo." },
        { status: 400 }
      )
    }

    // Strip the data URL prefix to get just the base64 data
    const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/)
    if (!base64Match) {
      return Response.json(
        { error: "Invalid image format. Please upload a JPG or PNG image." },
        { status: 400 }
      )
    }

    const mimeTypeMatch = imageData.match(/^data:(image\/[^;]+);base64,/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg"

    const result = await generateText({
      model: "google/gemini-3-flash",
      output: Output.object({ schema: inspectionResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a senior solar panel maintenance expert for the Sun Forge monitoring platform. Analyze this solar panel image and diagnose ALL visible problems.

IMPORTANT: You MUST respond with valid structured data. Be thorough and realistic.

Examine the panel systematically and check for:

1. DUST & DIRT: Haze, dirt streaks, sand, pollen. Level: low/medium/heavy.
2. GLASS CRACKS: Hairline fractures, spider web patterns, impact cracks.
3. BIRD DROPPINGS: White/grey spots, splatter, dried deposits causing hotspots.
4. SHADING: Shadows from trees, buildings, wires, uneven lighting.
5. PHYSICAL DAMAGE: Dents, broken glass, frame damage, bent edges.
6. DISCOLORATION: Browning, yellowed encapsulant, uneven cell color.
7. HOTSPOTS: Dark burnt marks, localized browning, melted areas - fire hazard.
8. DELAMINATION: Bubbling, peeling layers, air pockets.
9. MOISTURE INGRESS: Foggy areas, condensation inside panel, water marks.
10. WIRING ISSUES: Exposed wires, damaged junction box, loose connectors.
11. CORROSION: Rust on frame, oxidation on connectors, green patina.
12. SNAIL TRAILS: Silvery/brown lines along cell edges from moisture reaction.

For EACH issue found:
- Place bounding boxes on ACTUAL locations (x, y, width, height as % of image).
- Give specific actionable solutions with safety precautions.
- Estimate power impact realistically.
- Set confidence based on image clarity and how clearly the issue is visible.

If the panel looks clean, return a single "no_issue" entry confirming good condition with maintenance tips.

If this is NOT a solar panel image, still analyze it but note that in the summary and set condition to "poor".`,
            },
            {
              type: "image",
              image: base64Match[1],
              mimeType: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            },
          ],
        },
      ],
    })

    if (!result.output) {
      return Response.json(
        {
          error:
            "AI could not generate a structured analysis. The image may be unclear or not showing a solar panel. Please try with a clearer photo.",
        },
        { status: 422 }
      )
    }

    return Response.json({ result: result.output })
  } catch (error: unknown) {
    console.error("Panel inspection error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("rate") || errorMessage.includes("quota")) {
      return Response.json(
        {
          error:
            "AI service rate limit reached. Please wait a moment and try again.",
        },
        { status: 429 }
      )
    }

    if (
      errorMessage.includes("too large") ||
      errorMessage.includes("payload")
    ) {
      return Response.json(
        {
          error:
            "Image is too large to process. Please use a smaller image (under 5MB recommended).",
        },
        { status: 413 }
      )
    }

    return Response.json(
      {
        error:
          "Failed to analyze the panel image. Please try again with a clear photo of your solar panel.",
      },
      { status: 500 }
    )
  }
}

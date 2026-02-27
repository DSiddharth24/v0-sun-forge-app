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
  description: z.string().describe("1-2 sentence plain language description of this finding"),
  solution: z
    .string()
    .describe("Step-by-step solution in 2-4 sentences. Include safety warnings if relevant."),
  estimatedImpact: z
    .string()
    .describe("Estimated impact on power output, e.g. '5-10% power loss'"),
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
  summary: z
    .string()
    .describe("3-5 sentence overall summary of all findings in plain language"),
  estimatedEfficiencyLoss: z.number().min(0).max(100),
  maintenancePriority: z.enum(["none", "low", "medium", "high", "urgent"]),
  issues: z
    .array(panelIssueSchema)
    .describe("All detected issues. MUST have at least 1 entry."),
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

    // Accept both raw base64 and data-url formats
    let base64: string
    let mimeType = "image/jpeg"

    const dataUrlMatch = imageData.match(
      /^data:(image\/[a-zA-Z+]+);base64,(.+)$/,
    )
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1]
      base64 = dataUrlMatch[2]
    } else if (/^[A-Za-z0-9+/=]+$/.test(imageData.slice(0, 100))) {
      // Looks like raw base64 already
      base64 = imageData
    } else {
      return Response.json(
        { error: "Invalid image format. Please upload a JPG or PNG file." },
        { status: 400 },
      )
    }

    // Validate the base64 is not empty / too small
    if (base64.length < 500) {
      return Response.json(
        { error: "Image appears to be empty or corrupted. Please upload a valid photo." },
        { status: 400 },
      )
    }

    const result = await generateText({
      model: "google/gemini-3-flash",
      output: Output.object({ schema: inspectionResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a senior solar panel inspection expert for the Sun Forge monitoring platform.

TASK: Carefully analyze this solar panel image and identify every visible problem. The image may be low-resolution (360p or higher) - you MUST still analyze it thoroughly and make your best assessment even if the image quality is limited.

FOR LOW QUALITY IMAGES:
- Look at overall color distribution, brightness patterns, and visible textures
- Infer dust from general haziness or uneven coloring across the panel surface
- Detect droppings from white/grey irregular spots
- Identify cracks from any visible line patterns on the glass
- Notice shading from darker regions or uneven brightness
- Adjust your confidence score lower (40-70%) for blurry images, but STILL provide findings
- Mention image quality in your summary if relevant

CHECK FOR ALL OF THESE:
1. DUST & DIRT - Haze, dirt film, sand, pollen covering cells. Rate: low/medium/heavy
2. GLASS CRACKS - Hairline fractures, spider web cracks, impact damage
3. BIRD DROPPINGS - White/grey spots, dried deposits causing shading
4. SHADING - Shadows from trees, buildings, wires, or other objects
5. PHYSICAL DAMAGE - Dents, broken glass, frame damage, bent edges
6. DISCOLORATION - Browning, yellowed cells, uneven cell color
7. HOTSPOTS - Dark burnt marks, localized discoloration from overheating
8. DELAMINATION - Bubbling, peeling layers, visible air pockets under glass
9. MOISTURE INGRESS - Foggy patches, condensation inside, water marks
10. WIRING ISSUES - Exposed wires, damaged junction box, loose connectors
11. CORROSION - Rust on metal frame, oxidized connectors
12. SNAIL TRAILS - Silvery brown lines along cell edges

FOR EACH ISSUE FOUND:
- Place a bounding box on the ACTUAL location in the image (x, y, width, height as percentages 0-100)
- Write a clear plain-language description a homeowner can understand
- Give a specific step-by-step solution with safety precautions
- Estimate power impact realistically (e.g. "3-5% power loss")
- Set confidence score based on how clearly visible the issue is

If the panel looks CLEAN with no issues, return a single "no_issue" entry with maintenance tips.
If the image does NOT show a solar panel, still provide your best analysis of what you see and note it in the summary.

IMPORTANT: You MUST return at least one issue entry. Always provide actionable solutions.`,
            },
            {
              type: "image",
              image: base64,
              mimeType: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
            },
          ],
        },
      ],
    })

    if (!result.output) {
      return Response.json(
        {
          error:
            "AI could not produce a structured report for this image. Please try a different photo or angle.",
        },
        { status: 422 },
      )
    }

    return Response.json({ result: result.output })
  } catch (error: unknown) {
    console.error("Panel inspection error:", error)

    const msg = error instanceof Error ? error.message : String(error)

    if (msg.includes("rate") || msg.includes("quota") || msg.includes("429")) {
      return Response.json(
        { error: "AI service is temporarily busy. Please wait 30 seconds and try again." },
        { status: 429 },
      )
    }

    if (msg.includes("too large") || msg.includes("payload") || msg.includes("413")) {
      return Response.json(
        { error: "Image file is too large. Please use a smaller or lower-resolution photo." },
        { status: 413 },
      )
    }

    if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      return Response.json(
        { error: "Analysis timed out. Please try again - it usually works on the second attempt." },
        { status: 504 },
      )
    }

    return Response.json(
      { error: "Something went wrong analyzing your photo. Please try again with a clear image of your solar panel." },
      { status: 500 },
    )
  }
}

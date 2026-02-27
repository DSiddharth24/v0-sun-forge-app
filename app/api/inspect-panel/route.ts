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
    .describe("Confidence score of the detection as a percentage"),
  description: z
    .string()
    .describe("A brief 1-2 sentence description of the finding"),
  region: z
    .object({
      x: z
        .number()
        .min(0)
        .max(100)
        .describe("X position as percentage of image width"),
      y: z
        .number()
        .min(0)
        .max(100)
        .describe("Y position as percentage of image height"),
      width: z
        .number()
        .min(0)
        .max(100)
        .describe("Width as percentage of image width"),
      height: z
        .number()
        .min(0)
        .max(100)
        .describe("Height as percentage of image height"),
    })
    .describe(
      "Approximate bounding box of the detected issue as percentage coordinates"
    ),
})

const inspectionResultSchema = z.object({
  overallCondition: z
    .enum(["good", "fair", "poor", "critical"])
    .describe("Overall panel condition assessment"),
  overallConfidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall confidence in the analysis"),
  summary: z
    .string()
    .describe(
      "A 2-3 sentence summary of the panel inspection findings and recommendations"
    ),
  issues: z
    .array(panelIssueSchema)
    .describe(
      "List of all detected issues. Include at least one entry even if no issues found (use no_issue type)."
    ),
})

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    const { output } = await generateText({
      model: "google/gemini-3-flash",
      output: Output.object({ schema: inspectionResultSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert solar panel inspector AI. Analyze this solar panel image and detect any issues.

For each issue found, provide:
1. The specific issue type (dust_accumulation, glass_cracks, bird_droppings, shading, physical_damage, discoloration, hotspot, delamination, or no_issue)
2. Severity level (none, low, medium, high)
3. If dust-related, the dust accumulation level (none, low, medium, heavy)
4. Recommended action (no_action, monitor, clean, call_technician)
5. A confidence score (0-100%)
6. A brief description of the finding
7. The approximate region/bounding box where the issue is located as percentage coordinates (x, y, width, height from 0-100)

Be thorough - check the entire panel for:
- Dust accumulation (uniform haze, dirt patterns)
- Visible cracks on glass surface (lines, fractures, spider web patterns)
- Bird droppings (white/grey spots, splatter patterns)
- Shading areas (dark regions, shadows from objects)
- Physical damage (dents, chips, broken areas)
- Discoloration (yellowing, browning, uneven color)
- Hotspots (burnt marks, dark spots)
- Delamination (peeling, bubbling)

If the image does not appear to be a solar panel, still provide your best analysis but note that in the summary. Provide realistic confidence scores based on image clarity and visibility of issues.`,
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
    })

    return Response.json({ result: output })
  } catch (error) {
    console.error("Panel inspection error:", error)
    return Response.json(
      { error: "Failed to analyze panel image. Please try again." },
      { status: 500 }
    )
  }
}

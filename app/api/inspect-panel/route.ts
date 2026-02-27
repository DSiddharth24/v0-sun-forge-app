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
    .describe("Confidence score of the detection as a percentage"),
  description: z
    .string()
    .describe("A 1-2 sentence description of the finding"),
  solution: z
    .string()
    .describe(
      "A detailed 2-4 sentence step-by-step solution or recommendation for fixing this specific issue. Include safety precautions if relevant."
    ),
  estimatedImpact: z
    .string()
    .describe(
      "Estimated impact on power output, e.g. '5-10% power loss' or 'Up to 25% reduction in efficiency'"
    ),
  region: z
    .object({
      x: z.number().min(0).max(100).describe("X position as percentage of image width"),
      y: z.number().min(0).max(100).describe("Y position as percentage of image height"),
      width: z.number().min(5).max(100).describe("Width as percentage of image width, minimum 5"),
      height: z.number().min(5).max(100).describe("Height as percentage of image height, minimum 5"),
    })
    .describe("Bounding box of detected issue as percentage coordinates"),
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
      "A 3-5 sentence detailed summary of the panel inspection findings, what problems were found, their likely cause, and the most important next steps to take"
    ),
  estimatedEfficiencyLoss: z
    .number()
    .min(0)
    .max(100)
    .describe("Estimated total efficiency loss percentage due to all detected issues combined"),
  maintenancePriority: z
    .enum(["none", "low", "medium", "high", "urgent"])
    .describe("Overall maintenance priority level"),
  issues: z
    .array(panelIssueSchema)
    .describe(
      "List of ALL detected issues. Be thorough - detect every visible problem. Include at least one entry even if no issues found (use no_issue type)."
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
              text: `You are a senior solar panel maintenance expert and AI diagnostic system for the Sun Forge platform. Carefully analyze this solar panel image and provide a comprehensive diagnosis.

YOUR TASK:
Examine every part of the panel surface systematically - top to bottom, left to right. Identify ALL visible issues no matter how small.

DETECTION CHECKLIST - check for each of these:

1. DUST & DIRT ACCUMULATION
   - Look for: uniform haze, dirt streaks, sand deposits, pollen layer, muddy residue
   - Classify level: low (thin film), medium (visible layer), heavy (thick opaque coating)
   - Solution must include: cleaning method, frequency recommendation, water type

2. GLASS SURFACE CRACKS
   - Look for: hairline fractures, spider web patterns, impact cracks, edge chips, micro-cracks
   - Note: even small cracks can lead to moisture ingress and total panel failure
   - Solution must include: urgency level, whether panel needs replacement

3. BIRD DROPPINGS
   - Look for: white/grey spots, splatter patterns, dried deposits, acidic staining
   - Note: bird droppings cause hotspots which can permanently damage cells
   - Solution must include: safe cleaning method, deterrent recommendations

4. SHADING ISSUES
   - Look for: shadows from trees/buildings/wires, partial shade patterns, uneven lighting
   - Note: even 5% shading can cause 25%+ power loss
   - Solution must include: shade source identification, trimming/repositioning advice

5. PHYSICAL DAMAGE
   - Look for: dents, broken glass, frame damage, bent edges, hail damage
   - Solution must include: safety warning, whether to disconnect panel

6. DISCOLORATION / YELLOWING
   - Look for: browning of EVA, yellowed encapsulant, uneven cell color
   - Note: indicates UV degradation or thermal stress

7. HOTSPOTS
   - Look for: dark burnt marks, localized browning, melted areas
   - Note: fire hazard - recommend immediate technician visit

8. DELAMINATION
   - Look for: bubbling, peeling layers, air pockets between layers, edge lifting

9. MOISTURE / WATER INGRESS
   - Look for: foggy areas, condensation inside panel, water marks

10. VISIBLE WIRING ISSUES
    - Look for: exposed wires, damaged junction box, loose connectors

11. CORROSION
    - Look for: rust on frame, oxidation on connectors, green patina

12. SNAIL TRAILS
    - Look for: silvery/brown lines following cell edges (indicates moisture + chemical reaction)

IMPORTANT RULES:
- Be THOROUGH. Report every issue you can identify.
- Place bounding boxes ACCURATELY on the actual location of each issue.
- Make bounding boxes large enough to be visible (minimum 5% width and height).
- Provide REALISTIC confidence scores based on image clarity.
- For each issue, provide a SPECIFIC actionable solution, not generic advice.
- Estimate the POWER IMPACT of each issue.
- If the image is NOT a solar panel, still analyze it but clearly state that in the summary and set overall condition to "poor" with a note explaining it doesn't appear to be a solar panel.
- If the panel looks clean and healthy, confirm that with a "no_issue" entry and provide maintenance tips to keep it that way.`,
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

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
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
  isSolarPanel: z
    .boolean()
    .describe("True if the image clearly shows a solar panel or a component of a solar array"),
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

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable");
      return Response.json(
        { error: "API configuration error. If this is a Vercel deployment, please ensure OPENAI_API_KEY is set in the project settings." },
        { status: 500 }
      )
    }

    // Extract base64 content if it's a data URL
    const base64Data = image.split(",")[1] || image;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: inspectionResultSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert solar panel inspector AI. Analyze this image.
              
First, determine if the image is actually a solar panel. If it is NOT a solar panel (e.g., it's a person, building, animal, or anything else), set isSolarPanel to false.

If it is a solar panel, analyze it and detect any issues.
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

If isSolarPanel is false, you can provide dummy values for other fields but ensure isSolarPanel is correctly set to false.`,
            },
            {
              type: "image",
              image: `data:image/jpeg;base64,${base64Data}`,
            },
          ],
        },
      ],
    })

    if (!object.isSolarPanel) {
      return Response.json(
        { error: "The uploaded image is not a solar panel. Please upload a clear photo of a solar panel for inspection." },
        { status: 400 }
      )
    }

    return Response.json({ result: object })
  } catch (error: any) {
    console.error("Panel inspection raw error:", error)

    let errorMessage = "Failed to analyze panel image. Please try again."

    if (error.message?.includes("quota") || error.status === 429) {
      errorMessage = "AI API quota exceeded. Please check your OpenAI billing plan or try again later."
    } else if (error.message?.includes("API key") || error.status === 401) {
      errorMessage = "Invalid API Key. Please ensure your OPENAI_API_KEY is correct."
    } else if (error.status === 413) {
      errorMessage = "Image too large. Please upload an image smaller than 4MB."
    }

    return Response.json(
      { error: errorMessage },
      { status: error.status || 500 }
    )
  }
}

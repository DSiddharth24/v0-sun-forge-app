const { createGroq } = require("@ai-sdk/groq");
const { generateObject } = require("ai");
const { z } = require("zod");
require("dotenv").config({ path: ".env.local" });

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
    console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Found ✅" : "Missing ❌");

    try {
        const result = await generateObject({
            model: groq("llama-3.2-11b-vision-preview"),
            schema: z.object({ isWorking: z.boolean() }),
            prompt: "Return isWorking as true.",
        });
        console.log("Groq API works! ✅", result.object);
    } catch (err) {
        console.error("Groq API error ❌:", err.message);
    }
}

testGroq();

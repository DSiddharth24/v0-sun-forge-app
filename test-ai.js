const { google } = require("@ai-sdk/google");
const { generateObject } = require("ai");
const { z } = require("zod");
require("dotenv").config({ path: ".env.local" });

async function testAI() {
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-pro-vision"];

    for (const modelName of modelsToTry) {
        try {
            console.log(`--- Testing model: ${modelName} ---`);
            const result = await generateObject({
                model: google(modelName),
                schema: z.object({
                    test: z.string()
                }),
                prompt: "Say hello",
            });

            console.log(`Success with ${modelName}:`, JSON.stringify(result.object, null, 2));
            return; // Stop if one works
        } catch (error) {
            console.error(`Error with ${modelName}:`, error.message);
        }
    }
}

testAI();

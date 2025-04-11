import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, systemPrompt } = await req.json()

    if (!prompt || !model) {
      return NextResponse.json({ error: "Prompt and model are required" }, { status: 400 })
    }

    // In a real implementation, you would use different model providers based on the model requested
    // For demo purposes, we're using OpenAI for all models

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: systemPrompt || "You are a helpful assistant.",
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}

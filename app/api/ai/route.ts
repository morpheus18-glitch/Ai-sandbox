import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY environment variable is not set" }, { status: 500 })
    }

    const { text } = await generateText({
      model: groq("llama3-8b-8192"),
      prompt,
      system: systemPrompt,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}

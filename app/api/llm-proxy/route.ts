import { type NextRequest, NextResponse } from "next/server"
import { GroqChat } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    // Get the GROQ API key from server-side environment variable
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ API key is not configured" }, { status: 500 })
    }

    // Parse the request body
    const { model, messages, temperature, max_tokens } = await request.json()

    // Initialize the Groq client
    const groqClient = new GroqChat({ apiKey })

    // Generate response using Groq
    const response = await groqClient.chat({
      model: model || "llama3-70b-8192",
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 500,
    })

    // Return the response
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in LLM proxy:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

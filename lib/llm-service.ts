import type { AgentConfig } from "@/types/sandbox"

// Add this near the top of the file
import { encode, decode } from "gpt-tokenizer"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/types/message"
import type { Conversation } from "@/types/conversation"

// Add this function
function countTokens(text: string): number {
  return encode(text).length
}

function truncateToTokenLimit(text: string, limit: number): string {
  if (!text) return ""

  const tokens = encode(text)
  if (tokens.length <= limit) return text

  const truncatedTokens = tokens.slice(0, limit)
  const truncatedText = decode(truncatedTokens)
  return truncatedText + "... [truncated]"
}

// This service would handle the actual LLM interactions
// For demo purposes, we're using a simplified implementation

export async function generateAgentResponse(
  agent: AgentConfig,
  conversationHistory: string,
  latestMessage: string,
  conversation: Conversation,
): Promise<Message> {
  try {
    // In a real implementation, you would call your LLM API based on the agent's model
    // For demo purposes, we're making a call to our internal API

    const response = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${conversationHistory}\n\nLatest message: ${latestMessage}\n\nRespond as ${agent.name}:`,
        model: agent.model,
        systemPrompt: agent.instructions,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate agent response")
    }

    const data = await response.json()

    const mcpResponse = {
      content: data.text,
      metadata: {
        thinking: "This is a simulated thinking process for the agent.",
        latency: 100,
      },
    }

    // Create message object with token tracking
    const content = mcpResponse.content
    const tokenCount = countTokens(content)
    const thinkingTokens = mcpResponse.metadata.thinking ? countTokens(mcpResponse.metadata.thinking) : 0
    const totalTokens = tokenCount + thinkingTokens

    // Check for token limits and truncate if necessary
    const MAX_CONTENT_TOKENS = 500
    const MAX_THINKING_TOKENS = 300

    let truncatedContent = content
    let truncatedThinking = mcpResponse.metadata.thinking

    if (tokenCount > MAX_CONTENT_TOKENS) {
      truncatedContent = truncateToTokenLimit(content, MAX_CONTENT_TOKENS)
    }

    if (thinkingTokens > MAX_THINKING_TOKENS) {
      truncatedThinking = truncateToTokenLimit(mcpResponse.metadata.thinking, MAX_THINKING_TOKENS)
    }

    const message: Message = {
      id: uuidv4(),
      conversationId: conversation.id,
      agentId: agent.id,
      content: truncatedContent,
      timestamp: new Date().toISOString(),
      metadata: {
        thinking: truncatedThinking,
        tokens: {
          content: tokenCount,
          thinking: thinkingTokens,
          total: totalTokens,
          truncated: tokenCount > MAX_CONTENT_TOKENS || thinkingTokens > MAX_THINKING_TOKENS,
        },
        latency: mcpResponse.metadata.latency,
      },
    }

    return message
  } catch (error) {
    console.error("Error generating agent response:", error)
    throw error
  }
}

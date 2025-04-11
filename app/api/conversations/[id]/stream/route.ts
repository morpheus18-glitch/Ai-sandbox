import type { NextRequest } from "next/server"
import { generateId } from "@/lib/utils"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const conversationId = params.id

  // This would be replaced with actual streaming implementation
  // For demo purposes, we're using a simple approach

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Simulate messages from different agents
      const messages = [
        {
          id: generateId(),
          conversationId,
          agentId: "systems-thinker", // This would be a real agent ID in production
          content:
            "Looking at this from a systems perspective, I notice several interconnected factors at play. We should consider how these elements influence each other over time.",
          timestamp: new Date().toISOString(),
          metadata: {
            thinking: "I should highlight the interconnected nature of the topic and encourage holistic analysis.",
          },
        },
        {
          id: generateId(),
          conversationId,
          agentId: "devil-advocate", // This would be a real agent ID in production
          content:
            "I'd like to challenge that view. Are we certain these factors are as interconnected as they seem? There's a risk of seeing patterns where none exist.",
          timestamp: new Date(Date.now() + 3000).toISOString(),
          metadata: {
            thinking:
              "I should question the assumption of interconnectedness to ensure we're not overlooking simpler explanations.",
          },
        },
        {
          id: generateId(),
          conversationId,
          agentId: "ethical-reasoner", // This would be a real agent ID in production
          content:
            "From an ethical standpoint, we should also consider how different approaches might impact various stakeholders. Justice and fairness considerations suggest we need to account for distributional effects.",
          timestamp: new Date(Date.now() + 6000).toISOString(),
          metadata: {
            thinking:
              "I should introduce ethical considerations to ensure we're not focused solely on systems dynamics without considering moral implications.",
          },
        },
      ]

      // Send messages with delays to simulate real-time conversation
      for (const message of messages) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

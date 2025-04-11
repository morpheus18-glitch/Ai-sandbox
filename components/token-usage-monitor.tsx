"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Message } from "@/types/sandbox"

interface TokenUsageProps {
  messages: Message[]
  maxTokens?: number
}

export function TokenUsageMonitor({ messages, maxTokens = 4096 }: TokenUsageProps) {
  const [totalTokens, setTotalTokens] = useState(0)
  const [contentTokens, setContentTokens] = useState(0)
  const [thinkingTokens, setThinkingTokens] = useState(0)
  const [percentUsed, setPercentUsed] = useState(0)

  useEffect(() => {
    let content = 0
    let thinking = 0

    messages.forEach((message) => {
      if (message.metadata?.tokens) {
        content += message.metadata.tokens.content || 0
        thinking += message.metadata.tokens.thinking || 0
      }
    })

    const total = content + thinking
    setContentTokens(content)
    setThinkingTokens(thinking)
    setTotalTokens(total)
    setPercentUsed(Math.min((total / maxTokens) * 100, 100))
  }, [messages, maxTokens])

  // Determine color based on usage
  const getStatusColor = () => {
    if (percentUsed < 50) return "bg-green-500"
    if (percentUsed < 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Total: {totalTokens} / {maxTokens}
            </span>
            <span>{Math.round(percentUsed)}%</span>
          </div>
          <Progress value={percentUsed} className="h-2" indicatorClassName={getStatusColor()} />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Content:</span> {contentTokens}
            </div>
            <div>
              <span className="text-muted-foreground">Thinking:</span> {thinkingTokens}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

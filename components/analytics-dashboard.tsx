"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { detectEmergentLeadership, calculateInformationFlow } from "@/lib/vector-analysis"
import { analyzeSentiment } from "@/lib/sentiment-analysis"
import type { Conversation } from "@/types/sandbox"

interface AnalyticsDashboardProps {
  conversation: Conversation
  agents: any[]
}

export function AnalyticsDashboard({ conversation, agents }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("leadership")
  const [leadershipScores, setLeadershipScores] = useState<Record<string, number>>({})
  const [informationFlow, setInformationFlow] = useState<any>(null)
  const [sentimentData, setSentimentData] = useState<any[]>([])

  useEffect(() => {
    if (!conversation || !agents || agents.length === 0) return

    // Calculate leadership scores
    const agentIds = agents.map((a) => a.id)
    const scores = detectEmergentLeadership(conversation.messages, agentIds)
    setLeadershipScores(scores)

    // Calculate information flow
    const flow = calculateInformationFlow(conversation.messages, agentIds)
    setInformationFlow(flow)

    // Calculate sentiment over time
    const sentiments = conversation.messages.map((message) => {
      const sentiment = analyzeSentiment(message.content)
      return {
        agentId: message.agentId,
        timestamp: message.timestamp,
        score: sentiment.score,
        label: sentiment.label,
      }
    })
    setSentimentData(sentiments)
  }, [conversation, agents])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conversation Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="information">Information Flow</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="leadership" className="space-y-4">
            <h3 className="text-lg font-medium">Emergent Leadership Scores</h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{agent.name}</span>
                      <span className="text-sm">{leadershipScores[agent.id]?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(leadershipScores[agent.id] || 0) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="information">
            <h3 className="text-lg font-medium mb-4">Information Flow Matrix</h3>
            {informationFlow && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2">From / To</th>
                      {agents.map((agent) => (
                        <th key={agent.id} className="border p-2" style={{ color: agent.color }}>
                          {agent.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((fromAgent, fromIdx) => (
                      <tr key={fromAgent.id}>
                        <td className="border p-2 font-medium" style={{ color: fromAgent.color }}>
                          {fromAgent.name}
                        </td>
                        {agents.map((toAgent, toIdx) => (
                          <td key={toAgent.id} className="border p-2 text-center">
                            {fromIdx === toIdx ? "-" : informationFlow.matrix[fromIdx][toIdx].toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sentiment">
            <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
            <div className="space-y-4">
              {agents.map((agent) => {
                const agentSentiments = sentimentData.filter((s) => s.agentId === agent.id)
                const avgSentiment =
                  agentSentiments.length > 0
                    ? agentSentiments.reduce((sum, s) => sum + s.score, 0) / agentSentiments.length
                    : 0

                return (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name.substring(0, 2)}
                      </div>
                      <span className="font-medium">{agent.name}</span>
                      <span className="ml-auto text-sm">
                        Avg: {avgSentiment.toFixed(2)}(
                        {avgSentiment > 0.2 ? "Positive" : avgSentiment < -0.2 ? "Negative" : "Neutral"})
                      </span>
                    </div>

                    <div className="flex h-8 w-full rounded-md overflow-hidden">
                      {agentSentiments.map((sentiment, idx) => {
                        let bgColor = "bg-gray-300"
                        if (sentiment.score > 0.2) bgColor = "bg-green-500"
                        else if (sentiment.score < -0.2) bgColor = "bg-red-500"
                        else bgColor = "bg-gray-300"

                        return (
                          <div
                            key={idx}
                            className={`${bgColor} h-full`}
                            style={{ width: `${100 / Math.max(agentSentiments.length, 1)}%` }}
                            title={`${new Date(sentiment.timestamp).toLocaleTimeString()}: ${sentiment.score.toFixed(2)}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

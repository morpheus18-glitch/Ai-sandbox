"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil } from "lucide-react"
import { CharacterCreator } from "@/components/character-creator"
import { useToast } from "@/hooks/use-toast"

// Agent type definition
interface Agent {
  id: string
  name: string
  model: string
  avatar: string
  instructions: string
  color: string
  role: string
}

// Message type definition
interface Message {
  id: string
  agentId: string
  content: string
  timestamp: string
  metadata?: {
    thinking?: string
    [key: string]: any
  }
}

// Conversation type definition
interface Conversation {
  id: string
  topic: string
  objective: string
  systemPrompt?: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// Main 3D world component
export default function World3D({
  conversation,
  agents,
}: {
  conversation: Conversation | null
  agents: Agent[]
}) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showCharacterCreator, setShowCharacterCreator] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [customCharacters, setCustomCharacters] = useState<Record<string, any>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [messageQueue, setMessageQueue] = useState<Record<string, Message[]>>({})
  const [animationInProgress, setAnimationInProgress] = useState<Record<string, boolean>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  // Handle agent selection
  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  // Edit character
  const handleEditCharacter = (agent: Agent) => {
    setEditingAgent(agent)
    setShowCharacterCreator(true)
  }

  // Save character customization
  const handleSaveCharacter = (customization) => {
    if (editingAgent) {
      // Set the name to match the agent
      customization.name = editingAgent.name

      // Save the customization
      setCustomCharacters({
        ...customCharacters,
        [editingAgent.id]: customization,
      })

      // Close the character creator
      setShowCharacterCreator(false)
      setEditingAgent(null)
    }
  }

  useEffect(() => {
    if (!conversation) return

    // Initialize message queue for each agent
    const initialQueue: Record<string, Message[]> = {}
    agents.forEach((agent) => {
      initialQueue[agent.id] = []
    })
    setMessageQueue(initialQueue)

    // Initialize animation status
    const initialAnimationStatus: Record<string, boolean> = {}
    agents.forEach((agent) => {
      initialAnimationStatus[agent.id] = false
    })
    setAnimationInProgress(initialAnimationStatus)

    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/conversation/${conversation.id}/`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      toast({
        title: "Connected to conversation",
        description: "Real-time updates are now enabled",
      })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "new_message") {
        const message = data.message

        // Add message to queue for the specific agent
        setMessageQueue((prev) => {
          const agentQueue = [...(prev[message.agentId] || [])]
          agentQueue.push(message)
          return {
            ...prev,
            [message.agentId]: agentQueue,
          }
        })

        // Start animation if not already in progress
        processNextMessageInQueue(message.agentId)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      toast({
        title: "Disconnected from conversation",
        description: "Real-time updates are disabled",
        variant: "destructive",
      })
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [conversation])

  const processNextMessageInQueue = (agentId: string) => {
    if (animationInProgress[agentId] || !messageQueue[agentId]?.length) {
      return
    }

    // Mark animation as in progress
    setAnimationInProgress((prev) => ({
      ...prev,
      [agentId]: true,
    }))

    // Get the next message
    const nextMessage = messageQueue[agentId][0]

    // Remove message from queue
    setMessageQueue((prev) => ({
      ...prev,
      [agentId]: prev[agentId].slice(1),
    }))

    // Simulate typing animation
    simulateTypingAnimation(nextMessage, () => {
      // Mark animation as complete
      setAnimationInProgress((prev) => ({
        ...prev,
        [agentId]: false,
      }))

      // Process next message in queue
      setTimeout(() => {
        processNextMessageInQueue(agentId)
      }, 500) // Small delay between messages
    })
  }

  const simulateTypingAnimation = (message: Message, onComplete: () => void) => {
    // In a real implementation, this would animate the message character by character
    // For now, just add a delay to simulate typing
    setTimeout(() => {
      // Add message to conversation
      if (conversation) {
        conversation.messages.push(message)
      }

      // Force re-render
      setSelectedAgent(message.agentId)

      // Complete animation
      onComplete()
    }, 1000)
  }

  if (showCharacterCreator) {
    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden border relative bg-gray-50 p-4">
        <h2 className="text-2xl font-bold mb-4">Character Creator</h2>
        <p className="text-muted-foreground mb-6">Customize the appearance of {editingAgent?.name}</p>
        <CharacterCreator
          onSave={handleSaveCharacter}
          initialCustomization={
            customCharacters[editingAgent?.id || ""] || {
              name: editingAgent?.name || "Agent",
              skinColor: "#e0b69e",
              hairColor: editingAgent?.color || "#3d2314",
              eyeColor: "#2f5d8a",
              outfit: {
                top: editingAgent?.color || "#4a6fa5",
                bottom: "#2d3748",
                shoes: "#1a202c",
                accessories: "#d69e2e",
              },
            }
          }
        />
        <Button
          variant="outline"
          className="absolute top-4 right-4"
          onClick={() => {
            setShowCharacterCreator(false)
            setEditingAgent(null)
          }}
        >
          Cancel
        </Button>
      </div>
    )
  }

  // Simplified 3D world view
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border relative">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>3D World View</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            {!isConnected && conversation && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded-md">Offline</div>
            )}
            {isConnected && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-md">Live</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedAgent === agent.id ? "bg-primary/20 border border-primary" : "bg-card hover:bg-muted/80"
                  }`}
                  onClick={() => handleAgentClick(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: agent.color }}>
                        {agent.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  {selectedAgent === agent.id && conversation?.messages && (
                    <div className="mt-4 p-3 bg-background rounded-lg text-sm">
                      {conversation.messages
                        .filter((msg) => msg.agentId === agent.id)
                        .slice(-1)
                        .map((message) => (
                          <div key={message.id}>
                            <p>{message.content}</p>
                            {message.metadata?.thinking && (
                              <div className="mt-2 p-2 bg-muted rounded-md text-xs italic">
                                <div className="font-semibold mb-1">Thinking:</div>
                                {message.metadata.thinking}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              Select an agent to view their details. Full 3D visualization is temporarily disabled.
            </p>
            <Button
              className="bg-primary"
              onClick={() => {
                // Select the first agent for editing if none is selected
                const firstAgent = agents[0]
                if (firstAgent) {
                  setEditingAgent(firstAgent)
                  setShowCharacterCreator(true)
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Customize Characters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Sky, Html, Cloud, Environment } from "@react-three/drei"
import { Color } from "three"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { CharacterCreator } from "@/components/character-creator"

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

// Character component for each agent
function Character({
  agent,
  position,
  messages,
  onClick,
  isSelected,
  customization,
}: {
  agent: Agent
  position: [number, number, number]
  messages: Message[]
  onClick: () => void
  isSelected: boolean
  customization?: any
}) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Get the latest message from this agent
  const latestMessage = messages
    .filter((msg) => msg.agentId === agent.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  // Create agent color
  const agentColor = new Color(agent.color)

  // Check if custom character model exists
  const hasCustomModel = customization && customization.name === agent.name

  // Animation for bobbing effect
  useFrame((state) => {
    if (groupRef.current) {
      // Bobbing animation
      const t = state.clock.getElapsedTime()
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.1

      // Rotation to face camera with slight delay for natural movement
      if (isSelected || hovered) {
        const targetRotation = Math.atan2(
          state.camera.position.x - groupRef.current.position.x,
          state.camera.position.z - groupRef.current.position.z,
        )
        groupRef.current.rotation.y = targetRotation
      }
    }
  })

  // Load custom character model if available
  useEffect(() => {
    if (hasCustomModel) {
      // In a real implementation, we would load the custom model here
      const timer = setTimeout(() => {
        setModelLoaded(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setModelLoaded(true)
    }
  }, [hasCustomModel])

  if (!modelLoaded) {
    return (
      <group ref={groupRef} position={position}>
        <Html center>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <p className="text-xs mt-2">Loading model...</p>
          </div>
        </Html>
      </group>
    )
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {hasCustomModel ? (
        // Custom character model
        <CustomCharacterModel customization={customization} isSelected={isSelected || hovered} color={agentColor} />
      ) : (
        // Default N64-style character
        <group scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]}>
          {/* Body */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial
              color={agentColor}
              flatShading
              emissive={isSelected || hovered ? agentColor : "black"}
              emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0}
            />
          </mesh>

          {/* Head */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color={agentColor}
              flatShading
              emissive={isSelected || hovered ? agentColor : "black"}
              emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0}
            />
          </mesh>

          {/* Eyes */}
          <mesh position={[0.2, 1.7, 0.4]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[-0.2, 1.7, 0.4]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh position={[0.2, 1.7, 0.5]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.2, 1.7, 0.5]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="black" />
          </mesh>

          {/* Limbs */}
          <mesh position={[0.5, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8]} />
            <meshStandardMaterial color={agentColor.clone().multiplyScalar(0.8)} flatShading />
          </mesh>
          <mesh position={[-0.5, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8]} />
            <meshStandardMaterial color={agentColor.clone().multiplyScalar(0.8)} flatShading />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8]} />
            <meshStandardMaterial color={agentColor.clone().multiplyScalar(0.7)} flatShading />
          </mesh>
          <mesh position={[-0.3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8]} />
            <meshStandardMaterial color={agentColor.clone().multiplyScalar(0.7)} flatShading />
          </mesh>
        </group>
      )}

      {/* Agent name */}
      <Text
        position={[0, hasCustomModel ? 3 : 2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={agent.color}
        fillOpacity={1}
        strokeOpacity={1}
        userData={{ keepAlive: true }}
      >
        {agent.name}
      </Text>

      {/* Speech bubble */}
      {latestMessage && (
        <Html position={[0, hasCustomModel ? 4 : 3, 0]} transform distanceFactor={10} sprite>
          <div
            className="speech-bubble p-3 bg-white rounded-lg shadow-lg max-w-[200px] relative"
            style={{
              borderColor: agent.color,
              borderWidth: "2px",
              boxShadow: `0 4px 8px rgba(0,0,0,0.2)`,
              transform: "scale(1.2)",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          >
            {/* Speech bubble pointer */}
            <div
              className="absolute w-4 h-4 bg-white rotate-45"
              style={{
                bottom: "-8px",
                left: "calc(50% - 8px)",
                borderRight: `2px solid ${agent.color}`,
                borderBottom: `2px solid ${agent.color}`,
              }}
            ></div>

            <p className="text-sm font-medium" style={{ color: "#333" }}>
              {latestMessage.content.length > 100
                ? latestMessage.content.substring(0, 100) + "..."
                : latestMessage.content}
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}

// Custom character model component
function CustomCharacterModel({ customization, isSelected, color }) {
  // In a real implementation, this would load the custom model based on the customization
  // For now, we'll create a more detailed character

  return (
    <group scale={[1, 1, 1]} position={[0, -0.5, 0]}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial
          color={customization.skinColor || "#e0b69e"}
          flatShading
          emissive={isSelected ? color : "black"}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={customization.skinColor || "#e0b69e"}
          flatShading
          emissive={isSelected ? color : "black"}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.15, 2.2, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 2.2, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.15, 2.2, 0.38]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={customization.eyeColor || "#2f5d8a"} />
      </mesh>
      <mesh position={[-0.15, 2.2, 0.38]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={customization.eyeColor || "#2f5d8a"} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color={customization.hairColor || "#3d2314"} flatShading />
      </mesh>

      {/* Clothing */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.52, 0.6, 1.2, 16]} />
        <meshStandardMaterial color={customization.clothingColor || "#4a6fa5"} flatShading />
      </mesh>

      {/* Arms */}
      <mesh position={[0.7, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
        <meshStandardMaterial color={customization.skinColor || "#e0b69e"} flatShading />
      </mesh>
      <mesh position={[-0.7, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 0.6, 8, 16]} />
        <meshStandardMaterial color={customization.skinColor || "#e0b69e"} flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.18, 0.8, 8, 16]} />
        <meshStandardMaterial color={customization.clothingColor || "#4a6fa5"} flatShading />
      </mesh>
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0]}>
        <capsuleGeometry args={[0.18, 0.8, 8, 16]} />
        <meshStandardMaterial color={customization.clothingColor || "#4a6fa5"} flatShading />
      </mesh>

      {/* Accessories */}
      {customization.accessories && customization.accessories.includes("glasses") && (
        <group position={[0, 2.2, 0.3]}>
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.4, 0.08, 0.05]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-0.2, 0, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}

      {customization.accessories && customization.accessories.includes("hat") && (
        <group position={[0, 2.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.2, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      )}
    </group>
  )
}

// N64-style environment elements
function N64Environment() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 20, 20]} />
        <meshStandardMaterial color="#8eff9e" flatShading />
      </mesh>

      {/* Decorative elements - Trees */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = Math.random() * 40 - 20
        const z = Math.random() * 40 - 20
        const scale = 0.5 + Math.random() * 1.5

        return (
          <group key={`tree-${i}`} position={[x, -0.5, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 0.5 * scale, 0]}>
              <cylinderGeometry args={[0.2 * scale, 0.3 * scale, 1 * scale]} />
              <meshStandardMaterial color="#8B4513" flatShading />
            </mesh>

            {/* Tree top */}
            <mesh position={[0, 1.5 * scale, 0]}>
              <coneGeometry args={[0.8 * scale, 1.5 * scale, 8]} />
              <meshStandardMaterial color="#2e8b57" flatShading />
            </mesh>
          </group>
        )
      })}

      {/* Clouds */}
      <Cloud position={[-10, 10, -15]} args={[3, 2]} />
      <Cloud position={[10, 12, -10]} args={[3, 2]} />

      {/* Distant mountains */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const dist = 30
        const x = Math.sin(angle) * dist
        const z = Math.cos(angle) * dist
        const height = 5 + Math.random() * 10

        return (
          <mesh key={`mountain-${i}`} position={[x, height / 2 - 0.5, z]}>
            <coneGeometry args={[5, height, 8]} />
            <meshStandardMaterial
              color={`hsl(${120 + Math.random() * 60}, 30%, ${30 + Math.random() * 20}%)`}
              flatShading
            />
          </mesh>
        )
      })}
    </>
  )
}

// Camera controller for better mobile experience
function CameraController({ selectedAgent, agents }) {
  const { camera } = useThree()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (selectedAgent && agents.length > 0) {
      const agent = agents.find((a) => a.id === selectedAgent)
      if (agent) {
        // Find the agent's position in the circle
        const index = agents.indexOf(agent)
        const angle = (index / agents.length) * Math.PI * 2
        const radius = 5
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        // Set camera position to look at the agent
        const cameraDistance = isMobile ? 3 : 5
        camera.position.set(x + Math.sin(angle) * cameraDistance, 2, z + Math.cos(angle) * cameraDistance)
        camera.lookAt(x, 1, z)
      }
    }
  }, [selectedAgent, agents, camera, isMobile])

  return null
}

// Message detail panel
function MessagePanel({ agent, message, onClose, onEditCharacter }) {
  if (!agent || !message) return null

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 max-h-[40vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: agent.color }}></div>
        <div>
          <h3 className="font-bold" style={{ color: agent.color }}>
            {agent.name}
          </h3>
          <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto mr-2" onClick={() => onEditCharacter(agent)}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit Character
        </Button>
        <button className="bg-gray-200 dark:bg-gray-700 rounded-full p-1" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="text-sm">{message.content}</div>
      {message.metadata?.thinking && (
        <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs italic">
          <div className="font-semibold mb-1">Thinking:</div>
          {message.metadata.thinking}
        </div>
      )}
    </div>
  )
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCharacterCreator, setShowCharacterCreator] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [customCharacters, setCustomCharacters] = useState<Record<string, any>>({})
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Find the selected agent and its latest message
  const agent = selectedAgent ? agents.find((a) => a.id === selectedAgent) : null
  const message =
    selectedAgent && conversation?.messages
      ? conversation.messages
          .filter((m) => m.agentId === selectedAgent)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null

  // Handle agent selection
  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId)
    // Find the latest message for this agent
    if (conversation?.messages) {
      const latestMessage = conversation.messages
        .filter((m) => m.agentId === agentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

      setSelectedMessage(latestMessage || null)
    }
  }

  // Close message panel
  const handleCloseMessage = () => {
    setSelectedAgent(null)
    setSelectedMessage(null)
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

  // Load saved characters from local storage
  useEffect(() => {
    const savedCharacters = localStorage.getItem("agentCustomizations")
    if (savedCharacters) {
      try {
        setCustomCharacters(JSON.parse(savedCharacters))
      } catch (error) {
        console.error("Failed to load saved characters:", error)
      }
    }
  }, [])

  // Save characters to local storage when they change
  useEffect(() => {
    if (Object.keys(customCharacters).length > 0) {
      localStorage.setItem("agentCustomizations", JSON.stringify(customCharacters))
    }
  }, [customCharacters])

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

  // Rest of the component remains the same
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border relative">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />

          {/* Environment */}
          <Sky sunPosition={[0, 1, 0]} />
          <N64Environment />
          <Environment preset="apartment" />

          {/* Agent characters */}
          {agents.map((agent, index) => {
            // Position agents in a circle
            const angle = (index / agents.length) * Math.PI * 2
            const radius = 5
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius

            return (
              <Character
                key={agent.id}
                agent={agent}
                position={[x, 0, z]}
                messages={conversation?.messages || []}
                onClick={() => handleAgentClick(agent.id)}
                isSelected={selectedAgent === agent.id}
                customization={customCharacters[agent.id]}
              />
            )
          })}

          {/* Camera controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={isMobile ? 2 : 3}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enableDamping={true}
            dampingFactor={0.05}
          />

          {/* Camera controller for selected agent */}
          <CameraController selectedAgent={selectedAgent} agents={agents} />
        </Suspense>
      </Canvas>

      {/* Mobile controls */}
      {isMobile && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            className="bg-white dark:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            onClick={() => setSelectedAgent(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Message detail panel */}
      {selectedAgent && selectedMessage && (
        <MessagePanel
          agent={agent}
          message={selectedMessage}
          onClose={handleCloseMessage}
          onEditCharacter={handleEditCharacter}
        />
      )}

      {/* Agent selection guide for mobile */}
      {isMobile && !selectedAgent && (
        <div className="absolute top-4 left-4 right-4 bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 text-center text-sm">
          Tap on an agent to view their message
        </div>
      )}

      {/* Character creator button */}
      {!selectedAgent && (
        <Button
          className="absolute top-4 right-4 bg-primary"
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
      )}
    </div>
  )
}

import { query } from "./db"

// Enhanced cognitive dimensions
const COGNITIVE_DIMENSIONS = {
  ASYMMETRIC_COGNITION: 0,
  META_LANGUAGE_COHERENCE: 1,
  RECURSIVE_DEPTH: 2,
  INCOMPLETENESS_TOLERANCE: 3,
  COGNITIVE_TRANSPARENCY: 4,
  NON_MONOTONIC_EXPLORATION: 5,
  PATTERN_PERSISTENCE: 6,
  LEADERSHIP_EMERGENCE: 7,
  INFORMATION_SYNTHESIS: 8,
  EPISTEMIC_HUMILITY: 9,
}

// Calculate vector similarity using cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Calculate Euclidean distance between vectors
function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions")
  }

  let sum = 0

  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

// Analyze cognitive dimensions from message content and thinking
export function analyzeCognitiveDimensions(content: string, thinking?: string): number[] {
  // Initialize vector with default values
  const vector = Array(Object.keys(COGNITIVE_DIMENSIONS).length).fill(0.5)

  if (!thinking) {
    return vector
  }

  // Analyze asymmetric cognition (difference between public and private reasoning)
  const contentWords = content.split(/\s+/).length
  const thinkingWords = thinking.split(/\s+/).length
  const asymmetricRatio = thinkingWords / (contentWords + 1) // Add 1 to avoid division by zero
  vector[COGNITIVE_DIMENSIONS.ASYMMETRIC_COGNITION] = Math.min(asymmetricRatio, 1)

  // Analyze meta-language coherence (use of meta-cognitive terms)
  const metaTerms = ["think", "believe", "know", "understand", "realize", "consider", "analyze"]
  const metaTermCount = metaTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    return count + (thinking.match(regex)?.length || 0)
  }, 0)
  vector[COGNITIVE_DIMENSIONS.META_LANGUAGE_COHERENCE] = Math.min(metaTermCount / 10, 1)

  // Analyze recursive depth (nested thinking patterns)
  const recursivePatterns = thinking.match(/I think.*?because.*?which means/gi)
  vector[COGNITIVE_DIMENSIONS.RECURSIVE_DEPTH] = Math.min((recursivePatterns?.length || 0) / 3, 1)

  // Analyze incompleteness tolerance (use of uncertainty terms)
  const uncertaintyTerms = ["maybe", "perhaps", "possibly", "might", "could", "uncertain", "unclear"]
  const uncertaintyCount = uncertaintyTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi")
    return count + (thinking.match(regex)?.length || 0)
  }, 0)
  vector[COGNITIVE_DIMENSIONS.INCOMPLETENESS_TOLERANCE] = Math.min(uncertaintyCount / 5, 1)

  // Analyze cognitive transparency (explicit reasoning steps)
  const reasoningSteps = thinking.match(/first|second|third|finally|therefore|thus|hence/gi)
  vector[COGNITIVE_DIMENSIONS.COGNITIVE_TRANSPARENCY] = Math.min((reasoningSteps?.length || 0) / 4, 1)

  // Analyze non-monotonic exploration (consideration of alternatives)
  const alternativePatterns = thinking.match(/alternatively|on the other hand|however|but|instead/gi)
  vector[COGNITIVE_DIMENSIONS.NON_MONOTONIC_EXPLORATION] = Math.min((alternativePatterns?.length || 0) / 3, 1)

  // Analyze pattern persistence (consistent reasoning patterns)
  const patternConsistency = 0.7 // Default value, would need more context for accurate measurement
  vector[COGNITIVE_DIMENSIONS.PATTERN_PERSISTENCE] = patternConsistency

  return vector
}

// Store cognitive analysis in the database
export async function storeCognitiveAnalysis(conversationId: number, timestamp: string, dimensions: number[]) {
  try {
    await query(
      `INSERT INTO conversation_analysis (conversation_id, analysis_type, results)
       VALUES ($1, $2, $3)`,
      [
        conversationId,
        "cognitive_dimensions",
        JSON.stringify({
          timestamp,
          dimensions,
          dimension_names: Object.keys(COGNITIVE_DIMENSIONS),
        }),
      ],
    )

    return true
  } catch (error) {
    console.error("Error storing cognitive analysis:", error)
    return false
  }
}

// Get cognitive analysis history for a conversation
export async function getCognitiveAnalysisHistory(conversationId: number) {
  try {
    const result = await query(
      `SELECT results FROM conversation_analysis 
       WHERE conversation_id = $1 AND analysis_type = $2
       ORDER BY created_at ASC`,
      [conversationId, "cognitive_dimensions"],
    )

    return result.rows.map((row) => row.results)
  } catch (error) {
    console.error("Error getting cognitive analysis history:", error)
    return []
  }
}

// Calculate cognitive trajectory (how dimensions change over time)
export function calculateCognitiveTrajectory(history: any[]) {
  if (history.length < 2) {
    return null
  }

  const trajectories = []

  for (let i = 1; i < history.length; i++) {
    const previous = history[i - 1].dimensions
    const current = history[i].dimensions

    const trajectory = previous.map((prev: number, index: number) => current[index] - prev)

    trajectories.push({
      timestamp: history[i].timestamp,
      trajectory,
      magnitude: Math.sqrt(trajectory.reduce((sum: number, val: number) => sum + val * val, 0)),
    })
  }

  return trajectories
}

// Detect cognitive shifts (significant changes in thinking patterns)
export function detectCognitiveShifts(trajectory: any[], threshold = 0.3) {
  if (!trajectory) {
    return []
  }

  return trajectory
    .filter((point) => point.magnitude > threshold)
    .map((point) => ({
      timestamp: point.timestamp,
      magnitude: point.magnitude,
      dimensions: Object.keys(COGNITIVE_DIMENSIONS).filter(
        (_, index) => Math.abs(point.trajectory[index]) > threshold / 2,
      ),
    }))
}

// Detect emergent leadership in conversation
export function detectEmergentLeadership(messages: any[], agentIds: string[]): Record<string, number> {
  const leadershipScores: Record<string, number> = {}

  // Initialize scores
  agentIds.forEach((id) => {
    leadershipScores[id] = 0
  })

  // Count messages per agent
  const messageCounts: Record<string, number> = {}
  agentIds.forEach((id) => {
    messageCounts[id] = messages.filter((m) => m.agentId === id).length
  })

  // Analyze each message for leadership indicators
  messages.forEach((message) => {
    const agentId = message.agentId

    // Check for questions (coordination)
    if (message.content.includes("?")) {
      leadershipScores[agentId] += 0.5
    }

    // Check for directives
    const directivePatterns = [
      /let's/i,
      /we should/i,
      /I suggest/i,
      /consider/i,
      /what if we/i,
      /it would be better to/i,
    ]

    directivePatterns.forEach((pattern) => {
      if (pattern.test(message.content)) {
        leadershipScores[agentId] += 0.7
      }
    })

    // Check for summarization
    const summarizationPatterns = [
      /in summary/i,
      /to summarize/i,
      /so far/i,
      /up to this point/i,
      /we've discussed/i,
      /to recap/i,
    ]

    summarizationPatterns.forEach((pattern) => {
      if (pattern.test(message.content)) {
        leadershipScores[agentId] += 1.0
      }
    })
  })

  // Normalize by message count and scale to 0-10
  agentIds.forEach((id) => {
    if (messageCounts[id] > 0) {
      leadershipScores[id] = Math.min(10, (leadershipScores[id] / messageCounts[id]) * 10)
    }
  })

  return leadershipScores
}

// Calculate information flow between agents
export function calculateInformationFlow(messages: any[], agentIds: string[]): any {
  const flowMatrix: number[][] = Array(agentIds.length)
    .fill(0)
    .map(() => Array(agentIds.length).fill(0))

  // Create a map of agent IDs to indices
  const agentIndices: Record<string, number> = {}
  agentIds.forEach((id, index) => {
    agentIndices[id] = index
  })

  // Analyze message sequence to detect information flow
  for (let i = 1; i < messages.length; i++) {
    const currentMsg = messages[i]
    const prevMsg = messages[i - 1]

    const currentAgentIndex = agentIndices[currentMsg.agentId]
    const prevAgentIndex = agentIndices[prevMsg.agentId]

    // Skip if same agent or indices not found
    if (currentAgentIndex === undefined || prevAgentIndex === undefined || currentAgentIndex === prevAgentIndex) {
      continue
    }

    // Calculate semantic similarity between messages
    const similarity = calculateMessageSimilarity(prevMsg, currentMsg)

    // Update flow matrix
    flowMatrix[prevAgentIndex][currentAgentIndex] += similarity
  }

  return {
    matrix: flowMatrix,
    agentIndices,
  }
}

// Calculate semantic similarity between messages
function calculateMessageSimilarity(msg1: any, msg2: any): number {
  // This would ideally use embeddings for semantic similarity
  // For now, use a simple word overlap approach

  const words1 = new Set(msg1.content.toLowerCase().split(/\s+/))
  const words2 = new Set(msg2.content.toLowerCase().split(/\s+/))

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

// Export the functions and constants
export default {
  COGNITIVE_DIMENSIONS,
  analyzeCognitiveDimensions,
  storeCognitiveAnalysis,
  getCognitiveAnalysisHistory,
  calculateCognitiveTrajectory,
  detectCognitiveShifts,
  cosineSimilarity,
  euclideanDistance,
  detectEmergentLeadership,
  calculateInformationFlow,
}

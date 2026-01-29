import type { PromptStateJSON } from '@/types/PromptState'
import type { TrophyStats } from '@/types/TrophyTypes'

/**
 * Extract trophy stats from PromptStateJSON
 * 
 * @param promptStateJSON - The complete prompt state from Phase 2
 * @param editCount - Number of edits made in Phase 4
 * @returns TrophyStats object for display
 */
export function extractStats(
  promptStateJSON: PromptStateJSON,
  editCount: number = 0
): TrophyStats {
  const { variables, startedAt, completedAt, synthesizedPrompt } = promptStateJSON

  // Calculate time spent (in seconds) with validation
  // Ensure completedAt >= startedAt to prevent negative values from clock skew
  const timeSpent = completedAt && startedAt && completedAt >= startedAt
    ? Math.floor((completedAt - startedAt) / 1000)
    : 0

  // Extract variable names
  const variablesUsed = variables.map(v => v.variable)

  // Calculate creativity score based on answer diversity and length
  const creativityScore = calculateCreativityScore(variables)

  // Get prompt length
  const promptLength = synthesizedPrompt?.length || 0

  return {
    totalQuestions: variables.length,
    totalEdits: editCount,
    timeSpent,
    variablesUsed,
    creativityScore,
    promptLength
  }
}

/**
 * Calculate creativity score (1-100) based on answer characteristics
 * 
 * Scoring breakdown:
 * - Base score: 20 points for completing questions
 * - Length score: 30 points max for detailed answers (1 point per 2 chars avg)
 * - Diversity score: 30 points max for vocabulary richness (2 points per unique word)
 * - Descriptiveness: 20 points max for multi-word answers (5 points per descriptive answer)
 * 
 * Typical ranges:
 * - Basic answers (1-2 words each): 40-60 points
 * - Good answers (3-5 words each): 60-80 points
 * - Excellent answers (5+ words, varied): 80-100 points
 */
function calculateCreativityScore(variables: PromptStateJSON['variables']): number {
  if (variables.length === 0) return 0

  let score = 0

  // Base score: 20 points for completing questions
  score += 20

  // Length score: 30 points max for detailed answers
  // Rationale: Reward thoughtful, detailed responses (avg > 20 chars = full points)
  const avgLength = variables.reduce((sum, v) => sum + v.answer.length, 0) / variables.length
  score += Math.min(30, Math.floor(avgLength / 2))

  // Diversity score: 30 points max for vocabulary richness
  // Rationale: Reward varied word usage (1 point per 2 unique words)
  // Typical range: 10-15 unique words = 20-30 points
  const uniqueWords = new Set(
    variables.flatMap(v => v.answer.toLowerCase().split(/\s+/))
  ).size
  score += Math.min(30, uniqueWords * 2)

  // Descriptiveness score: 20 points max for multi-word answers
  // Rationale: Reward answers with multiple words (5 points per descriptive answer)
  const descriptiveAnswers = variables.filter(v => 
    v.answer.split(/\s+/).length > 2
  ).length
  score += Math.min(20, descriptiveAnswers * 5)

  return Math.min(100, Math.max(1, score))
}

/**
 * Format time spent as human-readable string
 */
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

import type { PromptStateJSON, PromptVariableEntry } from '@/types/PromptState'

/**
 * Synthesizes a narrative prompt from structured Prompt_State_JSON
 * 
 * Format: [Subject + Action] + [Variables] + [Context] + [Style]
 * Example: "A robot doing a backflip, with smooth metallic texture, 
 *           in bright sunny lighting, feeling playful and energetic,
 *           floating in space with stars, in a vibrant cartoon style"
 */
export function synthesizePrompt(promptState: PromptStateJSON): string {
  const { intentStatement, variables } = promptState

  // Validate input
  if (!intentStatement || !intentStatement.trim()) {
    return 'A creative artwork' // Fallback for empty intent
  }

  if (!Array.isArray(variables) || variables.length === 0) {
    return intentStatement // Return intent if no variables
  }

  // Start with the child's original intent (subject + action)
  let prompt = intentStatement

  // Group variables by category for natural flow
  const variablesByCategory = groupVariablesByCategory(variables)

  // Add texture/material variables
  const textureVars = variablesByCategory.variable || []
  if (textureVars.length > 0) {
    const textureDescriptions = textureVars.map(v => v.answer).join(', ')
    prompt += `, with ${textureDescriptions}`
  }

  // Add context variables (lighting, background, era)
  const contextVars = variablesByCategory.context || []
  if (contextVars.length > 0) {
    for (const contextVar of contextVars) {
      if (contextVar.variable === 'lighting') {
        prompt += `, in ${contextVar.answer} lighting`
      } else if (contextVar.variable === 'background') {
        prompt += `, ${contextVar.answer}`
      } else if (contextVar.variable === 'era') {
        prompt += `, set in ${contextVar.answer}`
      } else if (contextVar.variable === 'mood') {
        prompt += `, feeling ${contextVar.answer}`
      }
    }
  }

  // Add style at the end
  const styleVar = variables.find(v => v.variable === 'style')
  if (styleVar) {
    prompt += `, in a ${styleVar.answer} style`
  }

  // Clean up and ensure proper formatting
  prompt = prompt
    .replace(/\s+/g, ' ') // Remove extra spaces
    .replace(/,\s*,/g, ',') // Remove double commas
    .trim()

  return prompt
}

/**
 * Groups variables by their color category for organized synthesis
 */
function groupVariablesByCategory(
  variables: PromptVariableEntry[]
): Record<string, PromptVariableEntry[]> {
  return variables.reduce((acc, variable) => {
    const category = variable.colorCategory
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(variable)
    return acc
  }, {} as Record<string, PromptVariableEntry[]>)
}

/**
 * Extracts subject from intent statement for fallback scenarios
 */
export function extractSubject(intentStatement: string): string {
  // Remove common stop words and extract main subject
  const stopWords = ['a', 'an', 'the', 'is', 'doing', 'in', 'on', 'at']
  const words = intentStatement.toLowerCase().split(' ')
  const meaningfulWords = words.filter(word => 
    !stopWords.includes(word) && word.length > 2
  )
  
  return meaningfulWords.slice(0, 3).join(' ') || 'creation'
}

/**
 * Synthesizes enhancement prompt for image-to-image generation
 * Separates original intent from style instructions for better preservation
 * 
 * @param promptState - The complete prompt state from Phase 2
 * @returns Object with originalIntent and styleInstructions separated
 */
export function synthesizeEnhancementPrompt(
  promptState: PromptStateJSON
): { originalIntent: string; styleInstructions: string } {
  const { intentStatement, variables } = promptState

  // Original intent (what the child drew)
  const originalIntent = intentStatement || 'A creative artwork'

  // Style instructions (how to enhance it)
  const instructions: string[] = []

  // Validate variables
  if (!Array.isArray(variables) || variables.length === 0) {
    return { originalIntent, styleInstructions: '' }
  }

  // Add texture/material
  const textureVars = variables.filter(v => v.colorCategory === 'variable')
  if (textureVars.length > 0) {
    instructions.push(`Texture: ${textureVars.map(v => v.answer).join(', ')}`)
  }

  // Add lighting
  const lightingVar = variables.find(v => v.variable === 'lighting')
  if (lightingVar) {
    instructions.push(`Lighting: ${lightingVar.answer}`)
  }

  // Add mood
  const moodVar = variables.find(v => v.variable === 'mood')
  if (moodVar) {
    instructions.push(`Mood: ${moodVar.answer}`)
  }

  // Add background
  const backgroundVar = variables.find(v => v.variable === 'background')
  if (backgroundVar) {
    instructions.push(`Background: ${backgroundVar.answer}`)
  }

  // Add style
  const styleVar = variables.find(v => v.variable === 'style')
  if (styleVar) {
    instructions.push(`Art Style: ${styleVar.answer}`)
  }

  return {
    originalIntent,
    styleInstructions: instructions.join('\n')
  }
}

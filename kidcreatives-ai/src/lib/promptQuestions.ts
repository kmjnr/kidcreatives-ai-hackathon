import { PromptVariable } from '@/types/PromptState'

/**
 * Color categories for UI styling
 */
export const VARIABLE_COLOR_CATEGORIES: Record<PromptVariable, 'subject' | 'variable' | 'context'> = {
  [PromptVariable.Subject]: 'subject',
  [PromptVariable.SubjectAction]: 'subject',
  [PromptVariable.Texture]: 'variable',
  [PromptVariable.Material]: 'variable',
  [PromptVariable.Style]: 'variable',
  [PromptVariable.Lighting]: 'context',
  [PromptVariable.Background]: 'context',
  [PromptVariable.Era]: 'context',
  [PromptVariable.Mood]: 'context',
  [PromptVariable.ColorPalette]: 'context'
}

/**
 * Select which variables to ask about
 * Returns list of variables in order
 */
export function selectVariables(count: number = 4): PromptVariable[] {
  const allVariables = [
    PromptVariable.Texture,
    PromptVariable.Lighting,
    PromptVariable.Mood,
    PromptVariable.Background,
    PromptVariable.Style
  ]
  
  return allVariables.slice(0, Math.min(count, allVariables.length))
}

/**
 * Get color category for a variable (for UI styling)
 */
export function getColorCategory(variable: PromptVariable): 'subject' | 'variable' | 'context' {
  return VARIABLE_COLOR_CATEGORIES[variable] || 'variable'
}

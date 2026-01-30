import { useState, useCallback } from 'react'
import { generateContextualQuestion } from '@/lib/gemini/textClient'
import type { QuestionGenerationResult, PromptVariable } from '@/types/PromptState'

interface UseGeminiTextReturn {
  question: QuestionGenerationResult | null
  isGenerating: boolean
  error: string | null
  generateQuestion: (
    intentStatement: string,
    visionAnalysis: string,
    variable: PromptVariable,
    colorCategory: 'subject' | 'variable' | 'context'
  ) => Promise<void>
  reset: () => void
}

export function useGeminiText(): UseGeminiTextReturn {
  const [question, setQuestion] = useState<QuestionGenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuestion = useCallback(async (
    intentStatement: string,
    visionAnalysis: string,
    variable: PromptVariable,
    colorCategory: 'subject' | 'variable' | 'context'
  ) => {
    setIsGenerating(true)
    setError(null)
    setQuestion(null)

    try {
      const result = await generateContextualQuestion(
        intentStatement,
        visionAnalysis,
        variable,
        colorCategory
      )
      setQuestion(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Question generation failed'
      setError(errorMessage)
      console.error('Question generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setQuestion(null)
    setError(null)
    setIsGenerating(false)
  }, [])

  return {
    question,
    isGenerating,
    error,
    generateQuestion,
    reset
  }
}

import { useState, useCallback } from 'react'
import { generateImage } from '@/lib/gemini/imageClient'
import type { ImageGenerationResult } from '@/types/GeminiTypes'

interface UseGeminiImageReturn {
  generatedImage: ImageGenerationResult | null
  isGenerating: boolean
  error: string | null
  generate: (
    originalIntent: string,
    styleInstructions: string,
    referenceImage?: string,
    referenceMimeType?: string
  ) => Promise<void>
  reset: () => void
}

export function useGeminiImage(): UseGeminiImageReturn {
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (
    originalIntent: string,
    styleInstructions: string,
    referenceImage?: string,
    referenceMimeType?: string
  ) => {
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      // Combine intent and style for full prompt
      const fullPrompt = styleInstructions 
        ? `${originalIntent}\n\n${styleInstructions}`
        : originalIntent
      
      const result = await generateImage(fullPrompt, referenceImage, referenceMimeType)
      setGeneratedImage(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image generation failed'
      setError(errorMessage)
      console.error('Image generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setGeneratedImage(null)
    setError(null)
    setIsGenerating(false)
  }, [])

  return {
    generatedImage,
    isGenerating,
    error,
    generate,
    reset
  }
}

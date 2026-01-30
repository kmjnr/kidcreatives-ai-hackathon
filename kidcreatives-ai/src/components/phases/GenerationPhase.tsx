import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sparky } from '@/components/ui/Sparky'
import { useGeminiImage } from '@/hooks/useGeminiImage'
import { synthesizeEnhancementPrompt } from '@/lib/promptSynthesis'
import { imageToDataURL } from '@/lib/gemini/imageClient'
import type { PromptStateJSON } from '@/types/PromptState'

interface GenerationPhaseProps {
  originalImage: string // base64
  imageMimeType: string
  promptStateJSON: string // JSON string from Phase 2
  onBack: () => void
  onNext: (generatedImageBase64: string, skipRefinement?: boolean) => void
}

export function GenerationPhase({
  originalImage,
  imageMimeType,
  promptStateJSON,
  onBack,
  onNext
}: GenerationPhaseProps) {
  const [synthesizedPrompt, setSynthesizedPrompt] = useState<string>('')
  const [sparkyMessage, setSparkyMessage] = useState('')
  const { generatedImage, isGenerating, error, generate, reset } = useGeminiImage()

  // Parse and synthesize prompt on mount
  useEffect(() => {
    try {
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
      const { originalIntent, styleInstructions } = synthesizeEnhancementPrompt(promptState)
      
      // Store for display
      setSynthesizedPrompt(styleInstructions 
        ? `${originalIntent}\n\n${styleInstructions}`
        : originalIntent
      )
      
      setSparkyMessage("I'm enhancing YOUR drawing with AI magic! This might take a few seconds...")
      
      // Pass original image as reference for image-to-image generation
      generate(originalIntent, styleInstructions, originalImage, imageMimeType)
    } catch (err) {
      console.error('Failed to parse prompt state:', err)
      setSparkyMessage("Oops! Something went wrong with your prompt. Let's try again!")
    }
  }, [promptStateJSON, originalImage, imageMimeType, generate])

  // Update Sparky message based on generation state
  useEffect(() => {
    if (isGenerating) {
      setSparkyMessage("I'm enhancing YOUR drawing with AI magic! Watch closely...")
    } else if (error) {
      setSparkyMessage("Hmm, something went wrong. But don't worry, we can try again!")
    } else if (generatedImage) {
      setSparkyMessage("Ta-da! It's YOUR drawing, but even more amazing! Do you recognize your creation? 🎨")
    }
  }, [isGenerating, error, generatedImage])

  const handleRetry = () => {
    reset()
    setSparkyMessage("Let's try enhancing your drawing again!")
    
    try {
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
      const { originalIntent, styleInstructions } = synthesizeEnhancementPrompt(promptState)
      generate(originalIntent, styleInstructions, originalImage, imageMimeType)
    } catch (err) {
      console.error('Failed to retry:', err)
    }
  }

  const handleFinalize = () => {
    if (generatedImage) {
      onNext(generatedImage.imageBytes, true) // Skip refinement
    }
  }

  const handleRefine = () => {
    if (generatedImage) {
      onNext(generatedImage.imageBytes, false) // Go to refinement
    }
  }

  // Convert original image base64 to data URL (memoized to prevent recreation)
  const originalImageDataURL = useMemo(
    () => `data:${imageMimeType};base64,${originalImage}`,
    [imageMimeType, originalImage]
  )

  const generatedImageDataURL = useMemo(
    () => generatedImage ? imageToDataURL(generatedImage.imageBytes, generatedImage.mimeType) : null,
    [generatedImage]
  )

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Phase 3: The Big Reveal! 🎨
          </h1>
          <p className="text-lg text-gray-600">
            Watch your creative decisions come to life
          </p>
        </motion.div>

        {/* Sparky Coach */}
        <Sparky
          state={isGenerating ? 'thinking' : error ? 'waiting' : 'success'}
          message={sparkyMessage}
          className="mb-8"
        />

        {/* Side-by-Side Image Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Original Sketch */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Your Original Sketch
            </h2>
            <div className="aspect-square bg-white/50 backdrop-blur-sm rounded-lg overflow-hidden">
              <img
                src={originalImageDataURL}
                alt="Original sketch"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          {/* Generated Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              AI-Enhanced Version
            </h2>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isGenerating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-subject-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Creating magic...</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-4"
                  >
                    <p className="text-red-600 mb-4">Generation failed</p>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                  </motion.div>
                )}

                {generatedImage && generatedImageDataURL && (
                  <motion.img
                    key="generated"
                    src={generatedImageDataURL}
                    alt="AI-generated artwork"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-contain"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Synthesized Prompt Display */}
        {synthesizedPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Your AI Prompt (The Instructions You Created):
            </h3>
            <p className="text-gray-700 leading-relaxed font-mono text-sm bg-gray-50 p-4 rounded">
              {synthesizedPrompt}
            </p>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-between items-center"
        >
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Questions
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleRefine}
              disabled={!generatedImage || isGenerating}
              variant="outline"
              className="gap-2"
            >
              Edit/Refine
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleFinalize}
              disabled={!generatedImage || isGenerating}
              className="gap-2 bg-action-green hover:bg-green-600 text-white"
            >
              Finalize & Get Trophy 🏆
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

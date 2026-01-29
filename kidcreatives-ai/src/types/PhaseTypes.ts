export enum Phase {
  Handshake = 'handshake',
  PromptBuilder = 'prompt-builder',
  Generation = 'generation',
  Refinement = 'refinement',
  Trophy = 'trophy'
}

import type { ImageGenerationResult } from './GeminiTypes'

export interface HandshakeState {
  uploadedImage: string | null // base64 or URL
  intentStatement: string
  visionAnalysis: string | null
  isAnalyzing: boolean
  error: string | null
}

export interface PhaseTransition {
  from: Phase
  to: Phase
  data?: Record<string, unknown>
}

export interface PromptBuilderState {
  promptStateJSON: string
  isComplete: boolean
  currentQuestionIndex: number
  totalQuestions: number
}

export interface GenerationState {
  synthesizedPrompt: string | null
  generatedImage: ImageGenerationResult | null
  isGenerating: boolean
  error: string | null
}

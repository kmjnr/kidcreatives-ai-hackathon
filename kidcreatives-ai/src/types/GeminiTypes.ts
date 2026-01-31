// Define interfaces for Gemini Vision API requests and responses
export interface GeminiVisionRequest {
  model: string
  contents: GeminiContent[]
}

export interface GeminiContent {
  parts: GeminiPart[]
}

export interface GeminiPart {
  text?: string
  inline_data?: {
    mime_type: string
    data: string // base64 encoded image
  }
}

export interface GeminiVisionResponse {
  candidates: GeminiCandidate[]
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>
  }
  finishReason: string
  index: number
}

export interface VisionAnalysisResult {
  description: string
  confidence: string
  suggestions?: string[]
}

// Gemini API Response Types (for REST API)
export interface GeminiContentPart {
  text?: string
  inlineData?: {
    data: string
    mimeType: string
  }
}

export interface GeminiContentResponse {
  parts: GeminiContentPart[]
  role?: string
}

export interface GeminiCandidateResponse {
  content: GeminiContentResponse
  finishReason?: string
  index?: number
  safetyRatings?: Array<{
    category: string
    probability: string
  }>
}

export interface GeminiResponse {
  candidates: GeminiCandidateResponse[]
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }
}

// Reserved for future configuration options when gemini-2.5-flash-image supports them
// Currently unused - gemini-2.5-flash-image doesn't accept configuration parameters
export interface ImageGenerationConfig {
  sampleCount?: number // 1-4, default 4
  imageSize?: '1K' | '2K' // default '1K'
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' // default '1:1'
  personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all' // default 'allow_adult'
}

// Imagen API response
export interface ImageGenerationResult {
  imageBytes: string // base64 encoded PNG
  mimeType: string // 'image/png'
  prompt: string // The synthesized prompt used
}

/**
 * Result from Gemini image editing operation
 */
export interface ImageEditResult {
  imageBytes: string // base64 encoded PNG
  mimeType: string // 'image/png'
  editPrompt: string // The edit instruction used
  originalImage: string // base64 of image that was edited
}

/**
 * Edit history entry for tracking refinement iterations
 */
export interface EditHistoryEntry {
  id: string // unique identifier
  editPrompt: string // what the child asked for
  resultImage: string // base64 of edited image
  timestamp: number // when edit was made
  sparkyResponse: string // Sparky's comment on the edit
}

// Error response from Imagen API
export interface ImageGenerationError {
  error: {
    code: number
    message: string
    status: string
  }
}

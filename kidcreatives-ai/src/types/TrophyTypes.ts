/**
 * Stats extracted from PromptStateJSON for trophy display
 */
export interface TrophyStats {
  totalQuestions: number
  totalEdits: number
  timeSpent: number // in seconds
  variablesUsed: string[] // List of prompt variables defined
  creativityScore: number // 1-100 based on answer diversity
  promptLength: number // Length of synthesized prompt
}

/**
 * Options for PDF generation
 */
export interface PDFOptions {
  childName: string
  creationDate: Date
  finalImage: string // base64
  originalImage: string // base64
  synthesizedPrompt: string
  stats: TrophyStats
}

/**
 * Holo-card display data
 */
export interface HoloCardData {
  finalImage: string // base64
  stats: TrophyStats
  intentStatement: string
  creationDate: Date
}

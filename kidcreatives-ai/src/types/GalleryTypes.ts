import type { TrophyStats } from './TrophyTypes'

/**
 * Gallery item representing a saved creation
 */
export interface GalleryItem {
  id: string // UUID
  createdAt: number // timestamp
  refinedImage: string // base64
  originalImage: string // base64
  promptStateJSON: string // JSON string
  intentStatement: string
  stats: TrophyStats
  certificatePDF: string // base64 PDF data
  thumbnail: string // base64 thumbnail (scaled down version)
  promptCardURL?: string // NEW: Optional URL to prompt card PNG
}

/**
 * Quick stats for gallery card display
 */
export interface GalleryStats {
  editCount: number
  variablesUsed: number
  creationDate: string // formatted date
}

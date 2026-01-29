import { supabase } from './client'
import { uploadImage, uploadPDF, deleteFile } from './storage'
import { extractStats } from '@/lib/statsExtractor'
import type { GalleryItem } from '@/types/GalleryTypes'
import type { TrophyStats } from '@/types/TrophyTypes'

interface CreateCreationInput {
  refinedImage: string // base64
  originalImage: string // base64
  thumbnail: string // base64
  certificatePDF: string // base64
  intentStatement: string
  promptStateJSON: string
  stats: TrophyStats
}

/**
 * Save a new creation to Supabase
 */
export async function saveCreation(
  userId: string,
  creation: CreateCreationInput
): Promise<string> {
  try {
    // Generate unique creation ID
    const creationId = crypto.randomUUID()

    // Upload files to storage
    const [refinedImageUrl, originalImageUrl, thumbnailUrl, certificateUrl] = await Promise.all([
      uploadImage(creation.refinedImage, 'creation-images', `${userId}/${creationId}/refined.jpg`),
      uploadImage(creation.originalImage, 'creation-images', `${userId}/${creationId}/original.jpg`),
      uploadImage(creation.thumbnail, 'creation-thumbnails', `${userId}/${creationId}/thumb.jpg`),
      uploadPDF(creation.certificatePDF, `${userId}/${creationId}/certificate.pdf`)
    ])

    // Parse prompt state to extract stats
    const promptState = JSON.parse(creation.promptStateJSON)
    const variablesUsed = promptState.variables?.length || 0

    // Insert creation record
    const { error: creationError } = await supabase
      .from('creations')
      .insert({
        id: creationId,
        user_id: userId,
        refined_image_url: refinedImageUrl,
        original_image_url: originalImageUrl,
        thumbnail_url: thumbnailUrl,
        certificate_pdf_url: certificateUrl,
        intent_statement: creation.intentStatement,
        prompt_state_json: promptState
      })

    if (creationError) throw creationError

    // Insert stats record
    const { error: statsError } = await supabase
      .from('creation_stats')
      .insert({
        creation_id: creationId,
        edit_count: creation.stats.totalEdits || 0,
        variables_used: variablesUsed,
        time_spent_seconds: creation.stats.timeSpent || 0
      })

    if (statsError) throw statsError

    return creationId
  } catch (error) {
    console.error('Save creation error:', error)
    throw new Error(`Failed to save creation: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all creations for a user
 */
export async function getCreations(userId: string): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('creations')
      .select(`
        *,
        creation_stats (
          edit_count,
          variables_used,
          time_spent_seconds
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform to GalleryItem format
    return data.map(item => {
      const promptState = item.prompt_state_json
      const dbStats = item.creation_stats?.[0]
      
      // Use extractStats to calculate all stats correctly
      const calculatedStats = extractStats(
        promptState,
        dbStats?.edit_count || 0
      )

      return {
        id: item.id,
        createdAt: new Date(item.created_at).getTime(),
        refinedImage: item.refined_image_url,
        originalImage: item.original_image_url,
        thumbnail: item.thumbnail_url,
        promptStateJSON: JSON.stringify(promptState),
        intentStatement: item.intent_statement,
        certificatePDF: item.certificate_pdf_url,
        stats: calculatedStats
      }
    })
  } catch (error) {
    console.error('Get creations error:', error)
    throw new Error(`Failed to load creations: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a creation and its associated files
 */
export async function deleteCreation(
  userId: string,
  creationId: string
): Promise<void> {
  try {
    // Delete files from storage
    await Promise.all([
      deleteFile('creation-images', `${userId}/${creationId}/refined.jpg`),
      deleteFile('creation-images', `${userId}/${creationId}/original.jpg`),
      deleteFile('creation-thumbnails', `${userId}/${creationId}/thumb.jpg`),
      deleteFile('creation-certificates', `${userId}/${creationId}/certificate.pdf`)
    ])

    // Delete database records (cascade will handle creation_stats)
    const { error } = await supabase
      .from('creations')
      .delete()
      .eq('id', creationId)
      .eq('user_id', userId) // Ensure user owns the creation

    if (error) throw error
  } catch (error) {
    console.error('Delete creation error:', error)
    throw new Error(`Failed to delete creation: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

import { useState, useEffect, useCallback } from 'react'
import type { GalleryItem } from '@/types/GalleryTypes'
import type { TrophyStats } from '@/types/TrophyTypes'
import { useAuth } from '@/contexts/AuthContext'
import { getCreations, saveCreation, deleteCreation } from '@/lib/supabase/galleryService'

export function useGallery() {
  const { user } = useAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGallery = useCallback(async () => {
    if (!user) {
      setItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const galleryItems = await getCreations(user.id)
      setItems(galleryItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
      console.error('Error loading gallery:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const addToGallery = useCallback(async (item: {
    refinedImage: string
    originalImage: string
    thumbnail: string
    certificatePDF: string
    promptCardPNG?: Blob // NEW: Optional prompt card PNG blob
    intentStatement: string
    promptStateJSON: string
    stats: TrophyStats
  }) => {
    if (!user) {
      throw new Error('Must be logged in to save creations')
    }

    try {
      setError(null)
      await saveCreation(user.id, item)
      await loadGallery() // Refresh gallery
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to gallery')
      throw err
    }
  }, [user, loadGallery])

  const removeFromGallery = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('Must be logged in to delete creations')
    }

    try {
      setError(null)
      await deleteCreation(user.id, id)
      await loadGallery() // Refresh gallery
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete from gallery')
      throw err
    }
  }, [user, loadGallery])

  const refreshGallery = useCallback(() => {
    loadGallery()
  }, [loadGallery])

  useEffect(() => {
    loadGallery()
  }, [loadGallery])

  return {
    items,
    isLoading,
    error,
    addToGallery,
    removeFromGallery,
    refreshGallery
  }
}

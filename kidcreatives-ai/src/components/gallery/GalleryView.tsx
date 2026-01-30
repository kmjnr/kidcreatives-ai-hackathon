import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Award } from 'lucide-react'
import { useGallery } from '@/hooks/useGallery'
import { GalleryHeader } from './GalleryHeader'
import { GalleryCard } from './GalleryCard'
import { EmptyGalleryState } from './EmptyGalleryState'
import type { GalleryItem } from '@/types/GalleryTypes'

interface GalleryViewProps {
  onClose: () => void
}

export function GalleryView({ onClose }: GalleryViewProps) {
  const { items, isLoading, error, removeFromGallery } = useGallery()
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  // Keyboard navigation: Escape key to close modal or gallery
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null)
        } else {
          onClose()
        }
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedItem, onClose])

  const handleDelete = (id: string) => {
    try {
      removeFromGallery(id)
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a')
    link.href = base64
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPDF = (base64PDF: string, filename: string) => {
    const link = document.createElement('a')
    link.href = base64PDF
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPromptCard = (url: string, filename: string) => {
    // Fetch the image and download as blob to force download instead of opening
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        try {
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } finally {
          URL.revokeObjectURL(blobUrl) // Always revoke to prevent memory leak
        }
      })
      .catch(error => {
        console.error('Download failed:', error)
        // Fallback: try direct download
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
  }

  const formatFilename = (item: GalleryItem, extension: string): string => {
    const date = new Date(item.createdAt).toISOString().split('T')[0]
    const intent = item.intentStatement
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30)
    return `kidcreatives-${intent}-${date}.${extension}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <GalleryHeader itemCount={items.length} onClose={onClose} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-system-grey text-xl">Loading gallery...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-500 text-xl">{error}</div>
          </div>
        ) : items.length === 0 ? (
          <EmptyGalleryState onCreateNow={onClose} />
        ) : (
          <div className="p-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {items.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onViewDetails={setSelectedItem}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Modal for viewing details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-system-grey/20">
                <h2 className="text-2xl font-bold text-subject-blue">
                  {selectedItem.intentStatement}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-system-grey/10 transition-colors"
                >
                  <X size={24} className="text-system-grey" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image */}
                <div className="mb-6">
                  <img
                    src={selectedItem.refinedImage}
                    alt={selectedItem.intentStatement}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-subject-blue/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-subject-blue">
                      {selectedItem.stats.totalQuestions}
                    </div>
                    <div className="text-sm text-system-grey">Questions</div>
                  </div>
                  <div className="bg-variable-purple/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-variable-purple">
                      {selectedItem.stats.totalEdits}
                    </div>
                    <div className="text-sm text-system-grey">Edits</div>
                  </div>
                  <div className="bg-context-orange/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-context-orange">
                      {selectedItem.stats.variablesUsed.length}
                    </div>
                    <div className="text-sm text-system-grey">Variables</div>
                  </div>
                  <div className="bg-action-green/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-action-green">
                      {selectedItem.stats.creativityScore}
                    </div>
                    <div className="text-sm text-system-grey">Creativity</div>
                  </div>
                  <div className="bg-system-grey/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-system-grey">
                      {Math.round(selectedItem.stats.timeSpent / 60)}m
                    </div>
                    <div className="text-sm text-system-grey">Time Spent</div>
                  </div>
                  <div className="bg-subject-blue/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-subject-blue">
                      {selectedItem.stats.promptLength}
                    </div>
                    <div className="text-sm text-system-grey">Prompt Length</div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() =>
                      downloadImage(
                        selectedItem.refinedImage,
                        formatFilename(selectedItem, 'png')
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-subject-blue text-white rounded-lg hover:bg-subject-blue/90 transition-colors"
                  >
                    <Download size={20} />
                    <span>Image</span>
                  </button>
                  <button
                    onClick={() =>
                      downloadPDF(
                        selectedItem.certificatePDF,
                        formatFilename(selectedItem, 'pdf')
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-variable-purple text-white rounded-lg hover:bg-variable-purple/90 transition-colors"
                  >
                    <Download size={20} />
                    <span>Certificate</span>
                  </button>
                  {selectedItem.promptCardURL && (
                    <button
                      onClick={() => {
                        if (selectedItem.promptCardURL) {
                          downloadPromptCard(
                            selectedItem.promptCardURL,
                            formatFilename(selectedItem, 'card.png')
                          )
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-context-orange text-white rounded-lg hover:bg-context-orange/90 transition-colors"
                    >
                      <Award size={20} />
                      <span>Card</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

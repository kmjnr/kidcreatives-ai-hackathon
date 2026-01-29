import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sparky } from '@/components/ui/Sparky'
import { EditHistory } from '@/components/ui/EditHistory'
import { ImageComparison } from '@/components/ui/ImageComparison'
import { useGeminiEdit } from '@/hooks/useGeminiEdit'

const MAX_EDIT_LENGTH = 150

interface RefinementPhaseProps {
  generatedImage: string // base64 from Phase 3
  imageMimeType: string
  originalImage: string // base64 of original sketch
  onBack: () => void
  onNext: (finalImageBase64: string, editCount: number) => void // Task 13: Add editCount parameter
}

export function RefinementPhase({
  generatedImage,
  imageMimeType,
  onBack,
  onNext
}: RefinementPhaseProps) {
  const [editPrompt, setEditPrompt] = useState('')
  const [sparkyMessage, setSparkyMessage] = useState('')
  const [beforeImage, setBeforeImage] = useState(generatedImage)
  
  const { currentImage, editHistory, isEditing, error, edit, editCount } = useGeminiEdit()

  // Initialize Sparky message
  useEffect(() => {
    setSparkyMessage(
      "Your artwork looks amazing! Want to make any changes? Tell me what you'd like to adjust!"
    )
  }, [])

  // Update Sparky message based on editing state
  useEffect(() => {
    if (isEditing) {
      setSparkyMessage("I'm making those changes for you! Just a moment...")
    } else if (error) {
      setSparkyMessage("Hmm, that didn't work. Can you try describing the change differently?")
    } else if (editCount > 0) {
      const encouragement = [
        "Great change! Want to adjust anything else?",
        "Looking better! Any other tweaks?",
        "Nice! What else would you like to change?",
        "Perfect! Ready to finalize, or want more changes?"
      ]
      setSparkyMessage(encouragement[Math.min(editCount - 1, encouragement.length - 1)])
    }
  }, [isEditing, error, editCount])

  const handleEditPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_EDIT_LENGTH) {
      setEditPrompt(value)
    }
  }

  const handleSubmitEdit = async () => {
    if (!editPrompt.trim() || isEditing) return

    // Use current image if exists, otherwise use generated image
    const imageToEdit = currentImage || generatedImage
    
    // Generate Sparky response for history
    const sparkyResponses = [
      "Great idea! Let me adjust that.",
      "I can do that! Watch this.",
      "Perfect! Making that change now.",
      "Nice thinking! Here we go."
    ]
    const sparkyResponse = sparkyResponses[Math.floor(Math.random() * sparkyResponses.length)]

    // Update before image for comparison
    setBeforeImage(imageToEdit)

    await edit(imageToEdit, imageMimeType, editPrompt, sparkyResponse)
    setEditPrompt('') // Clear input after submission
  }

  const handleFinalize = () => {
    // Use current edited image if exists, otherwise use original generated image
    const finalImage = currentImage || generatedImage
    onNext(finalImage, editCount) // Task 13: Pass editCount to callback
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitEdit()
    }
  }

  const canSubmitEdit = editPrompt.trim().length > 0 && !isEditing

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-variable-purple" />
            <h1 className="text-4xl font-bold text-gray-800">
              Phase 4: Perfect Your Creation! ✨
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Tell me what changes you'd like to make
          </p>
        </motion.div>

        {/* Sparky Coach */}
        <Sparky
          state={isEditing ? 'thinking' : error ? 'waiting' : 'success'}
          message={sparkyMessage}
          className="mb-8"
        />

        {/* Before/After Comparison */}
        <ImageComparison
          beforeImage={beforeImage}
          afterImage={currentImage}
          mimeType={imageMimeType}
          isLoading={isEditing}
          className="mb-8"
        />

        {/* Edit Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            What would you like to change?
          </h3>
          
          <div className="space-y-4">
            <div>
              <textarea
                value={editPrompt}
                onChange={handleEditPromptChange}
                onKeyPress={handleKeyPress}
                placeholder="Example: Make the robot's eyes glow blue, or Add a planet in the background"
                className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-variable-purple focus:outline-none resize-none text-gray-800"
                disabled={isEditing}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  {editPrompt.length}/{MAX_EDIT_LENGTH} characters
                </p>
                <Button
                  onClick={handleSubmitEdit}
                  disabled={!canSubmitEdit}
                  className="gap-2 bg-variable-purple hover:bg-purple-600 text-white"
                >
                  Apply Change
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Edit History */}
        {editHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <EditHistory history={editHistory} />
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-between items-center"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Generation
          </Button>

          <Button
            onClick={handleFinalize}
            disabled={isEditing}
            className="gap-2 bg-action-green hover:bg-green-600 text-white"
          >
            Finalize & Get Trophy
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

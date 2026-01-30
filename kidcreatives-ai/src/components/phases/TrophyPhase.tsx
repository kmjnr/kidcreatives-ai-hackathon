import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw, ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sparky } from '@/components/ui/Sparky'
import { HoloCard } from '@/components/ui/HoloCard'
import { extractStats } from '@/lib/statsExtractor'
import { generateCertificatePDF, downloadPDF } from '@/lib/pdfGenerator'
import { generateThumbnail } from '@/lib/thumbnailGenerator'
import { captureElementAsPNG } from '@/lib/cardCapture'
import { useGallery } from '@/hooks/useGallery'
import type { PromptStateJSON } from '@/types/PromptState'
import type { HoloCardData } from '@/types/TrophyTypes'

// Delay before transitioning to Phase 1 when "Create Another" is clicked
const CREATE_ANOTHER_DELAY_MS = 1000

interface TrophyPhaseProps {
  refinedImage: string // base64 from Phase 4
  originalImage: string // base64 from Phase 1
  promptStateJSON: string // JSON string from Phase 2
  intentStatement: string
  editCount?: number // Number of edits from Phase 4
  onBack: () => void
  onComplete: () => void // "Create Another" action
}

export function TrophyPhase({
  refinedImage,
  originalImage,
  promptStateJSON,
  intentStatement,
  editCount = 0,
  onBack,
  onComplete
}: TrophyPhaseProps) {
  const [childName, setChildName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [sparkyMessage, setSparkyMessage] = useState('')
  const [isSavingToGallery, setIsSavingToGallery] = useState(false)
  const [savedToGallery, setSavedToGallery] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generatedPDFBase64, setGeneratedPDFBase64] = useState<string | null>(null)
  const [isCapturingCard, setIsCapturingCard] = useState(false)

  const holoCardRef = useRef<HTMLDivElement>(null)
  const { addToGallery } = useGallery()

  // Parse prompt state and extract stats
  const { stats, holoCardData } = useMemo(() => {
    try {
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
      
      // Validate required fields
      if (!promptState.variables || !Array.isArray(promptState.variables)) {
        throw new Error('Invalid prompt state: missing or invalid variables array')
      }
      
      if (typeof promptState.startedAt !== 'number' || typeof promptState.completedAt !== 'number') {
        throw new Error('Invalid prompt state: missing or invalid timestamps')
      }
      
      const extractedStats = extractStats(promptState, editCount)
      
      const cardData: HoloCardData = {
        finalImage: refinedImage,
        stats: extractedStats,
        intentStatement,
        creationDate: new Date()
      }

      return { stats: extractedStats, holoCardData: cardData }
    } catch (error) {
      console.error('Error parsing prompt state:', error)
      const errorMessage = error instanceof Error ? error.message : 'Invalid data format'
      console.error('Validation failed:', errorMessage)
      return {
        stats: null,
        holoCardData: null
      }
    }
  }, [promptStateJSON, refinedImage, intentStatement, editCount])

  // Initialize Sparky message
  useEffect(() => {
    setSparkyMessage(
      "🎉 Amazing work! You're officially a Prompt Engineer! Look at your awesome trophy card!"
    )
  }, [])

  const handleNameSubmit = () => {
    const trimmedName = childName.trim()
    
    // Validate name: letters, numbers, spaces, hyphens, and apostrophes only
    const namePattern = /^[\w\s'-]+$/
    
    if (trimmedName.length === 0) {
      setNameError('Please enter your name')
      return
    }
    
    if (trimmedName.length > 50) {
      setNameError('Name is too long (max 50 characters)')
      return
    }
    
    if (!namePattern.test(trimmedName)) {
      setNameError('Name can only contain letters, numbers, spaces, hyphens, and apostrophes')
      return
    }
    
    // Valid name - proceed
    setNameError(null)
    setShowNameInput(false)
    setSparkyMessage(
      `Awesome, ${trimmedName}! Your certificate is ready to download. Click the button below!`
    )
  }

  const handleDownloadPDF = async () => {
    if (!stats) {
      setPdfError('Unable to generate certificate: missing stats data')
      return
    }

    setIsGeneratingPDF(true)
    setPdfError(null)

    try {
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
      const synthesizedPrompt = promptState.synthesizedPrompt || intentStatement

      const pdfBlob = await generateCertificatePDF({
        childName: childName || 'Young Creator',
        creationDate: new Date(),
        finalImage: refinedImage,
        originalImage,
        synthesizedPrompt,
        stats
      })

      // Convert blob to base64 for storage (await the FileReader operation)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })
      setGeneratedPDFBase64(base64)

      const filename = `kidcreatives-certificate-${Date.now()}.pdf`
      downloadPDF(pdfBlob, filename)

      setSparkyMessage(
        "Perfect! Your certificate is downloading. Show it to your parents and teachers!"
      )
    } catch (error) {
      console.error('PDF generation error:', error)
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF')
      setSparkyMessage(
        "Oops! Something went wrong with the certificate. But your trophy card is still amazing!"
      )
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSaveToGallery = async () => {
    if (!stats) {
      setSaveError('Unable to save: missing stats data')
      return
    }

    // Validate required data before attempting save
    if (!refinedImage || !originalImage) {
      setSaveError('Unable to save: missing image data')
      setSparkyMessage("Oops! Some images are missing. Try generating your artwork again.")
      return
    }

    if (!promptStateJSON) {
      setSaveError('Unable to save: missing prompt data')
      setSparkyMessage("Oops! Prompt data is missing. Try going back to Phase 2.")
      return
    }

    setIsSavingToGallery(true)
    setSaveError(null)
    setSparkyMessage("Preparing your artwork for the gallery...")

    try {
      // Capture HoloCard as PNG
      let promptCardBlob: Blob | undefined
      if (holoCardRef.current) {
        setIsCapturingCard(true)
        setSparkyMessage("Capturing your trophy card...")
        try {
          // Wait for animations and rendering to complete
          await new Promise(resolve => setTimeout(resolve, 500))
          
          promptCardBlob = await captureElementAsPNG(holoCardRef.current, {
            backgroundColor: '#1a1a2e',
            scale: 2
          })
          console.log('Prompt card captured successfully')
        } catch (captureError) {
          console.error('Failed to capture prompt card:', captureError)
          // Continue without prompt card if capture fails
        } finally {
          setIsCapturingCard(false)
        }
      }

      // Parse and update prompt state to ensure synthesizedPrompt and completedAt are set
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
      
      // Ensure synthesizedPrompt is set (use intentStatement as fallback)
      if (!promptState.synthesizedPrompt) {
        promptState.synthesizedPrompt = intentStatement
      }
      
      // Ensure completedAt timestamp is set for time calculation
      if (!promptState.completedAt) {
        promptState.completedAt = Date.now()
      }
      
      // Use updated prompt state JSON
      const updatedPromptStateJSON = JSON.stringify(promptState)

      // Generate thumbnail and PDF in parallel if needed
      const thumbnailPromise = generateThumbnail(refinedImage, 300)
      
      let pdfPromise: Promise<string>
      if (generatedPDFBase64) {
        pdfPromise = Promise.resolve(generatedPDFBase64)
      } else {
        setSparkyMessage("Creating your certificate...")
        const synthesizedPrompt = promptState.synthesizedPrompt || intentStatement

        pdfPromise = generateCertificatePDF({
          childName: childName || 'Young Creator',
          creationDate: new Date(),
          finalImage: refinedImage,
          originalImage,
          synthesizedPrompt,
          stats
        }).then(pdfBlob => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(pdfBlob)
          })
        }).then(pdfBase64 => {
          setGeneratedPDFBase64(pdfBase64)
          return pdfBase64
        })
      }

      // Wait for both thumbnail and PDF
      const [thumbnail, pdfBase64] = await Promise.all([thumbnailPromise, pdfPromise])

      setSparkyMessage("Uploading to your gallery...")

      // Save to gallery with updated prompt state and prompt card
      await addToGallery({
        refinedImage,
        originalImage,
        promptStateJSON: updatedPromptStateJSON,
        intentStatement,
        stats,
        certificatePDF: pdfBase64,
        thumbnail,
        promptCardPNG: promptCardBlob // NEW
      })

      setSavedToGallery(true)
      setSparkyMessage(
        "🎉 Saved to your gallery! You can view it anytime by clicking the gallery icon."
      )
    } catch (error) {
      console.error('Save to gallery error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save to gallery'
      
      // Provide user-friendly error messages
      if (errorMessage.includes('Bucket not found')) {
        setSaveError('Storage not configured. Please contact support.')
        setSparkyMessage("Oops! The storage system isn't set up yet. You can still download your certificate!")
      } else if (errorMessage.includes('Base64') || errorMessage.includes('Invalid')) {
        setSaveError('Invalid image data. Try regenerating your artwork.')
        setSparkyMessage("Oops! Something went wrong with the image. Try creating a new artwork!")
      } else {
        setSaveError(errorMessage)
        setSparkyMessage("Oops! Couldn't save to gallery. But you can still download your certificate!")
      }
    } finally {
      setIsSavingToGallery(false)
    }
  }

  const handleCreateAnother = () => {
    setSparkyMessage("Let's create another masterpiece! Starting fresh...")
    setTimeout(() => {
      onComplete()
    }, CREATE_ANOTHER_DELAY_MS)
  }

  if (!holoCardData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load trophy data</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🏆 You Did It! 🏆
          </h1>
          <p className="text-xl text-gray-600">
            You're officially a Prompt Engineer!
          </p>
        </motion.div>

        {/* Sparky Congratulations */}
        <Sparky
          state="success"
          message={sparkyMessage}
          className="mb-8"
        />

        {/* Holo-Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div ref={holoCardRef} className="inline-block">
            <HoloCard data={holoCardData} tiltEnable={!isCapturingCard} />
          </div>
        </motion.div>

        {/* Name Input or PDF Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          {showNameInput ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                What's your name?
              </h3>
              <p className="text-sm text-gray-600 text-center">
                We'll add it to your printable certificate!
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => {
                    setChildName(e.target.value)
                    setNameError(null) // Clear error on input change
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Enter your name"
                  maxLength={50}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-action-green focus:outline-none text-gray-800"
                />
                <Button
                  onClick={handleNameSubmit}
                  disabled={childName.trim().length === 0}
                  className="bg-action-green hover:bg-green-600 text-white"
                >
                  Next
                </Button>
              </div>
              
              {/* Name validation error */}
              {nameError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-red-600 text-sm text-center">{nameError}</p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                Download Your Certificate
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Print it out and show everyone your prompt engineering skills!
              </p>
              
              <div className="flex flex-col gap-3">
                {/* Download Certificate Button */}
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="gap-2 bg-subject-blue hover:bg-blue-600 text-white text-lg px-8 py-4"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Certificate
                    </>
                  )}
                </Button>

                {/* Save to Gallery Button */}
                <Button
                  onClick={handleSaveToGallery}
                  disabled={isSavingToGallery || savedToGallery || isCapturingCard}
                  className="gap-2 bg-action-green hover:bg-green-600 text-white text-lg px-8 py-4 disabled:bg-gray-400"
                >
                  {isCapturingCard ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Capturing Card...
                    </>
                  ) : isSavingToGallery ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : savedToGallery ? (
                    <>
                      <Save className="w-5 h-5" />
                      Saved to Gallery ✓
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save to Gallery
                    </>
                  )}
                </Button>
              </div>

              {pdfError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-red-600 text-sm text-center">{pdfError}</p>
                </motion.div>
              )}

              {saveError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-red-600 text-sm text-center">{saveError}</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

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
            Back to Refinement
          </Button>

          <Button
            onClick={handleCreateAnother}
            className="gap-2 bg-action-green hover:bg-green-600 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Create Another Masterpiece
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

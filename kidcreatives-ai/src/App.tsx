import { useState, useEffect } from 'react'
import { HandshakePhase } from '@/components/phases/HandshakePhase'
import { PromptBuilderPhase } from '@/components/phases/PromptBuilderPhase'
import { GenerationPhase } from '@/components/phases/GenerationPhase'
import { RefinementPhase } from '@/components/phases/RefinementPhase'
import { TrophyPhase } from '@/components/phases/TrophyPhase'
import { Phase } from '@/types/PhaseTypes'

interface PhaseData {
  originalImage: string | null
  imageMimeType: string
  intentStatement: string
  visionAnalysis: string | null
  promptStateJSON: string | null
  generatedImage: string | null
  refinedImage: string | null
  editCount: number
}

// Initial state for phase data - used on app load and "Create Another" reset
const INITIAL_PHASE_DATA: PhaseData = {
  originalImage: null,
  imageMimeType: 'image/jpeg',
  intentStatement: '',
  visionAnalysis: null,
  promptStateJSON: null,
  generatedImage: null,
  refinedImage: null,
  editCount: 0
}

function App() {
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Handshake)
  const [phaseData, setPhaseData] = useState<PhaseData>(INITIAL_PHASE_DATA)

  // Redirect to Handshake if Phase 2 is missing required data
  useEffect(() => {
    if (currentPhase === Phase.PromptBuilder && (!phaseData.originalImage || !phaseData.visionAnalysis)) {
      setCurrentPhase(Phase.Handshake)
    }
  }, [currentPhase, phaseData.originalImage, phaseData.visionAnalysis])

  // Redirect to Handshake if Phase 3 is missing required data
  useEffect(() => {
    if (currentPhase === Phase.Generation && (!phaseData.originalImage || !phaseData.promptStateJSON)) {
      setCurrentPhase(Phase.Handshake)
    }
  }, [currentPhase, phaseData.originalImage, phaseData.promptStateJSON])

  // Redirect to Handshake if Phase 4 is missing required data
  useEffect(() => {
    if (currentPhase === Phase.Refinement && (!phaseData.originalImage || !phaseData.generatedImage)) {
      setCurrentPhase(Phase.Handshake)
    }
  }, [currentPhase, phaseData.originalImage, phaseData.generatedImage])

  // Task 14: Redirect to Handshake if Phase 5 is missing required data
  useEffect(() => {
    if (currentPhase === Phase.Trophy && (!phaseData.originalImage || !phaseData.refinedImage || !phaseData.promptStateJSON)) {
      setCurrentPhase(Phase.Handshake)
    }
  }, [currentPhase, phaseData.originalImage, phaseData.refinedImage, phaseData.promptStateJSON])

  const handleHandshakeComplete = (
    image: string,
    mimeType: string,
    intent: string,
    analysis: string
  ) => {
    setPhaseData(prev => ({
      ...prev,
      originalImage: image,
      imageMimeType: mimeType,
      intentStatement: intent,
      visionAnalysis: analysis
    }))
    setCurrentPhase(Phase.PromptBuilder)
  }

  const handlePromptBuilderBack = () => {
    setCurrentPhase(Phase.Handshake)
  }

  const handlePromptBuilderComplete = (promptStateJSON: string) => {
    setPhaseData(prev => ({
      ...prev,
      promptStateJSON
    }))
    setCurrentPhase(Phase.Generation)
  }

  const handleGenerationBack = () => {
    setCurrentPhase(Phase.PromptBuilder)
  }

  const handleGenerationComplete = (generatedImageBase64: string) => {
    setPhaseData(prev => ({
      ...prev,
      generatedImage: generatedImageBase64
    }))
    setCurrentPhase(Phase.Refinement)
  }

  const handleRefinementBack = () => {
    setCurrentPhase(Phase.Generation)
  }

  // Task 12: Update handleRefinementComplete to accept editCount
  const handleRefinementComplete = (refinedImageBase64: string, editCount: number) => {
    setPhaseData(prev => ({
      ...prev,
      refinedImage: refinedImageBase64,
      editCount // Task 12: Store editCount
    }))
    setCurrentPhase(Phase.Trophy)
  }

  // Task 14: Add Trophy phase handlers
  const handleTrophyBack = () => {
    setCurrentPhase(Phase.Refinement)
  }

  const handleTrophyComplete = () => {
    // Reset to Phase 1 for "Create Another" functionality
    setPhaseData(INITIAL_PHASE_DATA)
    setCurrentPhase(Phase.Handshake)
  }

  switch (currentPhase) {
    // Task 14: Add Trophy phase case
    case Phase.Trophy:
      if (!phaseData.originalImage || !phaseData.refinedImage || !phaseData.promptStateJSON) {
        return null // Will redirect via useEffect
      }
      return (
        <TrophyPhase
          refinedImage={phaseData.refinedImage}
          originalImage={phaseData.originalImage}
          promptStateJSON={phaseData.promptStateJSON}
          intentStatement={phaseData.intentStatement}
          editCount={phaseData.editCount}
          onBack={handleTrophyBack}
          onComplete={handleTrophyComplete}
        />
      )

    case Phase.Refinement:
      if (!phaseData.originalImage || !phaseData.generatedImage) {
        return null // Will redirect via useEffect
      }
      return (
        <RefinementPhase
          generatedImage={phaseData.generatedImage}
          imageMimeType={phaseData.imageMimeType}
          originalImage={phaseData.originalImage}
          onBack={handleRefinementBack}
          onNext={handleRefinementComplete}
        />
      )

    case Phase.Generation:
      if (!phaseData.originalImage || !phaseData.promptStateJSON) {
        // Redirect handled by useEffect
        return null
      }
      return (
        <GenerationPhase
          originalImage={phaseData.originalImage}
          imageMimeType={phaseData.imageMimeType}
          promptStateJSON={phaseData.promptStateJSON}
          onBack={handleGenerationBack}
          onNext={handleGenerationComplete}
        />
      )

    case Phase.PromptBuilder:
      if (!phaseData.originalImage || !phaseData.visionAnalysis) {
        return null // Will redirect via useEffect
      }
      return (
        <PromptBuilderPhase
          originalImage={phaseData.originalImage}
          intentStatement={phaseData.intentStatement}
          visionAnalysis={phaseData.visionAnalysis}
          onBack={handlePromptBuilderBack}
          onNext={handlePromptBuilderComplete}
        />
      )
    
    case Phase.Handshake:
    default:
      return <HandshakePhase onComplete={handleHandshakeComplete} />
  }
}

export default App

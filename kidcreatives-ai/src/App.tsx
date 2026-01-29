import { useState, useEffect } from 'react'
import { HandshakePhase } from '@/components/phases/HandshakePhase'
import { PromptBuilderPhase } from '@/components/phases/PromptBuilderPhase'
import { GenerationPhase } from '@/components/phases/GenerationPhase'
import { Phase } from '@/types/PhaseTypes'

interface PhaseData {
  originalImage: string | null
  imageMimeType: string
  intentStatement: string
  visionAnalysis: string | null
  promptStateJSON: string | null
  generatedImage: string | null
}

function App() {
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Handshake)
  const [phaseData, setPhaseData] = useState<PhaseData>({
    originalImage: null,
    imageMimeType: 'image/jpeg',
    intentStatement: '',
    visionAnalysis: null,
    promptStateJSON: null,
    generatedImage: null
  })

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
    // TODO: Transition to Phase.Refinement when implemented
    if (import.meta.env.DEV) {
      console.log('Phase 3 complete! Generated image:', generatedImageBase64.substring(0, 50) + '...')
    }
  }

  switch (currentPhase) {
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

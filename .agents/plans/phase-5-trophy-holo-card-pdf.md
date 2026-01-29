# Feature: Phase 5 - Trophy with Holo-Card and PDF Generation

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Phase 5: Trophy is the culmination of the KidCreatives AI journey, where children receive tangible proof of their prompt engineering skills. This phase creates both a digital "holo-card" (3D-tilting trading card) and a printable "Smart Sheet" PDF certificate. The holo-card displays stats derived from the child's creative decisions throughout the workflow, while the PDF provides a physical artifact showing the final artwork, original sketch, the "source code" prompt they built, and their name.

This phase bridges digital and physical worlds ("phygital"), giving children something they can show parents, teachers, and friends as proof of their AI literacy learning.

## User Story

As a child aged 7-10
I want to receive a cool digital trophy card and a printable certificate
So that I can show off my AI prompt engineering skills and keep a physical record of my creation

## Problem Statement

After completing the 5-phase workflow, children need:
- **Recognition**: Tangible proof of accomplishment to build pride and motivation
- **Educational Artifact**: Physical evidence of learning for parents/educators
- **Shareability**: Something cool to show friends and family
- **Retention**: A keepsake that reinforces the learning experience

Traditional educational apps often end with a simple "Congratulations!" screen, which doesn't provide lasting value or proof of skill development. Phase 5 solves this by creating both digital and physical artifacts that children can treasure and share.

## Solution Statement

Implement a trophy phase that:
1. Displays a 3D-tilting "holo-card" with stats extracted from `Prompt_State_JSON`
2. Shows the final refined artwork prominently
3. Generates a downloadable PDF "Smart Sheet" certificate
4. Includes the child's name, creation date, and prompt engineering stats
5. Provides a "Create Another" button to encourage repeat usage
6. Celebrates the child's achievement with Sparky's congratulations

The holo-card uses mouse/device tilt effects to create an engaging, collectible feel. The PDF is print-ready with proper resolution and includes all key elements: final image, original sketch, synthesized prompt "source code", and achievement stats.

## Feature Metadata

**Feature Type**: New Capability  
**Estimated Complexity**: High  
**Primary Systems Affected**: 
- Phase components (new TrophyPhase.tsx)
- PDF generation (new pdfGenerator.ts)
- Stats extraction (new statsExtractor.ts)
- UI components (new HoloCard.tsx)

**Dependencies**: 
- jsPDF (PDF generation library)
- react-parallax-tilt (3D tilt effect)
- Existing phase patterns and data flow

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `kidcreatives-ai/src/components/phases/RefinementPhase.tsx` (lines 1-225) - Why: Phase component pattern, props structure, navigation
- `kidcreatives-ai/src/App.tsx` (lines 1-160) - Why: Phase data flow, state management, phase transitions
- `kidcreatives-ai/src/types/PromptState.ts` (lines 1-50) - Why: PromptStateJSON structure for stats extraction
- `kidcreatives-ai/src/types/PhaseTypes.ts` (lines 1-45) - Why: Phase state interfaces, need to add TrophyState
- `kidcreatives-ai/src/lib/promptSynthesis.ts` (lines 1-95) - Why: Prompt synthesis pattern for PDF display
- `kidcreatives-ai/src/components/ui/Sparky.tsx` - Why: Sparky component for congratulations

### New Files to Create

- `kidcreatives-ai/src/lib/pdfGenerator.ts` - PDF generation logic with jsPDF
- `kidcreatives-ai/src/lib/statsExtractor.ts` - Extract stats from PromptStateJSON
- `kidcreatives-ai/src/components/ui/HoloCard.tsx` - 3D-tilting trophy card component
- `kidcreatives-ai/src/components/phases/TrophyPhase.tsx` - Main Phase 5 component
- `kidcreatives-ai/src/types/TrophyTypes.ts` - Trophy-specific type definitions

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
  - Specific section: Adding images, text, and custom fonts
  - Why: Core PDF generation functionality
  
- [react-parallax-tilt](https://www.npmjs.com/package/react-parallax-tilt)
  - Specific section: Props and configuration options
  - Why: 3D tilt effect for holo-card

- [Framer Motion](https://www.framer.com/motion/)
  - Specific section: Celebration animations
  - Why: Trophy reveal animations

### Patterns to Follow

**Phase Component Pattern** (from `RefinementPhase.tsx`):
```typescript
interface PhaseProps {
  // Data from previous phases
  refinedImage: string
  originalImage: string
  promptStateJSON: string
  intentStatement: string
  // Navigation
  onBack: () => void
  onNext: () => void // Or onComplete for final phase
}

export function Phase({ refinedImage, onBack, onNext }: PhaseProps) {
  const [sparkyMessage, setSparkyMessage] = useState('')
  
  useEffect(() => {
    // Initialize phase
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[color] to-[color] p-8">
      <Sparky state="success" message={sparkyMessage} />
      {/* Main content */}
      <div className="flex justify-between">
        <Button onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}
```

**App.tsx Integration Pattern**:
```typescript
// Add to PhaseData interface
interface PhaseData {
  // ... existing fields
  trophyGenerated: boolean
}

// Add handler
const handleTrophyComplete = () => {
  setPhaseData(prev => ({ ...prev, trophyGenerated: true }))
  // Reset to Handshake for "Create Another"
  setCurrentPhase(Phase.Handshake)
}

// Add case in switch
case Phase.Trophy:
  if (!phaseData.refinedImage || !phaseData.promptStateJSON) {
    return null
  }
  return (
    <TrophyPhase
      refinedImage={phaseData.refinedImage}
      originalImage={phaseData.originalImage}
      promptStateJSON={phaseData.promptStateJSON}
      intentStatement={phaseData.intentStatement}
      onBack={handleRefinementBack}
      onComplete={handleTrophyComplete}
    />
  )
```

**Error Handling Pattern**:
```typescript
try {
  // Operation
} catch (error) {
  console.error('Operation error:', error)
  setError(error instanceof Error ? error.message : 'Operation failed')
}
```

**Naming Conventions**:
- Components: PascalCase (`TrophyPhase`, `HoloCard`)
- Utilities: camelCase (`pdfGenerator`, `statsExtractor`)
- Types: PascalCase interfaces (`TrophyStats`, `PDFOptions`)
- Files: camelCase for utilities, PascalCase for components

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Types & Stats Extraction)

Set up type definitions and utility to extract stats from PromptStateJSON.

**Tasks:**
- Define TypeScript interfaces for trophy data
- Create stats extraction utility
- Add TrophyState to PhaseTypes

### Phase 2: PDF Generation

Build PDF generation utility using jsPDF.

**Tasks:**
- Install jsPDF dependency
- Create PDF generator with layout
- Add images, text, and styling
- Handle base64 image embedding

### Phase 3: Holo-Card Component

Build 3D-tilting trophy card component.

**Tasks:**
- Install react-parallax-tilt
- Create HoloCard component
- Add stats display
- Implement tilt effect

### Phase 4: Main Trophy Phase

Assemble all pieces into TrophyPhase component.

**Tasks:**
- Create TrophyPhase component
- Integrate HoloCard
- Add PDF download button
- Implement Sparky congratulations
- Add "Create Another" functionality

### Phase 5: App Integration

Connect Phase 5 to the app's phase flow.

**Tasks:**
- Update App.tsx phase data management
- Add Phase 5 routing
- Update Phase 4 to transition to Phase 5
- Test complete 5-phase workflow

### Phase 6: Polish & Celebration

Add celebration animations and final touches.

**Tasks:**
- Add confetti or celebration animation
- Polish transitions
- Test PDF generation
- Verify all data flows correctly

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: CREATE types/TrophyTypes.ts

- **IMPLEMENT**: Trophy-specific type definitions
- **PATTERN**: Mirror existing type files structure
- **IMPORTS**: Import PromptStateJSON from './PromptState'
- **GOTCHA**: Keep types focused on trophy-specific data
- **VALIDATE**: `npm run build`

```typescript
import type { PromptStateJSON } from './PromptState'

/**
 * Stats extracted from PromptStateJSON for trophy display
 */
export interface TrophyStats {
  totalQuestions: number
  totalEdits: number
  timeSpent: number // in seconds
  variablesUsed: string[] // List of prompt variables defined
  creativity Score: number // 1-100 based on answer diversity
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
```

### Task 2: UPDATE types/PhaseTypes.ts

- **IMPLEMENT**: Add TrophyState interface
- **PATTERN**: Mirror existing phase state interfaces
- **IMPORTS**: Import TrophyStats from './TrophyTypes'
- **GOTCHA**: Trophy is final phase, no "next" state needed
- **VALIDATE**: `npm run build`

```typescript
// Add after RefinementState interface

import type { TrophyStats } from './TrophyTypes'

export interface TrophyState {
  stats: TrophyStats | null
  pdfGenerated: boolean
  isGeneratingPDF: boolean
  error: string | null
}
```

### Task 3: CREATE lib/statsExtractor.ts

- **IMPLEMENT**: Extract stats from PromptStateJSON
- **PATTERN**: Pure function, no side effects
- **IMPORTS**: Import types from '@/types/PromptState' and '@/types/TrophyTypes'
- **GOTCHA**: Handle missing or incomplete data gracefully
- **VALIDATE**: `npm run build && npm run lint`

```typescript
import type { PromptStateJSON } from '@/types/PromptState'
import type { TrophyStats } from '@/types/TrophyTypes'

/**
 * Extract trophy stats from PromptStateJSON
 * 
 * @param promptStateJSON - The complete prompt state from Phase 2
 * @param editCount - Number of edits made in Phase 4
 * @returns TrophyStats object for display
 */
export function extractStats(
  promptStateJSON: PromptStateJSON,
  editCount: number = 0
): TrophyStats {
  const { variables, startedAt, completedAt, synthesizedPrompt } = promptStateJSON

  // Calculate time spent (in seconds)
  const timeSpent = completedAt && startedAt
    ? Math.floor((completedAt - startedAt) / 1000)
    : 0

  // Extract variable names
  const variablesUsed = variables.map(v => v.variable)

  // Calculate creativity score based on answer diversity and length
  const creativityScore = calculateCreativityScore(variables)

  // Get prompt length
  const promptLength = synthesizedPrompt?.length || 0

  return {
    totalQuestions: variables.length,
    totalEdits: editCount,
    timeSpent,
    variablesUsed,
    creativityScore,
    promptLength
  }
}

/**
 * Calculate creativity score (1-100) based on answer characteristics
 */
function calculateCreativityScore(variables: PromptStateJSON['variables']): number {
  if (variables.length === 0) return 0

  // Factors: answer length, uniqueness, descriptiveness
  let score = 0

  // Base score: 20 points for completing questions
  score += 20

  // Length score: 30 points for detailed answers (avg > 20 chars)
  const avgLength = variables.reduce((sum, v) => sum + v.answer.length, 0) / variables.length
  score += Math.min(30, Math.floor(avgLength / 2))

  // Diversity score: 30 points for varied answers
  const uniqueWords = new Set(
    variables.flatMap(v => v.answer.toLowerCase().split(/\s+/))
  ).size
  score += Math.min(30, uniqueWords * 2)

  // Descriptiveness score: 20 points for using adjectives/descriptive words
  const descriptiveWords = variables.filter(v => 
    v.answer.split(/\s+/).length > 2
  ).length
  score += Math.min(20, descriptiveWords * 5)

  return Math.min(100, Math.max(1, score))
}

/**
 * Format time spent as human-readable string
 */
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}
```


### Task 4: Install Dependencies

- **IMPLEMENT**: Add jsPDF and react-parallax-tilt to package.json
- **PATTERN**: Use npm install for production dependencies
- **IMPORTS**: None (package installation)
- **GOTCHA**: Ensure compatible versions with React 18
- **VALIDATE**: `npm run build`

```bash
cd kidcreatives-ai
npm install jspdf react-parallax-tilt
npm install --save-dev @types/jspdf
```

### Task 5: CREATE lib/pdfGenerator.ts

- **IMPLEMENT**: PDF generation with jsPDF
- **PATTERN**: Async function returning blob for download
- **IMPORTS**: `import { jsPDF } from 'jspdf'`, types from '@/types/TrophyTypes'
- **GOTCHA**: jsPDF uses millimeters by default, images need proper scaling
- **VALIDATE**: `npm run build && npm run lint`

```typescript
import { jsPDF } from 'jspdf'
import type { PDFOptions } from '@/types/TrophyTypes'
import { formatTimeSpent } from './statsExtractor'

/**
 * Generate Smart Sheet PDF certificate
 * 
 * @param options - PDF generation options with images and stats
 * @returns Blob for download
 */
export async function generateCertificatePDF(options: PDFOptions): Promise<Blob> {
  const {
    childName,
    creationDate,
    finalImage,
    originalImage,
    synthesizedPrompt,
    stats
  } = options

  // Create PDF (A4 size: 210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Set up colors (using RGB for now, CMYK conversion is complex)
  const primaryColor = [74, 144, 226] // subject-blue
  const secondaryColor = [155, 89, 182] // variable-purple
  const textColor = [51, 51, 51] // dark gray

  // Title
  pdf.setFontSize(24)
  pdf.setTextColor(...primaryColor)
  pdf.text('KidCreatives AI Certificate', 105, 20, { align: 'center' })

  // Subtitle
  pdf.setFontSize(14)
  pdf.setTextColor(...textColor)
  pdf.text('Prompt Engineering Achievement', 105, 30, { align: 'center'})

  // Child's name
  pdf.setFontSize(18)
  pdf.setTextColor(...secondaryColor)
  pdf.text(`Created by: ${childName}`, 105, 45, { align: 'center' })

  // Date
  pdf.setFontSize(10)
  pdf.setTextColor(...textColor)
  pdf.text(`Date: ${creationDate.toLocaleDateString()}`, 105, 52, { align: 'center' })

  // Divider line
  pdf.setDrawColor(...primaryColor)
  pdf.setLineWidth(0.5)
  pdf.line(20, 58, 190, 58)

  // Images section
  pdf.setFontSize(12)
  pdf.setTextColor(...textColor)
  pdf.text('Your Creative Journey:', 20, 68)

  // Original sketch (left)
  try {
    const originalDataURL = `data:image/png;base64,${originalImage}`
    pdf.addImage(originalDataURL, 'PNG', 20, 72, 80, 80)
    pdf.setFontSize(9)
    pdf.text('Original Sketch', 60, 155, { align: 'center' })
  } catch (error) {
    console.error('Error adding original image:', error)
    pdf.text('Original sketch unavailable', 60, 112, { align: 'center' })
  }

  // Final artwork (right)
  try {
    const finalDataURL = `data:image/png;base64,${finalImage}`
    pdf.addImage(finalDataURL, 'PNG', 110, 72, 80, 80)
    pdf.setFontSize(9)
    pdf.text('AI-Enhanced Artwork', 150, 155, { align: 'center' })
  } catch (error) {
    console.error('Error adding final image:', error)
    pdf.text('Final artwork unavailable', 150, 112, { align: 'center' })
  }

  // Stats section
  pdf.setFontSize(12)
  pdf.setTextColor(...secondaryColor)
  pdf.text('Your Prompt Engineering Stats:', 20, 168)

  pdf.setFontSize(10)
  pdf.setTextColor(...textColor)
  const statsY = 175
  const lineHeight = 7

  pdf.text(`✓ Questions Answered: ${stats.totalQuestions}`, 25, statsY)
  pdf.text(`✓ Refinements Made: ${stats.totalEdits}`, 25, statsY + lineHeight)
  pdf.text(`✓ Time Spent: ${formatTimeSpent(stats.timeSpent)}`, 25, statsY + lineHeight * 2)
  pdf.text(`✓ Creativity Score: ${stats.creativityScore}/100`, 25, statsY + lineHeight * 3)
  pdf.text(`✓ Prompt Length: ${stats.promptLength} characters`, 25, statsY + lineHeight * 4)

  // Prompt "Source Code" section
  pdf.setFontSize(12)
  pdf.setTextColor(...primaryColor)
  pdf.text('Your AI Prompt (Source Code):', 20, 215)

  // Wrap prompt text
  pdf.setFontSize(9)
  pdf.setTextColor(...textColor)
  const promptLines = pdf.splitTextToSize(synthesizedPrompt, 170)
  pdf.text(promptLines, 20, 222)

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.text('KidCreatives AI - Teaching Prompt Engineering to Young Minds', 105, 285, { align: 'center' })
  pdf.text('This certificate proves your AI literacy skills!', 105, 290, { align: 'center' })

  // Return as blob
  return pdf.output('blob')
}

/**
 * Trigger PDF download in browser
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### Task 6: CREATE components/ui/HoloCard.tsx

- **IMPLEMENT**: 3D-tilting trophy card component
- **PATTERN**: Use react-parallax-tilt for tilt effect
- **IMPORTS**: `import Tilt from 'react-parallax-tilt'`, `import { motion } from 'framer-motion'`, types
- **GOTCHA**: Tilt effect needs proper container sizing
- **VALIDATE**: `npm run build && npm run lint`

```typescript
import { useMemo } from 'react'
import Tilt from 'react-parallax-tilt'
import { motion } from 'framer-motion'
import { Trophy, Sparkles, Clock, Edit, Zap } from 'lucide-react'
import type { HoloCardData } from '@/types/TrophyTypes'
import { formatTimeSpent } from '@/lib/statsExtractor'

interface HoloCardProps {
  data: HoloCardData
  className?: string
}

export function HoloCard({ data, className = '' }: HoloCardProps) {
  const { finalImage, stats, intentStatement, creationDate } = data

  const imageDataURL = useMemo(
    () => `data:image/png;base64,${finalImage}`,
    [finalImage]
  )

  return (
    <Tilt
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      perspective={1000}
      scale={1.05}
      transitionSpeed={2000}
      glareEnable={true}
      glareMaxOpacity={0.3}
      glareColor="#ffffff"
      glarePosition="all"
      className={className}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-md mx-auto bg-gradient-to-br from-subject-blue via-variable-purple to-context-orange rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #9B59B6 50%, #E67E22 100%)'
        }}
      >
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
        
        {/* Card content */}
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">
                Prompt Master
              </h2>
            </div>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>

          {/* Final artwork */}
          <div className="relative aspect-square bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
            <img
              src={imageDataURL}
              alt="Final artwork"
              className="w-full h-full object-contain"
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
          </div>

          {/* Intent statement */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-white/90 italic text-center">
              "{intentStatement}"
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge
              icon={<Sparkles className="w-4 h-4" />}
              label="Creativity"
              value={`${stats.creativityScore}/100`}
            />
            <StatBadge
              icon={<Edit className="w-4 h-4" />}
              label="Edits"
              value={stats.totalEdits.toString()}
            />
            <StatBadge
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={formatTimeSpent(stats.timeSpent)}
            />
            <StatBadge
              icon={<Zap className="w-4 h-4" />}
              label="Questions"
              value={stats.totalQuestions.toString()}
            />
          </div>

          {/* Date */}
          <div className="text-center">
            <p className="text-xs text-white/70">
              Created on {creationDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-300/20 rounded-tr-full" />
      </motion.div>
    </Tilt>
  )
}

interface StatBadgeProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatBadge({ icon, label, value }: StatBadgeProps) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
      <div className="text-yellow-300">{icon}</div>
      <div>
        <p className="text-xs text-white/70">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

// Add to global CSS for shine animation
// @keyframes shine {
//   to { transform: translateX(200%); }
// }
```

### Task 7: UPDATE index.css

- **IMPLEMENT**: Add shine animation for holo-card
- **PATTERN**: Add to existing animations
- **IMPORTS**: None (CSS file)
- **GOTCHA**: Place after existing animations
- **VALIDATE**: Visual check in browser

```css
/* Add to the end of kidcreatives-ai/src/index.css */

@keyframes shine {
  to {
    transform: translateX(200%);
  }
}

.animate-shine {
  animation: shine 3s ease-in-out infinite;
}
```

### Task 8: UPDATE components/ui/index.ts

- **IMPLEMENT**: Export HoloCard component
- **PATTERN**: Add to existing exports
- **IMPORTS**: None (barrel export file)
- **GOTCHA**: Maintain alphabetical order
- **VALIDATE**: `npm run build`

```typescript
// Add this export to existing file
export { HoloCard } from './HoloCard'
```


### Task 9: CREATE components/phases/TrophyPhase.tsx

- **IMPLEMENT**: Main Phase 5 component with holo-card and PDF download
- **PATTERN**: Mirror RefinementPhase structure
- **IMPORTS**: All necessary React, Framer Motion, UI components, and utilities
- **GOTCHA**: Handle PDF generation errors gracefully, provide child name input
- **VALIDATE**: `npm run build && npm run lint`

```typescript
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sparky } from '@/components/ui/Sparky'
import { HoloCard } from '@/components/ui/HoloCard'
import { extractStats } from '@/lib/statsExtractor'
import { generateCertificatePDF, downloadPDF } from '@/lib/pdfGenerator'
import type { PromptStateJSON } from '@/types/PromptState'
import type { TrophyStats, HoloCardData } from '@/types/TrophyTypes'

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
  const [sparkyMessage, setSparkyMessage] = useState('')

  // Parse prompt state and extract stats
  const { stats, holoCardData } = useMemo(() => {
    try {
      const promptState: PromptStateJSON = JSON.parse(promptStateJSON)
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
    if (childName.trim().length > 0) {
      setShowNameInput(false)
      setSparkyMessage(
        `Awesome, ${childName}! Your certificate is ready to download. Click the button below!`
      )
    }
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

  const handleCreateAnother = () => {
    setSparkyMessage("Let's create another masterpiece! Starting fresh...")
    setTimeout(() => {
      onComplete()
    }, 1000)
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
          <HoloCard data={holoCardData} />
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
                  onChange={(e) => setChildName(e.target.value)}
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
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                Download Your Certificate
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Print it out and show everyone your prompt engineering skills!
              </p>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="gap-2 bg-subject-blue hover:bg-blue-600 text-white text-lg px-8 py-6"
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
```

### Task 10: UPDATE components/phases/index.ts

- **IMPLEMENT**: Export TrophyPhase component
- **PATTERN**: Add to existing exports
- **IMPORTS**: None (barrel export file)
- **GOTCHA**: Maintain consistent export style
- **VALIDATE**: `npm run build`

```typescript
// Add this export to existing file
export { TrophyPhase } from './TrophyPhase'
```

### Task 11: UPDATE App.tsx - Add Trophy phase data tracking

- **IMPLEMENT**: Add editCount tracking for stats
- **PATTERN**: Follow existing phaseData structure
- **IMPORTS**: Import TrophyPhase component
- **GOTCHA**: Track editCount from Phase 4
- **VALIDATE**: `npm run build`

```typescript
// Update PhaseData interface (around line 8)
interface PhaseData {
  originalImage: string | null
  imageMimeType: string
  intentStatement: string
  visionAnalysis: string | null
  promptStateJSON: string | null
  generatedImage: string | null
  refinedImage: string | null
  editCount: number // ADD THIS LINE
}

// Update initial state (around line 18)
const [phaseData, setPhaseData] = useState<PhaseData>({
  originalImage: null,
  imageMimeType: 'image/jpeg',
  intentStatement: '',
  visionAnalysis: null,
  promptStateJSON: null,
  generatedImage: null,
  refinedImage: null,
  editCount: 0 // ADD THIS LINE
})
```

### Task 12: UPDATE App.tsx - Track edit count from Phase 4

- **IMPLEMENT**: Update handleRefinementComplete to track editCount
- **PATTERN**: Access editCount from RefinementPhase hook
- **IMPORTS**: None (already imported)
- **GOTCHA**: Need to pass editCount from RefinementPhase
- **VALIDATE**: `npm run build`

```typescript
// Update handleRefinementComplete (around line 95)
const handleRefinementComplete = (refinedImageBase64: string, editCount: number) => {
  setPhaseData(prev => ({
    ...prev,
    refinedImage: refinedImageBase64,
    editCount // ADD THIS LINE
  }))
  setCurrentPhase(Phase.Trophy)
}
```

### Task 13: UPDATE RefinementPhase.tsx - Pass editCount to onNext

- **IMPLEMENT**: Update onNext callback to include editCount
- **PATTERN**: Access editCount from useGeminiEdit hook
- **IMPORTS**: None (already available)
- **GOTCHA**: Update interface and handleFinalize
- **VALIDATE**: `npm run build`

```typescript
// Update RefinementPhaseProps interface (around line 12)
interface RefinementPhaseProps {
  generatedImage: string
  imageMimeType: string
  originalImage: string
  onBack: () => void
  onNext: (finalImageBase64: string, editCount: number) => void // UPDATE THIS LINE
}

// Update handleFinalize function (around line 85)
const handleFinalize = () => {
  const finalImage = currentImage || generatedImage
  onNext(finalImage, editCount) // UPDATE THIS LINE
}
```

### Task 14: UPDATE App.tsx - Add Phase 5 validation and routing

- **IMPLEMENT**: Add Trophy phase validation and routing
- **PATTERN**: Mirror existing phase validation pattern
- **IMPORTS**: Import TrophyPhase at top of file
- **GOTCHA**: Trophy is final phase, onComplete resets to Handshake
- **VALIDATE**: `npm run build && npm run lint`

```typescript
// Add import at top of file (around line 5)
import { TrophyPhase } from '@/components/phases/TrophyPhase'

// Add validation useEffect (after Phase 4 validation, around line 50)
// Redirect to Handshake if Phase 5 is missing required data
useEffect(() => {
  if (currentPhase === Phase.Trophy && (!phaseData.refinedImage || !phaseData.promptStateJSON)) {
    setCurrentPhase(Phase.Handshake)
  }
}, [currentPhase, phaseData.refinedImage, phaseData.promptStateJSON])

// Add handlers (after handleRefinementComplete, around line 105)
const handleTrophyBack = () => {
  setCurrentPhase(Phase.Refinement)
}

const handleTrophyComplete = () => {
  // Reset to Handshake for "Create Another"
  setPhaseData({
    originalImage: null,
    imageMimeType: 'image/jpeg',
    intentStatement: '',
    visionAnalysis: null,
    promptStateJSON: null,
    generatedImage: null,
    refinedImage: null,
    editCount: 0
  })
  setCurrentPhase(Phase.Handshake)
}

// Add case in switch statement (before Refinement case, around line 115)
switch (currentPhase) {
  case Phase.Trophy:
    if (!phaseData.refinedImage || !phaseData.promptStateJSON) {
      return null // Will redirect via useEffect
    }
    return (
      <TrophyPhase
        refinedImage={phaseData.refinedImage}
        originalImage={phaseData.originalImage!}
        promptStateJSON={phaseData.promptStateJSON}
        intentStatement={phaseData.intentStatement}
        editCount={phaseData.editCount}
        onBack={handleTrophyBack}
        onComplete={handleTrophyComplete}
      />
    )

  case Phase.Refinement:
    // ... existing Refinement case
```

---

## TESTING STRATEGY

### Manual Testing (Primary)

Phase 5 testing focuses on visual verification and PDF generation.

**Test Scenarios:**

1. **Complete 5-Phase Workflow**
   - Complete Phases 1-4 to reach Trophy
   - Verify holo-card displays correctly
   - Check all stats are accurate
   - Test 3D tilt effect (mouse movement)

2. **Name Input**
   - Enter name and submit
   - Verify name appears in PDF
   - Test empty name validation
   - Test max length (50 chars)

3. **PDF Generation**
   - Click download button
   - Verify PDF downloads
   - Open PDF and check:
     - Both images display correctly
     - Stats are accurate
     - Prompt text is readable
     - Layout is correct

4. **Create Another**
   - Click "Create Another" button
   - Verify returns to Phase 1
   - Verify all data is reset
   - Complete workflow again

5. **Error Handling**
   - Test with missing data (should redirect)
   - Test PDF generation failure
   - Verify error messages display

### Edge Cases

1. **Missing Data**: Navigate directly to Trophy without completing phases
   - Expected: Redirect to Handshake

2. **Invalid PromptStateJSON**: Corrupted JSON data
   - Expected: Show error message, allow back navigation

3. **PDF Generation Failure**: Network or browser issues
   - Expected: Show error, allow retry

4. **Very Long Names**: 50+ character names
   - Expected: Truncate to 50 characters

5. **No Edits Made**: editCount = 0
   - Expected: Show 0 edits in stats

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation
cd kidcreatives-ai
npm run build

# ESLint checks
npm run lint

# Type checking only
npx tsc --noEmit
```

### Level 2: Development Server

```bash
# Start dev server
npm run dev

# Verify Phase 5 accessible after Phase 4
# Manual: Complete Phases 1-4, verify Phase 5 loads
```

### Level 3: Component Rendering

```bash
# Check for console errors
# Open browser console, complete workflow, verify no errors

# Verify all UI elements present:
# - Holo-card with 3D tilt
# - Name input field
# - Download PDF button
# - Create Another button
# - Sparky congratulations
```

### Level 4: Functional Testing

```bash
# Test complete workflow
# 1. Complete Phases 1-4
# 2. Verify Trophy phase loads
# 3. Enter name
# 4. Download PDF
# 5. Open PDF and verify content
# 6. Click "Create Another"
# 7. Verify returns to Phase 1
```

### Level 5: PDF Validation

```bash
# Download generated PDF
# Open in PDF viewer
# Verify:
# - Images display correctly
# - Text is readable
# - Stats are accurate
# - Layout is professional
# - No rendering errors
```

---

## ACCEPTANCE CRITERIA

- [ ] TrophyPhase component renders after Phase 4 completion
- [ ] Holo-card displays with 3D tilt effect
- [ ] All stats extracted correctly from PromptStateJSON
- [ ] Name input accepts and validates child's name
- [ ] PDF generates with all required elements
- [ ] PDF downloads successfully in browser
- [ ] Both images (original and final) appear in PDF
- [ ] Synthesized prompt displays in PDF
- [ ] Stats display correctly in both card and PDF
- [ ] "Create Another" button resets to Phase 1
- [ ] Back button returns to Phase 4
- [ ] Loading states show during PDF generation
- [ ] Error states display user-friendly messages
- [ ] Phase 5 validates required data (redirects if missing)
- [ ] All TypeScript compilation passes
- [ ] All ESLint checks pass
- [ ] No console errors during normal operation
- [ ] Responsive design works on mobile and desktop
- [ ] 3D tilt effect works on both mouse and touch devices

---

## COMPLETION CHECKLIST

- [ ] All 14 tasks completed in order
- [ ] Dependencies installed (jsPDF, react-parallax-tilt)
- [ ] Each task validation passed immediately
- [ ] TypeScript compilation successful
- [ ] ESLint checks passed
- [ ] Development server runs without errors
- [ ] Phase 4 → Phase 5 transition works
- [ ] Holo-card displays with tilt effect
- [ ] PDF generation functional
- [ ] PDF content correct and complete
- [ ] "Create Another" resets workflow
- [ ] Manual testing confirms feature works end-to-end
- [ ] No regressions in Phases 1-4
- [ ] Code follows project conventions
- [ ] All acceptance criteria met

---

## NOTES

### Design Decisions

1. **jsPDF Over @react-pdf/renderer**
   - Rationale: Simpler API, smaller bundle size, programmatic control
   - Trade-off: Less React-like, but more flexible for custom layouts
   - jsPDF is well-established and has good TypeScript support

2. **react-parallax-tilt Over vanilla-tilt**
   - Rationale: React-native component, better integration
   - Trade-off: Slightly larger bundle, but cleaner API
   - Supports both mouse and touch/gyroscope

3. **RGB Colors in PDF (Not CMYK)**
   - Rationale: CMYK conversion is complex and requires additional libraries
   - Trade-off: Not professional print-ready, but acceptable for home printing
   - Future enhancement: Add CMYK conversion for professional printing

4. **Name Input After Trophy Display**
   - Rationale: Let child see trophy first for immediate gratification
   - Trade-off: Extra step, but better UX flow
   - Name is optional (defaults to "Young Creator")

5. **"Create Another" Resets to Phase 1**
   - Rationale: Encourages repeat usage, fresh start
   - Trade-off: Can't edit previous creation
   - Future enhancement: Save/load previous creations

### Technical Considerations

1. **PDF Image Embedding**
   - jsPDF accepts base64 images directly
   - Images are embedded, not linked (PDF is self-contained)
   - PNG format recommended for quality

2. **Stats Calculation**
   - Creativity score is heuristic-based (not ML)
   - Factors: answer length, diversity, descriptiveness
   - Score range: 1-100 for easy understanding

3. **3D Tilt Effect**
   - Works on mouse movement (desktop)
   - Works on device tilt (mobile with gyroscope)
   - Gracefully degrades if not supported

4. **Bundle Size Impact**
   - jsPDF: ~150KB gzipped
   - react-parallax-tilt: ~3KB gzipped
   - Total increase: ~153KB (acceptable for final phase)

### Known Limitations

1. **No CMYK Color Space**
   - PDFs use RGB colors
   - Not ideal for professional printing
   - Acceptable for home/school printing

2. **No PDF Editing**
   - Once generated, PDF cannot be edited
   - Must regenerate to make changes
   - Future: Add "Regenerate" button

3. **No Trophy Collection**
   - Each "Create Another" resets data
   - No history of previous creations
   - Future: Integrate Supabase for storage

4. **Fixed PDF Layout**
   - Layout is hardcoded
   - No customization options
   - Future: Add layout templates

### Integration with Supabase (Future)

Phase 5 is designed to work standalone, but can be enhanced with Supabase:
- Store trophy data for each creation
- Build a gallery of past creations
- Share trophies with unique URLs
- Track progress over time

### Future Enhancements (Post-Hackathon)

1. **Trophy Gallery**
   - Save all creations to Supabase
   - Browse past trophies
   - Compare stats over time

2. **Social Sharing**
   - Share trophy card as image
   - Generate shareable links
   - Social media integration

3. **Print Optimization**
   - CMYK color conversion
   - Higher resolution images
   - Professional print templates

4. **Customization**
   - Choose trophy card themes
   - Select PDF layouts
   - Add stickers/decorations

5. **Achievements System**
   - Unlock badges for milestones
   - Track total creations
   - Leaderboard (optional)

---

## CONFIDENCE SCORE

**8/10** for one-pass implementation success

**Strengths:**
- Clear patterns from existing phases
- Well-defined data structures
- Comprehensive type definitions
- Detailed task breakdown with code examples
- Libraries are well-documented

**Risks:**
- jsPDF image embedding might need adjustment for different image formats
- PDF layout might need tweaking for different content lengths
- 3D tilt effect might need performance optimization
- Stats calculation heuristics might need tuning

**Mitigation:**
- Test PDF generation early with real data
- Validate image embedding with PNG and JPEG
- Test tilt effect on multiple devices
- Adjust stats calculation based on testing

---

**Plan Created**: January 29, 2026  
**Estimated Implementation Time**: 2-3 hours  
**Phase Complexity**: High (PDF generation + 3D effects + stats extraction)  
**Educational Value**: Very High (tangible proof of learning, phygital bridge)

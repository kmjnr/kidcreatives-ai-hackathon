# Implementation Plan: Add Prompt Master Card PNG to Gallery

**Feature**: Save and display Prompt Master Card as PNG in gallery  
**Created**: 2026-01-30 13:13  
**Estimated Complexity**: Medium  
**Estimated Time**: 45-60 minutes  

---

## Overview

Add functionality to capture the HoloCard component as a PNG image and save it to gallery alongside the generated image and certificate PDF. Users can then download the Prompt Master Card from the gallery view.

---

## Requirements

1. ✅ Capture HoloCard component as PNG (flat state, no tilt)
2. ✅ Save PNG to Supabase Storage when "Save to Gallery" is clicked
3. ✅ Store PNG URL in database (creations table)
4. ✅ Display separate download button in gallery card
5. ✅ Maintain existing functionality (image + certificate downloads)

---

## Technical Approach

### 1. PNG Capture Strategy
**Library**: Use `html2canvas` (already installed as dependency)
- Capture the HoloCard component DOM element
- Convert to PNG blob
- Upload to Supabase Storage

### 2. Storage Location
**Bucket**: `ai-generations` (same as generated images)
**Path**: `{userId}/prompt-cards/{creationId}.png`

### 3. Database Schema Update
**Table**: `creations`
**New Column**: `prompt_card_url TEXT` (nullable for backward compatibility)

### 4. UI Changes
**Gallery Card**: Add third download button for Prompt Master Card
**Icon**: Use `Award` or `CreditCard` icon from lucide-react

---

## Implementation Tasks

### Task 1: Add Database Migration
**File**: `supabase/migrations/003_add_prompt_card_url.sql`

```sql
-- Add prompt_card_url column to creations table
ALTER TABLE creations 
ADD COLUMN prompt_card_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN creations.prompt_card_url IS 'URL to PNG screenshot of Prompt Master Card (HoloCard)';
```

**Validation**:
```bash
# Check migration file exists
ls -la supabase/migrations/003_add_prompt_card_url.sql
```

---

### Task 2: Create PNG Capture Utility
**File**: `kidcreatives-ai/src/lib/cardCapture.ts`

```typescript
import html2canvas from 'html2canvas'

/**
 * Captures a DOM element as a PNG blob
 * @param element - The DOM element to capture
 * @param options - html2canvas options
 * @returns PNG blob
 */
export async function captureElementAsPNG(
  element: HTMLElement,
  options?: {
    backgroundColor?: string
    scale?: number
    width?: number
    height?: number
  }
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: options?.backgroundColor || '#1a1a2e',
    scale: options?.scale || 2, // 2x for retina displays
    width: options?.width,
    height: options?.height,
    useCORS: true,
    allowTaint: false,
    logging: false
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      'image/png',
      1.0 // Maximum quality
    )
  })
}

/**
 * Converts blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to base64'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 3: Update Storage Service
**File**: `kidcreatives-ai/src/lib/supabase/storage.ts`

Add function to upload prompt card PNG:

```typescript
/**
 * Uploads prompt card PNG to Supabase Storage
 * @param userId - User ID for path organization
 * @param creationId - Creation ID for unique filename
 * @param pngBlob - PNG blob to upload
 * @returns Public URL of uploaded PNG
 */
export async function uploadPromptCard(
  userId: string,
  creationId: string,
  pngBlob: Blob
): Promise<string> {
  const fileName = `${userId}/prompt-cards/${creationId}.png`
  
  const { data, error } = await supabase.storage
    .from('ai-generations')
    .upload(fileName, pngBlob, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600'
    })

  if (error) {
    console.error('Error uploading prompt card:', error)
    throw new Error(`Failed to upload prompt card: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('ai-generations')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 4: Update Gallery Service
**File**: `kidcreatives-ai/src/lib/supabase/galleryService.ts`

Update `saveToGallery` function to accept and save prompt card URL:

```typescript
// Update SaveToGalleryParams interface
export interface SaveToGalleryParams {
  refinedImageBase64: string
  originalImageBase64: string
  promptStateJSON: string
  intentStatement: string
  certificatePDFBase64: string
  promptCardPNG?: Blob // NEW: Optional prompt card PNG blob
}

// Update saveToGallery function
export async function saveToGallery(params: SaveToGalleryParams): Promise<string> {
  // ... existing code ...

  // NEW: Upload prompt card if provided
  let promptCardUrl: string | null = null
  if (params.promptCardPNG) {
    try {
      promptCardUrl = await uploadPromptCard(user.id, creationId, params.promptCardPNG)
      console.log('Prompt card uploaded:', promptCardUrl)
    } catch (error) {
      console.error('Failed to upload prompt card:', error)
      // Don't fail the entire save if prompt card upload fails
    }
  }

  // ... existing upload code ...

  // Update database insert to include prompt_card_url
  const { data: creation, error: dbError } = await supabase
    .from('creations')
    .insert({
      id: creationId,
      user_id: user.id,
      refined_image_url: refinedImageUrl,
      original_image_url: originalImageUrl,
      thumbnail_url: thumbnailUrl,
      certificate_pdf_url: certificateUrl,
      prompt_card_url: promptCardUrl, // NEW
      intent_statement: params.intentStatement,
      prompt_state_json: promptState
    })
    .select()
    .single()

  // ... rest of function ...
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 5: Update GalleryItem Type
**File**: `kidcreatives-ai/src/types/GalleryTypes.ts` (create if doesn't exist)

```typescript
export interface GalleryItem {
  id: string
  createdAt: number
  refinedImage: string
  originalImage: string
  promptStateJSON: string
  intentStatement: string
  stats: TrophyStats
  certificatePDF: string
  thumbnail: string
  promptCardURL?: string // NEW: Optional for backward compatibility
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 6: Update TrophyPhase to Capture HoloCard
**File**: `kidcreatives-ai/src/components/phases/TrophyPhase.tsx`

Add ref to HoloCard and capture logic:

```typescript
import { useRef } from 'react'
import { captureElementAsPNG } from '@/lib/cardCapture'

function TrophyPhase({ ... }) {
  // ... existing state ...
  const holoCardRef = useRef<HTMLDivElement>(null)
  const [isCapturingCard, setIsCapturingCard] = useState(false)

  const handleSaveToGallery = async () => {
    if (!stats || isSaving) return

    setIsSaving(true)
    setError(null)

    try {
      // NEW: Capture HoloCard as PNG
      let promptCardBlob: Blob | undefined
      if (holoCardRef.current) {
        setIsCapturingCard(true)
        try {
          promptCardBlob = await captureElementAsPNG(holoCardRef.current, {
            backgroundColor: '#1a1a2e',
            scale: 2,
            width: 400,
            height: 600
          })
          console.log('Prompt card captured successfully')
        } catch (captureError) {
          console.error('Failed to capture prompt card:', captureError)
          // Continue without prompt card if capture fails
        } finally {
          setIsCapturingCard(false)
        }
      }

      // Generate certificate PDF
      const certificatePDF = await generateCertificatePDF(/* ... */)

      // Save to gallery with prompt card
      await saveToGallery({
        refinedImageBase64: refinedImage,
        originalImageBase64: originalImage,
        promptStateJSON,
        intentStatement,
        certificatePDFBase64: certificatePDF,
        promptCardPNG: promptCardBlob // NEW
      })

      // ... success handling ...
    } catch (err) {
      // ... error handling ...
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {/* ... existing UI ... */}
      
      {/* Add ref to HoloCard wrapper */}
      <div ref={holoCardRef} className="inline-block">
        <HoloCard
          stats={stats}
          refinedImage={refinedImage}
          tiltEnable={!isCapturingCard} // Disable tilt during capture
        />
      </div>

      {/* Update save button to show capturing state */}
      <button
        onClick={handleSaveToGallery}
        disabled={isSaving || isCapturingCard}
      >
        {isCapturingCard ? 'Capturing Card...' : isSaving ? 'Saving...' : 'Save to Gallery'}
      </button>
    </div>
  )
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 7: Update GalleryCard Component
**File**: `kidcreatives-ai/src/components/gallery/GalleryCard.tsx`

Add third download button for Prompt Master Card:

```typescript
import { Download, FileText, Award } from 'lucide-react'

function GalleryCard({ item }: { item: GalleryItem }) {
  // ... existing code ...

  const handleDownloadPromptCard = () => {
    if (!item.promptCardURL) return
    
    const link = document.createElement('a')
    link.href = item.promptCardURL
    link.download = `prompt-card-${item.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="gallery-card">
      {/* ... existing thumbnail and stats ... */}

      {/* Download buttons */}
      <div className="flex gap-2 mt-4">
        {/* Existing: Download Image */}
        <button
          onClick={handleDownloadImage}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-subject-blue text-white rounded-lg hover:bg-subject-blue/90"
          title="Download Image"
        >
          <Download size={16} />
          <span className="text-sm">Image</span>
        </button>

        {/* Existing: Download Certificate */}
        <button
          onClick={handleDownloadCertificate}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-variable-purple text-white rounded-lg hover:bg-variable-purple/90"
          title="Download Certificate"
        >
          <FileText size={16} />
          <span className="text-sm">Certificate</span>
        </button>

        {/* NEW: Download Prompt Card */}
        {item.promptCardURL && (
          <button
            onClick={handleDownloadPromptCard}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-context-orange text-white rounded-lg hover:bg-context-orange/90"
            title="Download Prompt Master Card"
          >
            <Award size={16} />
            <span className="text-sm">Card</span>
          </button>
        )}
      </div>
    </div>
  )
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 8: Update useGallery Hook
**File**: `kidcreatives-ai/src/hooks/useGallery.ts`

Ensure hook fetches and includes `prompt_card_url`:

```typescript
export function useGallery() {
  // ... existing code ...

  async function loadGallery() {
    // ... existing code ...

    const { data, error } = await supabase
      .from('creations')
      .select('*, prompt_card_url') // Ensure prompt_card_url is selected
      .order('created_at', { ascending: false })

    // ... rest of function ...
  }

  // ... rest of hook ...
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 9: Update HoloCard Component (Optional)
**File**: `kidcreatives-ai/src/components/ui/HoloCard.tsx`

Add prop to disable tilt during capture:

```typescript
interface HoloCardProps {
  stats: TrophyStats
  refinedImage: string
  tiltEnable?: boolean // NEW: Optional, defaults to true
}

function HoloCard({ stats, refinedImage, tiltEnable = true }: HoloCardProps) {
  return (
    <Tilt
      tiltEnable={tiltEnable} // Use prop to control tilt
      // ... rest of props ...
    >
      {/* ... card content ... */}
    </Tilt>
  )
}
```

**Validation**:
```bash
cd kidcreatives-ai && npm run build
```

---

### Task 10: Test Complete Workflow
**Manual Testing Checklist**:

1. ✅ Complete Phase 1-4 workflow
2. ✅ Reach Phase 5 (Trophy)
3. ✅ Verify HoloCard displays correctly
4. ✅ Click "Save to Gallery"
5. ✅ Verify "Capturing Card..." state shows briefly
6. ✅ Verify save completes successfully
7. ✅ Open Gallery
8. ✅ Verify saved creation shows 3 download buttons
9. ✅ Click "Card" button
10. ✅ Verify PNG downloads with correct filename
11. ✅ Open PNG and verify it matches HoloCard appearance
12. ✅ Verify PNG is flat (no tilt effect)
13. ✅ Test with multiple creations
14. ✅ Verify backward compatibility (old creations without prompt card)

**Validation**:
```bash
# Start dev server
cd kidcreatives-ai && npm run dev

# In browser: http://localhost:5173
# Complete full workflow and test gallery
```

---

## Files to Create

1. `supabase/migrations/003_add_prompt_card_url.sql` - Database migration
2. `kidcreatives-ai/src/lib/cardCapture.ts` - PNG capture utility
3. `kidcreatives-ai/src/types/GalleryTypes.ts` - Gallery type definitions (if doesn't exist)

## Files to Modify

1. `kidcreatives-ai/src/lib/supabase/storage.ts` - Add uploadPromptCard function
2. `kidcreatives-ai/src/lib/supabase/galleryService.ts` - Update saveToGallery
3. `kidcreatives-ai/src/components/phases/TrophyPhase.tsx` - Add capture logic
4. `kidcreatives-ai/src/components/gallery/GalleryCard.tsx` - Add download button
5. `kidcreatives-ai/src/components/ui/HoloCard.tsx` - Add tiltEnable prop
6. `kidcreatives-ai/src/hooks/useGallery.ts` - Fetch prompt_card_url

## Dependencies

- ✅ `html2canvas` - Already installed (used for PDF generation)
- ✅ `lucide-react` - Already installed (Award icon)

## Risk Assessment

**Low Risk**:
- Using existing library (html2canvas)
- Non-breaking change (optional field)
- Graceful degradation (continues if capture fails)

**Potential Issues**:
1. **Canvas rendering**: Some CSS effects may not render in canvas
   - Mitigation: Disable tilt during capture
2. **File size**: PNG may be large
   - Mitigation: Use scale: 2 (reasonable quality/size balance)
3. **Browser compatibility**: html2canvas may have issues in some browsers
   - Mitigation: Wrap in try-catch, continue without prompt card if fails

## Success Criteria

1. ✅ Prompt Master Card captured as PNG (flat state)
2. ✅ PNG saved to Supabase Storage
3. ✅ PNG URL stored in database
4. ✅ Gallery card shows 3 download buttons
5. ✅ PNG downloads with correct filename
6. ✅ PNG quality is good (2x scale)
7. ✅ Backward compatible (old creations still work)
8. ✅ No breaking changes to existing functionality

## Estimated Time Breakdown

- Task 1 (Migration): 5 minutes
- Task 2 (Capture utility): 10 minutes
- Task 3 (Storage service): 10 minutes
- Task 4 (Gallery service): 10 minutes
- Task 5 (Types): 5 minutes
- Task 6 (TrophyPhase): 15 minutes
- Task 7 (GalleryCard): 10 minutes
- Task 8 (useGallery): 5 minutes
- Task 9 (HoloCard): 5 minutes
- Task 10 (Testing): 15 minutes

**Total**: 90 minutes (1.5 hours)

---

## Notes

- PNG format chosen for simplicity and visual fidelity
- Capture happens in flat state (no tilt) for consistency
- Graceful degradation: save continues even if capture fails
- Backward compatible: old creations without prompt card still work
- Uses existing html2canvas library (no new dependencies)

---

**Status**: Ready for implementation  
**Confidence**: 9/10 (straightforward feature with existing tools)

# Implementation Plan: Contextual Question Generation

**Date**: January 30, 2026 23:42  
**Issue**: Questions are flat, repetitive, and ignore vision analysis  
**Goal**: Generate contextual questions that reference specific visual details from child's drawing

---

## Problem Statement

### Current Behavior (Broken)
- **Static Templates**: `selectQuestions()` ignores vision analysis, returns same 4 templates
- **Naive Personalization**: `personalizeQuestion()` just finds first non-stopword
- **Generic Questions**: "How does your robot feel?" regardless of drawing details
- **No Visual Proof**: Questions don't prove Sparky "sees" the drawing
- **Child's Experience**: "These questions don't match my drawing" 😢

### Desired Behavior (Fixed)
- **Dynamic Generation**: Questions generated from vision analysis + intent
- **Contextual References**: "Your robot is doing a backflip! What does its metal body feel like?"
- **Visual Proof**: Questions reference specific details (backflip, stars, metal)
- **Child's Experience**: "Sparky really sees my drawing!" 🎉

---

## Root Cause Analysis

### Current Flow (Broken)

```
1. selectQuestions(intent, visionAnalysis)
   ↓
   ❌ Ignores both parameters
   ↓
   Returns static QUESTION_TEMPLATES[0:4]
   
2. personalizeQuestion(template, intent)
   ↓
   ❌ Naive word extraction: "robot" from "A robot doing backflip"
   ↓
   Returns "How does your robot feel?"
   
3. generateSocraticQuestion(intent, vision, variable, template)
   ↓
   ⚠️ Tries to personalize but constrained by flat template
   ↓
   Returns slightly better but still generic question
```

**Result**: Generic questions that don't reference drawing specifics

### Desired Flow (Fixed)

```
1. generateContextualQuestion(intent, visionAnalysis, variable)
   ↓
   ✅ Analyzes both intent AND vision
   ↓
   ✅ Extracts specific visual details
   ↓
   ✅ Generates question referencing those details
   ↓
   Returns "Your robot is doing a backflip! What does its metal body feel like?"
```

**Result**: Contextual questions that prove Sparky "sees" the drawing

---

## Solution Design

### Strategy: Vision-Driven Question Generation

Transform from **template-based** to **generative** question system.

### Key Changes

1. **Remove static template dependency** - Generate questions dynamically
2. **Use vision analysis as primary input** - Reference specific visual details
3. **Maintain variable mapping** - Still cover Texture, Lighting, Mood, Background, Style
4. **Keep fallback templates** - For API failures only

---

## Implementation Tasks

### Task 1: Update textClient.ts - Enhanced Question Generation

**File**: `kidcreatives-ai/src/lib/gemini/textClient.ts`

**Changes**:
1. Rename `generateSocraticQuestion()` to `generateContextualQuestion()`
2. Remove `questionTemplate` parameter (no longer needed)
3. Add variable descriptions for context
4. Enhance prompt to reference specific visual details
5. Add examples for each variable type

**New Function Signature**:
```typescript
export async function generateContextualQuestion(
  intentStatement: string,
  visionAnalysis: string,
  variable: PromptVariable,
  colorCategory: 'subject' | 'variable' | 'context'
): Promise<QuestionGenerationResult>
```

**Enhanced Prompt Template**:
```typescript
const variableDescriptions = {
  texture: "how the subject feels to touch (smooth, rough, fluffy, metallic, etc.)",
  lighting: "what kind of light is in the scene (bright, dark, glowing, magical, etc.)",
  mood: "what emotion or feeling the subject has (happy, mysterious, exciting, etc.)",
  background: "where the subject is located (space, forest, city, underwater, etc.)",
  style: "what art style to use (cartoon, realistic, pixel art, watercolor, etc.)"
}

const prompt = `You are Sparky, a curious and encouraging AI art teacher for 7-10 year olds.

Context:
- The child drew: "${sanitizedIntent}"
- Visual analysis: "${sanitizedAnalysis}"

Task: Generate ONE specific question about ${variable}.

Variable definition: ${variableDescriptions[variable]}

Requirements:
1. Reference SPECIFIC visual details from the drawing (prove you see it!)
   - Mention concrete elements: "your robot's metal arms", "the stars around it", "the backflip motion"
   - Don't be generic: avoid "your creation", "your drawing", "it"
2. Ask about the ${variable} in a way that fits the drawing
3. Use simple, exciting language (Grade 2-3 level)
4. Keep under 100 characters
5. End with a question mark

Examples of GOOD questions:
- Texture: "Your robot's metal arms look cool! Are they smooth and shiny, or rough and rusty?"
- Lighting: "I see stars around your robot! Are they glowing bright like the sun, or twinkling softly?"
- Mood: "Your robot is doing a backflip! Is it feeling super excited, or brave and daring?"
- Background: "I notice your robot is in space! Should we add more planets and stars, or keep it dark?"
- Style: "Your robot drawing is awesome! Should we make it look like a cartoon or more realistic?"

Examples of BAD questions (too generic):
- "How does your creation feel?" ❌
- "What kind of light is there?" ❌
- "What is the mood?" ❌

Generate the question:`
```

**Fallback Behavior**:
```typescript
// If API fails, use simple fallback based on variable
const fallbackQuestions = {
  texture: "What does it feel like to touch? Smooth, rough, fluffy, or something else?",
  lighting: "What kind of light is shining? Bright, dark, glowing, or magical?",
  mood: "What feeling does it have? Happy, mysterious, exciting, or calm?",
  background: "Where is it? In space, a forest, a city, or somewhere else?",
  style: "What art style should we use? Cartoon, realistic, or pixel art?"
}

return {
  question: fallbackQuestions[variable] || "Tell me more about your creation!",
  variable,
  colorCategory
}
```

**Validation**:
```bash
cd kidcreatives-ai && npx tsc --noEmit
```

---

### Task 2: Update promptQuestions.ts - Remove Static Templates

**File**: `kidcreatives-ai/src/lib/promptQuestions.ts`

**Changes**:
1. Keep `QUESTION_TEMPLATES` for fallback only (mark as deprecated)
2. Update `selectQuestions()` to return variable list instead of templates
3. Remove `personalizeQuestion()` function (no longer needed)
4. Add `getVariableDescription()` helper

**New Implementation**:
```typescript
import type { PromptVariable } from '@/types/PromptState'

/**
 * Variable descriptions for question generation
 */
export const VARIABLE_DESCRIPTIONS = {
  texture: "how the subject feels to touch (smooth, rough, fluffy, metallic, etc.)",
  lighting: "what kind of light is in the scene (bright, dark, glowing, magical, etc.)",
  mood: "what emotion or feeling the subject has (happy, mysterious, exciting, etc.)",
  background: "where the subject is located (space, forest, city, underwater, etc.)",
  style: "what art style to use (cartoon, realistic, pixel art, watercolor, etc.)"
} as const

/**
 * Color categories for UI styling
 */
export const VARIABLE_COLOR_CATEGORIES: Record<PromptVariable, 'subject' | 'variable' | 'context'> = {
  [PromptVariable.Texture]: 'variable',
  [PromptVariable.Lighting]: 'context',
  [PromptVariable.Mood]: 'context',
  [PromptVariable.Background]: 'context',
  [PromptVariable.Style]: 'variable'
}

/**
 * Fallback questions (used only when API fails)
 * @deprecated Use generateContextualQuestion() instead
 */
export const FALLBACK_QUESTIONS: Record<PromptVariable, string> = {
  [PromptVariable.Texture]: "What does it feel like to touch? Smooth, rough, fluffy, or something else?",
  [PromptVariable.Lighting]: "What kind of light is shining? Bright, dark, glowing, or magical?",
  [PromptVariable.Mood]: "What feeling does it have? Happy, mysterious, exciting, or calm?",
  [PromptVariable.Background]: "Where is it? In space, a forest, a city, or somewhere else?",
  [PromptVariable.Style]: "What art style should we use? Cartoon, realistic, or pixel art?"
}

/**
 * Select which variables to ask about
 * Returns list of variables in order
 */
export function selectVariables(count: number = 4): PromptVariable[] {
  const allVariables = [
    PromptVariable.Texture,
    PromptVariable.Lighting,
    PromptVariable.Mood,
    PromptVariable.Background,
    PromptVariable.Style
  ]
  
  return allVariables.slice(0, Math.min(count, allVariables.length))
}

/**
 * Get color category for a variable (for UI styling)
 */
export function getColorCategory(variable: PromptVariable): 'subject' | 'variable' | 'context' {
  return VARIABLE_COLOR_CATEGORIES[variable] || 'variable'
}

/**
 * Get description for a variable
 */
export function getVariableDescription(variable: PromptVariable): string {
  return VARIABLE_DESCRIPTIONS[variable] || 'a creative choice'
}

/**
 * Get fallback question for a variable (used when API fails)
 */
export function getFallbackQuestion(variable: PromptVariable): string {
  return FALLBACK_QUESTIONS[variable] || "Tell me more about your creation!"
}
```

**Validation**:
```bash
cd kidcreatives-ai && npx tsc --noEmit
```

---

### Task 3: Update useGeminiText Hook - Use New Function

**File**: `kidcreatives-ai/src/hooks/useGeminiText.ts`

**Changes**:
1. Update import to use `generateContextualQuestion`
2. Remove `questionTemplate` parameter from `generateQuestion()`
3. Update function call

**Current Signature**:
```typescript
const generateQuestion = useCallback(async (
  intentStatement: string,
  visionAnalysis: string,
  variable: PromptVariable,
  questionTemplate: string,  // ❌ Remove this
  colorCategory: 'subject' | 'variable' | 'context'
) => { ... }, [])
```

**New Signature**:
```typescript
const generateQuestion = useCallback(async (
  intentStatement: string,
  visionAnalysis: string,
  variable: PromptVariable,
  colorCategory: 'subject' | 'variable' | 'context'
) => {
  setIsGenerating(true)
  setError(null)
  
  try {
    const result = await generateContextualQuestion(
      intentStatement,
      visionAnalysis,
      variable,
      colorCategory
    )
    setQuestion(result.question)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Question generation failed'
    setError(errorMessage)
    console.error('Question generation error:', err)
  } finally {
    setIsGenerating(false)
  }
}, [])
```

**Validation**:
```bash
cd kidcreatives-ai && npx tsc --noEmit
```

---

### Task 4: Update PromptBuilderPhase.tsx - Use New System

**File**: `kidcreatives-ai/src/components/phases/PromptBuilderPhase.tsx`

**Changes**:
1. Update imports: `selectVariables`, `getColorCategory` instead of `selectQuestions`, `personalizeQuestion`
2. Change state from `questions` to `variables`
3. Remove `personalizeQuestion()` calls
4. Update question generation calls

**Modified useEffect** (Initial setup):
```typescript
useEffect(() => {
  const selectedVariables = selectVariables(4)
  setVariables(selectedVariables)
  setSparkyMessage("Let's build your AI prompt together! Answer a few fun questions about your creation.")
}, [])
```

**Modified useEffect** (First question):
```typescript
useEffect(() => {
  if (variables.length > 0 && promptState.currentQuestionIndex === 0 && !question) {
    const firstVariable = variables[0]
    const colorCategory = getColorCategory(firstVariable)
    
    generateQuestion(
      intentStatement,
      visionAnalysis,
      firstVariable,
      colorCategory
    )
  }
}, [variables, promptState.currentQuestionIndex, question, intentStatement, visionAnalysis, generateQuestion])
```

**Modified useEffect** (Next questions):
```typescript
useEffect(() => {
  const currentIndex = promptState.currentQuestionIndex
  
  if (currentIndex === 0) return
  if (currentIndex >= variables.length) {
    setSparkyMessage("Awesome! You've built a complete AI prompt! Ready to see your creation come to life?")
    return
  }
  
  const nextVariable = variables[currentIndex]
  const colorCategory = getColorCategory(nextVariable)
  
  generateQuestion(
    intentStatement,
    visionAnalysis,
    nextVariable,
    colorCategory
  )
}, [promptState.currentQuestionIndex, variables, intentStatement, visionAnalysis, generateQuestion, setSparkyMessage])
```

**Validation**:
```bash
cd kidcreatives-ai && npx tsc --noEmit
```

---

### Task 5: Update Type Definitions (if needed)

**File**: `kidcreatives-ai/src/types/PromptState.ts`

**Changes**: Verify `QuestionGenerationResult` doesn't require `questionTemplate`

**Current Type**:
```typescript
export interface QuestionGenerationResult {
  question: string
  variable: PromptVariable
  colorCategory: 'subject' | 'variable' | 'context'
}
```

**Validation**: No changes needed if type is already correct.

---

## Testing Strategy

### Test Cases

#### Test 1: Simple Drawing with Clear Subject
**Input**:
- Drawing: Stick figure robot
- Intent: "A robot waving"
- Vision: "I see a robot character with one arm raised in a waving gesture"

**Expected Questions**:
- Texture: "Your robot's body looks cool! Is it smooth metal, rough rusty, or something else?"
- Lighting: "What kind of light is shining on your waving robot? Bright sunny, or glowing magical?"
- Mood: "Your robot is waving hello! Is it feeling super friendly and happy, or shy and nervous?"
- Background: "Where is your robot waving? In a city, in space, or somewhere else?"

**Verify**:
- ✅ Questions reference "robot" and "waving"
- ✅ Questions prove Sparky "sees" the drawing
- ✅ Questions are specific, not generic

#### Test 2: Complex Drawing with Multiple Elements
**Input**:
- Drawing: Robot + cat + stars
- Intent: "A robot and cat playing in space"
- Vision: "I see a robot character and a cat figure with stars scattered around them"

**Expected Questions**:
- Texture: "Your robot and cat look fun! Does the robot feel metallic and the cat feel fluffy?"
- Lighting: "I see stars around your robot and cat! Are they glowing bright or twinkling softly?"
- Mood: "Your robot and cat are playing together! Are they feeling excited and playful?"
- Background: "I notice they're in space with stars! Should we add planets too, or keep it simple?"

**Verify**:
- ✅ Questions reference multiple elements (robot, cat, stars)
- ✅ Questions acknowledge spatial relationships
- ✅ Questions are contextual to "playing in space"

#### Test 3: Abstract Drawing
**Input**:
- Drawing: Colorful swirls
- Intent: "A magical portal"
- Vision: "I see swirling patterns with multiple colors creating a circular shape"

**Expected Questions**:
- Texture: "Your magical portal's swirls look amazing! Are they smooth and flowing, or rough and jagged?"
- Lighting: "What kind of light is coming from your portal? Bright and glowing, or dark and mysterious?"
- Mood: "Your portal looks magical! Is it feeling exciting and adventurous, or mysterious and spooky?"
- Background: "Where is your magical portal? Floating in the sky, in a forest, or somewhere else?"

**Verify**:
- ✅ Questions reference "swirls", "portal", "circular shape"
- ✅ Questions work even for abstract drawings
- ✅ Questions maintain variable mapping

#### Test 4: API Failure Fallback
**Input**:
- API fails to generate question

**Expected**:
- ✅ Falls back to simple generic question
- ✅ No crash or error shown to child
- ✅ Can still complete workflow

### Validation Commands

```bash
# TypeScript compilation
cd kidcreatives-ai && npx tsc --noEmit

# ESLint check
cd kidcreatives-ai && npm run lint

# Build check
cd kidcreatives-ai && npm run build

# Dev server for manual testing
cd kidcreatives-ai && npm run dev
```

### Manual Testing Checklist

- [ ] Upload simple drawing (stick figure)
- [ ] Complete Phase 1 (Handshake)
- [ ] Observe Phase 2 questions
- [ ] Verify questions reference specific visual details
- [ ] Verify questions prove Sparky "sees" the drawing
- [ ] Test with complex drawing (multiple elements)
- [ ] Test with abstract drawing
- [ ] Verify all 4 questions are contextual
- [ ] Test fallback (simulate API failure)

---

## Risk Assessment

### Potential Issues

#### Risk 1: Gemini Generates Off-Topic Questions
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Clear prompt with examples
- Explicit variable definitions
- Fallback to generic questions if needed
- Test with various drawing types

#### Risk 2: Questions Too Long (>100 chars)
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- Prompt explicitly limits to 100 characters
- UI can handle longer questions (textarea)
- Truncate if necessary

#### Risk 3: Questions Don't Map to Variables
**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Prompt includes variable definitions
- Examples show correct mapping
- Fallback questions maintain mapping

#### Risk 4: Performance Degradation
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- Same API calls as before (no additional latency)
- Gemini 2.5 Flash is fast
- Questions generated sequentially (not all at once)

---

## Implementation Order

### Phase 1: Core Changes (30 minutes)
1. ✅ Update `textClient.ts` - Enhanced question generation
2. ✅ Update `promptQuestions.ts` - Remove static templates
3. ✅ Verify type definitions

### Phase 2: Integration (20 minutes)
4. ✅ Update `useGeminiText.ts` hook
5. ✅ Update `PromptBuilderPhase.tsx` component

### Phase 3: Testing & Polish (40 minutes)
6. ✅ Manual testing with various drawings
7. ✅ Verify contextual questions
8. ✅ Test fallback behavior
9. ✅ Update documentation

**Total Estimated Time**: 90 minutes (1 hour 30 minutes)

---

## Success Criteria

### Must Have (Critical)
- ✅ Questions reference specific visual details from drawing
- ✅ Questions prove Sparky "sees" the drawing
- ✅ Questions map to required variables (Texture, Lighting, Mood, Background, Style)
- ✅ No TypeScript errors
- ✅ No runtime errors

### Should Have (Important)
- ✅ Questions are contextual and engaging
- ✅ Questions use age-appropriate language
- ✅ Fallback questions work when API fails
- ✅ Performance unchanged

### Nice to Have (Optional)
- ✅ Questions adapt to drawing complexity
- ✅ Questions acknowledge multiple elements
- ✅ Questions maintain conversational flow

---

## Rollback Plan

If implementation fails or causes issues:

1. **Immediate Rollback**:
   ```bash
   git revert HEAD
   git push origin master
   ```

2. **Partial Rollback** (keep changes, use fallback):
   - Modify `textClient.ts` to always use fallback questions
   - Keep new structure but disable Gemini generation

3. **Debug Mode**:
   - Log generated questions
   - Compare with old template-based questions
   - Gather user feedback

---

## Documentation Updates

### Files to Update

1. **DEVLOG.md**
   - Add Session 6 with implementation details
   - Document testing results
   - Include example questions

2. **Code Comments**
   - Add JSDoc to new functions
   - Explain contextual generation approach
   - Document prompt template rationale

---

## Future Enhancements

### Post-Implementation Ideas

1. **Question Difficulty Levels**
   - Easy: Simple yes/no questions
   - Medium: Current approach
   - Hard: Open-ended creative questions

2. **Multi-Language Support**
   - Generate questions in child's language
   - Maintain age-appropriate vocabulary

3. **Question Variety**
   - Generate 2-3 options per variable
   - Let child choose which question to answer

4. **Learning Analytics**
   - Track which questions engage children most
   - Optimize prompt templates based on data

---

## Approval Checklist

Before implementation:
- [x] Problem clearly defined
- [x] Root cause identified
- [x] Solution designed
- [x] Tasks broken down
- [x] Risks assessed
- [x] Testing strategy defined
- [x] Success criteria established
- [x] Rollback plan ready

**Status**: ✅ **READY FOR IMPLEMENTATION**

---

**Plan Created**: January 30, 2026 23:42  
**Estimated Implementation Time**: 90 minutes  
**Confidence Level**: High (90%)  
**Next Step**: Execute implementation tasks 1-5

---

## Quick Reference: Key Changes

| File | Change | Lines |
|------|--------|-------|
| `textClient.ts` | Enhanced contextual generation | ~80 |
| `promptQuestions.ts` | Remove templates, add helpers | ~60 |
| `useGeminiText.ts` | Remove template parameter | ~10 |
| `PromptBuilderPhase.tsx` | Use variables instead of templates | ~20 |
| `PromptState.ts` | Verify types (no changes) | 0 |

**Total**: ~170 lines of new/modified code

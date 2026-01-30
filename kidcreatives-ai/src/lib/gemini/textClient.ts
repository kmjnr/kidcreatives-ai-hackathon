import { GoogleGenerativeAI } from '@google/generative-ai'
import type { QuestionGenerationResult, PromptVariable } from '@/types/PromptState'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is required but not set in environment variables')
}

const genAI = new GoogleGenerativeAI(API_KEY)

function sanitizeInput(input: string): string {
  return input
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/user:/gi, '')
    .trim()
}

const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  texture: "how the subject feels to touch (smooth, rough, fluffy, metallic, etc.)",
  lighting: "what kind of light is in the scene (bright, dark, glowing, magical, etc.)",
  mood: "what emotion or feeling the subject has (happy, mysterious, exciting, etc.)",
  background: "where the subject is located (space, forest, city, underwater, etc.)",
  style: "what art style to use (cartoon, realistic, pixel art, watercolor, etc.)"
}

const FALLBACK_QUESTIONS: Record<string, string> = {
  texture: "What does it feel like to touch? Smooth, rough, fluffy, or something else?",
  lighting: "What kind of light is shining? Bright, dark, glowing, or magical?",
  mood: "What feeling does it have? Happy, mysterious, exciting, or calm?",
  background: "Where is it? In space, a forest, a city, or somewhere else?",
  style: "What art style should we use? Cartoon, realistic, or pixel art?"
}

/**
 * Generate contextual question based on vision analysis
 * Questions reference specific visual details from the child's drawing
 */
export async function generateContextualQuestion(
  intentStatement: string,
  visionAnalysis: string,
  variable: PromptVariable,
  colorCategory: 'subject' | 'variable' | 'context'
): Promise<QuestionGenerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const sanitizedIntent = sanitizeInput(intentStatement)
    const sanitizedAnalysis = sanitizeInput(visionAnalysis)
    const variableKey = variable.toLowerCase()
    const variableDesc = VARIABLE_DESCRIPTIONS[variableKey] || 'a creative choice'
    
    const prompt = `You are Sparky, a curious and encouraging AI art teacher for 7-10 year olds.

Context:
- The child drew: "${sanitizedIntent}"
- Visual analysis: "${sanitizedAnalysis}"

Task: Generate ONE specific question about ${variable}.

Variable definition: ${variableDesc}

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const question = response.text().trim()

    return {
      question,
      variable,
      colorCategory
    }
  } catch (error) {
    console.error('Gemini text generation error:', error)
    
    const variableKey = variable.toLowerCase()
    const fallbackQuestion = FALLBACK_QUESTIONS[variableKey] || "Tell me more about your creation!"
    
    return {
      question: fallbackQuestion,
      variable,
      colorCategory
    }
  }
}

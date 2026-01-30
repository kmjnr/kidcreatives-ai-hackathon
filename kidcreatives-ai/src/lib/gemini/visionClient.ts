import { GoogleGenerativeAI } from '@google/generative-ai'
import type { VisionAnalysisResult } from '@/types/GeminiTypes'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is required but not set in environment variables')
}

const genAI = new GoogleGenerativeAI(API_KEY)

function sanitizeInput(input: string): string {
  // Remove potential prompt injection patterns
  return input
    .replace(/ignore previous instructions/gi, '')
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/user:/gi, '')
    .trim()
}

export async function analyzeImage(
  imageBase64: string,
  intentStatement: string,
  mimeType: string = 'image/jpeg'
): Promise<VisionAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const sanitizedIntent = sanitizeInput(intentStatement)
    const prompt = `You are Sparky, a friendly AI coach for children aged 7-10. 
A child has uploaded a drawing and says: "${sanitizedIntent}"

Analyze the image and respond in a warm, encouraging way that:
1. Confirms what you see in the drawing
2. Asks about any unclear or ambiguous parts
3. Shows excitement about their creativity
4. Uses simple, age-appropriate language

Keep your response under 100 words and be specific about what you observe.`

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ]

    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()

    return {
      description: text,
      confidence: 'high',
      suggestions: []
    }
  } catch (error) {
    console.error('Gemini Vision API error:', error)
    throw new Error(
      error instanceof Error 
        ? `Vision analysis failed: ${error.message}` 
        : 'Vision analysis failed: Unknown error'
    )
  }
}

export async function validateImageSize(file: File): Promise<boolean> {
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  return file.size <= MAX_SIZE
}

export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    const cleanup = () => {
      reader.onloadend = null
      reader.onerror = null
      reader.onabort = null
    }
    
    reader.onloadend = () => {
      cleanup()
      const base64String = reader.result as string
      // Remove data URL prefix (data:image/jpeg;base64,)
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    
    reader.onerror = (error) => {
      cleanup()
      reject(error)
    }
    
    reader.onabort = () => {
      cleanup()
      reject(new Error('File reading was aborted'))
    }
    
    reader.readAsDataURL(file)
  })
}

import type { VisionAnalysisResult, GeminiResponse, GeminiContentPart } from '@/types/GeminiTypes'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is required but not set in environment variables')
}

const GEMINI_VISION_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

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
    const sanitizedIntent = sanitizeInput(intentStatement)
    const prompt = `You are Sparky, a friendly AI coach for children aged 7-10. 
A child has uploaded a drawing and says: "${sanitizedIntent}"

Analyze the image and respond in a warm, encouraging way that:
1. Confirms what you see in the drawing
2. Asks about any unclear or ambiguous parts
3. Shows excitement about their creativity
4. Uses simple, age-appropriate language

Keep your response under 100 words and be specific about what you observe.`

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType
            }
          }
        ]
      }]
    }

    const response = await fetch(`${GEMINI_VISION_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorMessage = `Gemini Vision API error (${response.status})`
      try {
        const errorData = await response.json()
        errorMessage += `: ${errorData.error?.message || JSON.stringify(errorData)}`
      } catch {
        const errorText = await response.text()
        errorMessage += `: ${errorText}`
      }
      throw new Error(errorMessage)
    }

    const data: GeminiResponse = await response.json()

    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      throw new Error('No candidates in API response')
    }

    const candidate = data.candidates[0]
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('Invalid candidate structure in API response')
    }

    const textPart = candidate.content.parts.find(
      (part: GeminiContentPart) => part.text
    )
    if (!textPart || !textPart.text) {
      throw new Error('No text response in API result')
    }

    return {
      description: textPart.text,
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

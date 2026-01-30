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
    scale: options?.scale || 2,
    width: options?.width,
    height: options?.height,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  })

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Canvas to blob conversion timed out after 10 seconds'))
    }, 10000) // 10 second timeout

    canvas.toBlob(
      (blob) => {
        clearTimeout(timeout)
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      'image/png',
      1.0
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

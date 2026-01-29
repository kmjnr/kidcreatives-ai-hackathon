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
  // NOTE: These RGB values must match tailwind.config.js theme colors
  // subject-blue: #4A90E2 = rgb(74, 144, 226)
  // variable-purple: #9B59B6 = rgb(155, 89, 182)
  // If Tailwind colors change, update these values accordingly
  const primaryColor: [number, number, number] = [74, 144, 226] // subject-blue
  const secondaryColor: [number, number, number] = [155, 89, 182] // variable-purple
  const textColor: [number, number, number] = [51, 51, 51] // dark gray

  // Title
  pdf.setFontSize(24)
  pdf.setTextColor(...primaryColor)
  pdf.text('KidCreatives AI Certificate', 105, 20, { align: 'center' })

  // Subtitle
  pdf.setFontSize(14)
  pdf.setTextColor(...textColor)
  pdf.text('Prompt Engineering Achievement', 105, 30, { align: 'center' })

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

  // Track image loading errors
  const imageErrors: string[] = []

  // Original sketch (left)
  try {
    const originalDataURL = `data:image/png;base64,${originalImage}`
    pdf.addImage(originalDataURL, 'PNG', 20, 72, 80, 80)
    pdf.setFontSize(9)
    pdf.text('Original Sketch', 60, 155, { align: 'center' })
  } catch (error) {
    imageErrors.push('original sketch')
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
    imageErrors.push('final artwork')
    console.error('Error adding final image:', error)
    pdf.text('Final artwork unavailable', 150, 112, { align: 'center' })
  }

  // Fail if both images couldn't be loaded
  if (imageErrors.length === 2) {
    throw new Error('Failed to load both images for certificate. Cannot generate PDF without artwork.')
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

  // Wrap prompt text with vertical overflow protection
  pdf.setFontSize(9)
  pdf.setTextColor(...textColor)
  const maxPromptLines = 10 // Approximately 60mm of vertical space (222 to 282)
  const allPromptLines = pdf.splitTextToSize(synthesizedPrompt, 170)
  const promptLines = allPromptLines.slice(0, maxPromptLines)
  
  // Add ellipsis if truncated
  if (allPromptLines.length > maxPromptLines) {
    promptLines[maxPromptLines - 1] = promptLines[maxPromptLines - 1] + '...'
  }
  
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

import { supabase } from './client'

/**
 * Convert base64 string to File object
 * Uses Blob API for better memory efficiency with large files
 */
function base64ToFile(base64: string, filename: string, mimeType: string): File {
  try {
    // Validate base64 string format
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Invalid base64 string: empty or not a string')
    }

    // Handle both data URL format and raw base64
    let base64Data: string
    if (base64.startsWith('data:')) {
      // Extract base64 data from data URL (data:image/png;base64,...)
      const parts = base64.split(',')
      if (parts.length !== 2) {
        throw new Error('Invalid data URL format')
      }
      base64Data = parts[1]
    } else {
      // Assume raw base64 string
      base64Data = base64
    }

    // Validate base64 data is not empty
    if (!base64Data || base64Data.trim().length === 0) {
      throw new Error('Base64 data is empty')
    }

    // Decode base64 with error handling
    let bstr: string
    try {
      bstr = atob(base64Data)
    } catch (decodeError) {
      throw new Error(`Failed to decode base64: ${decodeError instanceof Error ? decodeError.message : 'Invalid encoding'}`)
    }

    // Convert to Uint8Array (more efficient than Array.from)
    const uint8Array = new Uint8Array(bstr.length)
    for (let i = 0; i < bstr.length; i++) {
      uint8Array[i] = bstr.charCodeAt(i)
    }

    // Create blob and file
    const blob = new Blob([uint8Array], { type: mimeType })
    return new File([blob], filename, { type: mimeType })
  } catch (error) {
    console.error('base64ToFile error:', error)
    throw new Error(`Failed to convert base64 to file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  fileOrBase64: File | string,
  bucket: 'creation-images' | 'creation-thumbnails',
  path: string
): Promise<string> {
  try {
    let file: File

    if (typeof fileOrBase64 === 'string') {
      // Convert base64 to File with validation
      const mimeType = fileOrBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
      const extension = mimeType.split('/')[1]
      
      // Add context to error messages
      try {
        file = base64ToFile(fileOrBase64, `image.${extension}`, mimeType)
      } catch (conversionError) {
        throw new Error(`Base64 conversion failed for ${bucket}/${path}: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`)
      }
    } else {
      file = fileOrBase64
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      // Add bucket context to error
      throw new Error(`Storage upload failed for ${bucket}/${path}: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload image error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check for common storage errors with helpful messages
    if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket_id')) {
      throw new Error(`Storage bucket "${bucket}" not found. Please create storage buckets in Supabase Dashboard. See SUPABASE_STATUS.md for instructions.`)
    }
    
    if (errorMessage.includes('Base64 conversion failed')) {
      throw new Error(`Invalid image data: ${errorMessage}`)
    }
    
    throw new Error(`Failed to upload image to ${bucket}: ${errorMessage}`)
  }
}

/**
 * Upload PDF to Supabase Storage
 */
export async function uploadPDF(
  pdfBase64: string,
  path: string
): Promise<string> {
  try {
    // Add validation and context to error messages
    let file: File
    try {
      file = base64ToFile(pdfBase64, 'certificate.pdf', 'application/pdf')
    } catch (conversionError) {
      throw new Error(`PDF base64 conversion failed for ${path}: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`)
    }

    const { data, error } = await supabase.storage
      .from('creation-certificates')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      // Add context to error
      throw new Error(`Storage upload failed for creation-certificates/${path}: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('creation-certificates')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload PDF error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check for common storage errors with helpful messages
    if (errorMessage.includes('Bucket not found') || errorMessage.includes('bucket_id')) {
      throw new Error('Storage bucket "creation-certificates" not found. Please create storage buckets in Supabase Dashboard. See SUPABASE_STATUS.md for instructions.')
    }
    
    if (errorMessage.includes('PDF base64 conversion failed')) {
      throw new Error(`Invalid PDF data: ${errorMessage}`)
    }
    
    throw new Error(`Failed to upload PDF: ${errorMessage}`)
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: 'creation-images' | 'creation-thumbnails' | 'creation-certificates',
  path: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  } catch (error) {
    console.error('Delete file error:', error)
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

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
  
  const { error } = await supabase.storage
    .from('creation-images')
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
    .from('creation-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(
  bucket: 'creation-images' | 'creation-thumbnails' | 'creation-certificates',
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) throw error
    if (!data?.signedUrl) throw new Error('No signed URL returned')

    return data.signedUrl
  } catch (error) {
    console.error('Get signed URL error:', error)
    throw new Error(`Failed to get signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

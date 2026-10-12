import { IMAGE_BUCKET, supabase } from './supabase'

/** Longest side after resizing: sharp on retina at the article's max width */
const MAX_SIDE = 2000
const QUALITY = 0.85

/**
 * Phone photos arrive as 5-10 MB JPEGs. Resize and re-encode to WebP in the
 * browser before upload, so pages stay fast without a server-side step.
 */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not convert the image'))),
      'image/webp',
      QUALITY,
    ),
  )
}

/** Uploads an image and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  const blob = await toWebp(file)
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Lets the user pick one image file. Resolves null if they cancel. */
export function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    input.click()
  })
}

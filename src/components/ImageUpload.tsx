import { useState, useRef, useEffect, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { uploadImage } from '@/lib/api'

export interface ImageUploadProps {
  value: string | null
  onChange: (url: string) => void
  label?: string
  aspectRatio?: number // e.g. 4/3 for Hero, 1 for Avatar, 16/9 for Cover
  cropShape?: 'rect' | 'round'
  helpText?: string
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  maxDimension: number = 1920
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  // Calculate target dimensions, scaling down if exceeds maxDimension
  let targetWidth = Math.max(1, Math.round(pixelCrop.width))
  let targetHeight = Math.max(1, Math.round(pixelCrop.height))

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const scale = Math.min(maxDimension / targetWidth, maxDimension / targetHeight)
    targetWidth = Math.max(1, Math.round(targetWidth * scale))
    targetHeight = Math.max(1, Math.round(targetHeight * scale))
  }

  canvas.width = targetWidth
  canvas.height = targetHeight

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  )

  // Export to modern WebP (85% quality: visually lossless, 80-90% smaller file size)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          // Fallback to JPEG if WebP is unsupported by browser
          canvas.toBlob(
            (fallbackBlob) => {
              if (!fallbackBlob) {
                reject(new Error('Failed to create cropped image blob'))
                return
              }
              resolve(fallbackBlob)
            },
            'image/jpeg',
            0.85
          )
        }
      },
      'image/webp',
      0.85
    )
  })
}

// Automatically compresses and downscales uncropped images (e.g. on Skip Crop)
async function optimizeImageFile(file: File, maxDimension: number = 1920): Promise<File> {
  // If already a tiny WebP/JPEG under 200KB, return as-is
  if (file.size < 200 * 1024 && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
    return file
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await createImage(objectUrl)
    let width = image.naturalWidth || image.width
    let height = image.naturalHeight || image.height

    if (width > maxDimension || height > maxDimension) {
      const scale = Math.min(maxDimension / width, maxDimension / height)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.85)
    })

    if (!blob) return file

    const baseName = file.name.replace(/\.[^/.]+$/, '')
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
  } catch (err) {
    console.warn('[Image Optimize] Fallback to original file:', err)
    return file
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  aspectRatio = 4 / 3,
  cropShape = 'rect',
  helpText,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Cropper modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [activeAspect, setActiveAspect] = useState<number | undefined>(aspectRatio)

  // Keep aspect in sync when prop changes
  useEffect(() => {
    setActiveAspect(aspectRatio)
  }, [aspectRatio])

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels)
  }, [])

  const cleanupModal = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc)
    }
    setImageSrc(null)
    setSelectedFile(null)
    setIsModalOpen(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [imageSrc])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validate size (10MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setError(`File is too large (${sizeMB}MB). Maximum allowed size is 10MB.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are supported.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setImageSrc(objectUrl)
    setSelectedFile(file)
    setActiveAspect(cropShape === 'round' ? 1 : aspectRatio)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setIsModalOpen(true)
  }

  const handleCropAndUpload = async () => {
    if (!imageSrc || !selectedFile) return
    setError('')
    setUploading(true)

    try {
      let fileToUpload: File
      const maxDim = cropShape === 'round' ? 512 : 1920

      // If croppedAreaPixels is defined and user hasn't chosen unconstrained without cropping
      if (croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0) {
        const croppedBlob = await getCroppedBlob(imageSrc, croppedAreaPixels, maxDim)
        const isWebP = croppedBlob.type === 'image/webp'
        const fileExt = isWebP ? '.webp' : '.jpg'
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '')
        fileToUpload = new File([croppedBlob], `${baseName}-cropped${fileExt}`, {
          type: croppedBlob.type,
        })
      } else {
        fileToUpload = await optimizeImageFile(selectedFile, maxDim)
      }

      const url = await uploadImage(fileToUpload)
      onChange(url)
      cleanupModal()
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSkipCrop = async () => {
    if (!selectedFile) return
    setError('')
    setUploading(true)

    try {
      const maxDim = cropShape === 'round' ? 512 : 1920
      const optimizedFile = await optimizeImageFile(selectedFile, maxDim)
      const url = await uploadImage(optimizedFile)
      onChange(url)
      cleanupModal()
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Pre-configured aspect options
  const aspectPresets: { label: string; value: number | undefined }[] =
    cropShape === 'round'
      ? [{ label: '1:1 Round', value: 1 }]
      : [
          { label: '4:3', value: 4 / 3 },
          { label: '16:9', value: 16 / 9 },
          { label: '1:1', value: 1 },
          { label: 'Free', value: undefined },
        ]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-heading-light dark:text-heading-dark">
          {label}
        </label>
        {aspectRatio && cropShape !== 'round' && (
          <span className="text-xs text-body-light/60 dark:text-body-dark/60 font-mono">
            {Math.abs(aspectRatio - 4 / 3) < 0.05
              ? '4:3 recommended'
              : Math.abs(aspectRatio - 16 / 9) < 0.05
              ? '16:9 recommended'
              : Math.abs(aspectRatio - 1) < 0.05
              ? '1:1 square'
              : ''}
          </span>
        )}
      </div>

      {value && (
        <div className="mb-3 relative inline-block group">
          <img
            src={value}
            alt={label}
            className={`w-32 h-32 object-cover border border-black/5 dark:border-white/10 ${
              cropShape === 'round' ? 'rounded-full' : 'rounded-2xl'
            }`}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remove image"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark hover:bg-page-light dark:hover:bg-page-dark transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : value ? (
            'Change Image'
          ) : (
            'Upload Image'
          )}
        </button>
        <span className="text-xs text-body-light/60 dark:text-body-dark/60">
          JPG, PNG, WebP up to 10MB
        </span>
      </div>

      {helpText && (
        <p className="text-xs text-body-light/70 dark:text-body-dark/70 mt-1.5">{helpText}</p>
      )}

      {error && !isModalOpen && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}

      {/* Cropper Modal */}
      {isModalOpen && imageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !uploading) cleanupModal()
          }}
        >
          <div className="bg-white dark:bg-[#1C1C1E] text-heading-light dark:text-heading-dark rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/10 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-medium tracking-tight">Crop & Frame {label}</h3>
                <p className="text-xs text-body-light/70 dark:text-body-dark/70 mt-0.5">
                  Drag to position • Pinch or slide to zoom • Choose aspect ratio
                </p>
              </div>
              <button
                type="button"
                onClick={cleanupModal}
                disabled={uploading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-body-light hover:text-heading-light dark:text-body-dark dark:hover:text-heading-dark hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Aspect Ratio Preset Selector */}
            {cropShape !== 'round' && (
              <div className="px-6 py-2.5 bg-gray-50/70 dark:bg-neutral-900/50 flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 flex-wrap">
                <span className="text-xs text-body-light dark:text-body-dark font-medium mr-1">
                  Ratio:
                </span>
                {aspectPresets.map((preset) => {
                  const isSelected = activeAspect === preset.value
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setActiveAspect(preset.value)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${
                        isSelected
                          ? 'bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark shadow-sm'
                          : 'bg-white dark:bg-neutral-800 text-body-light dark:text-body-dark hover:bg-gray-200 dark:hover:bg-neutral-700 border border-gray-200/70 dark:border-neutral-700'
                      }`}
                    >
                      {preset.label}
                      {preset.value === aspectRatio ? ' ★' : ''}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Cropper Container */}
            <div className="relative w-full h-[320px] sm:h-[380px] bg-neutral-950 overflow-hidden select-none">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={activeAspect}
                cropShape={cropShape}
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls & Zoom Slider */}
            <div className="px-6 py-3.5 space-y-3 bg-gray-50/50 dark:bg-neutral-900/30 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-body-light dark:text-body-dark w-12">
                  Zoom
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-neutral-700 text-xs flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  −
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-heading-light dark:accent-heading-dark h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-neutral-700 text-xs flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  +
                </button>
                <span className="text-xs font-mono text-body-light dark:text-body-dark w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#1C1C1E]">
              <button
                type="button"
                onClick={cleanupModal}
                disabled={uploading}
                className="px-4 py-2 text-sm text-body-light dark:text-body-dark hover:text-heading-light dark:hover:text-heading-dark transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkipCrop}
                  disabled={uploading}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-neutral-700 text-sm text-body-light dark:text-body-dark hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Upload original uncropped image directly"
                >
                  Skip Crop
                </button>
                <button
                  type="button"
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                  className="px-6 py-2 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Crop & Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

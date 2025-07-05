'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void
  onRemove?: (imageUrl: string) => void
  existingImages?: string[]
  maxImages?: number
  className?: string
}

interface UploadedImage {
  url: string
  uploading: boolean
  error?: string
}

export default function ImageUpload({
  onUpload,
  onRemove,
  existingImages = [],
  maxImages = 5,
  className = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map(url => ({ url, uploading: false }))
  )
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAddMore = images.length < maxImages

  const uploadFile = async (file: File) => {
    const tempId = Math.random().toString(36).substring(7)
    const tempImage: UploadedImage = {
      url: tempId,
      uploading: true
    }

    setImages(prev => [...prev, tempImage])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      setImages(prev => prev.map(img => 
        img.url === tempId 
          ? { url: result.url, uploading: false }
          : img
      ))

      onUpload(result.url)
    } catch (error) {
      console.error('Upload error:', error)
      setImages(prev => prev.map(img =>
        img.url === tempId
          ? { ...img, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
          : img
      ))
    }
  }

  const handleFileSelect = (files: FileList) => {
    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    filesToUpload.forEach(file => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type. Only JPEG, PNG, and WebP are allowed.`)
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      uploadFile(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (!canAddMore) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (canAddMore) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img.url !== imageUrl))
    if (onRemove) {
      onRemove(imageUrl)
    }
  }

  const retryUpload = (imageIndex: number) => {
    const image = images[imageIndex]
    if (image && image.error) {
      // Remove the failed image
      setImages(prev => prev.filter((_, index) => index !== imageIndex))
      
      // Trigger file input for retry
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl text-gray-400">📷</div>
            <div className="text-lg font-medium text-gray-900">
              Add Property Images
            </div>
            <div className="text-sm text-gray-500">
              Drag and drop images here, or click to select files
            </div>
            <div className="text-xs text-gray-400">
              JPEG, PNG, WebP up to 5MB • {images.length}/{maxImages} images
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.url} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {image.uploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : image.error ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600 p-2">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="text-xs text-center">{image.error}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        retryUpload(index)
                      }}
                      className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              
              {!image.uploading && !image.error && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(image.url)
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!canAddMore && (
        <div className="text-center text-sm text-gray-500 py-4">
          Maximum of {maxImages} images reached
        </div>
      )}
    </div>
  )
}
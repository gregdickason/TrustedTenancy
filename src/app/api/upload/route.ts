import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if we have the blob token, if not use local storage
    const useLocalStorage = !process.env.BLOB_READ_WRITE_TOKEN

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `property-images/${timestamp}-${randomString}.${extension}`

    if (useLocalStorage) {
      // Development: Use local file storage
      try {
        // Create public/uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Save file to public/uploads
        const filePath = join(uploadDir, filename.split('/').pop()!) // Remove 'property-images/' prefix
        await writeFile(filePath, buffer)

        // Return local URL
        const localUrl = `/uploads/${filename.split('/').pop()}`
        
        console.log(`Image uploaded locally: ${localUrl}`)
        
        return NextResponse.json({
          url: localUrl,
          filename: filename,
          size: file.size,
          type: file.type,
          storage: 'local'
        })
      } catch (uploadError) {
        console.error('Local upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload image to local storage' },
          { status: 500 }
        )
      }
    } else {
      // Production: Use Vercel Blob
      try {
        const blob = await put(filename, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        return NextResponse.json({
          url: blob.url,
          filename: filename,
          size: file.size,
          type: file.type,
          storage: 'vercel-blob'
        })
      } catch (uploadError) {
        console.error('Blob upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Note: Vercel Blob doesn't have a delete API in the free tier
    // For now, we'll just return success
    // In production, you might want to track URLs to delete and clean them up periodically
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}